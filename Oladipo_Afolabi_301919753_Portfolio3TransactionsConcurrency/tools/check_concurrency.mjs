import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { writePayment } from './payments.mjs';
import { getBalances, checkBalance, getPaymentCounts, resetStartingFunds, checkLedger } from './test_helpers.mjs';

async function waitForAccountLock(observer, waitingPid, holdingPid) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const result = await observer.query(`
      SELECT pid, wait_event_type, wait_event, pg_blocking_pids(pid) AS blocked_by
      FROM pg_stat_activity
      WHERE pid = $1
    `, [waitingPid]);
    const activity = result.rows[0];
    if (activity?.wait_event_type === 'Lock' && activity.blocked_by.includes(holdingPid)) {
      return activity;
    }
    await setTimeout(25);
  }
  throw new Error('Session B did not appear waiting for session A within five seconds.');
}

export async function checkConcurrency(sessionA, sessionB, observer, sessionIds, log) {
  await resetStartingFunds(sessionA, 100000);
  const before = await getBalances(sessionA);
  const withdrawal = {
    reference: 'P3-WITHDRAW-A',
    type: 'withdrawal',
    sourceAccountNumber: '1000000001',
    destinationAccountNumber: '0000000000',
    amountMinor: 80000,
  };
  await sessionA.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  await writePayment(sessionA, withdrawal);
  log('LOCKING — A: locks accounts, checks NGN 1,000, and stages an NGN 800 withdrawal. Keeps the transaction open.');

  await sessionB.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  let requestBFinished = false;
  // Start B without awaiting it yet: A still owns the account lock.
  // Handle either outcome immediately so a rejected promise is not left unhandled.
  const requestB = writePayment(sessionB, { ...withdrawal, reference: 'P3-WITHDRAW-B' }).then(
    () => {
      requestBFinished = true;
      return { succeeded: true };
    },
    (error) => {
      requestBFinished = true;
      return { succeeded: false, message: error.message };
    },
  );
  log('LOCKING — B: requests the same account lock for another NGN 800 withdrawal.');

  const blocked = await waitForAccountLock(observer, sessionIds.session_b, sessionIds.session_a);
  assert.equal(requestBFinished, false);
  log(`PASS: observer confirms B (PID ${blocked.pid}) is waiting for A (PID ${sessionIds.session_a}); event ${blocked.wait_event}.`);
  await sessionA.query('COMMIT');
  log('LOCKING — A: COMMIT; releases its account locks.');

  const outcomeB = await requestB;
  // B now holds the lock, but its fresh balance check should reject the request.
  await sessionB.query('ROLLBACK');
  assert.equal(outcomeB.succeeded, false);
  assert.match(outcomeB.message, /Insufficient funds: available 20000 kobo, requested 80000 kobo/);
  log(`PASS: B obtains the lock, reads the new NGN 200 balance, and rejects the withdrawal: ${outcomeB.message}`);

  const after = await getBalances(observer);
  checkBalance(after, '1000000001', 20000);
  const savedA = await getPaymentCounts(observer, 'P3-WITHDRAW-A');
  const savedB = await getPaymentCounts(observer, 'P3-WITHDRAW-B');
  assert.deepEqual(savedA, { payments: 1, entries: 2, audit_events: 1 });
  assert.deepEqual(savedB, { payments: 0, entries: 0, audit_events: 0 });
  await checkLedger(observer);
  log('PASS: exactly one withdrawal saved, customer balance NGN 200, balanced ledger, no saved rows for B.');
  return { before, session_ids: sessionIds, observed_lock_wait: blocked, outcome_b: outcomeB, after, saved_a: savedA, saved_b: savedB };
}
