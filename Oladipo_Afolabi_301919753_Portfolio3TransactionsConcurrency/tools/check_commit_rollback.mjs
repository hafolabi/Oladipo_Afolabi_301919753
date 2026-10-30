import assert from 'node:assert/strict';
import { postPayment, writePayment } from './payments.mjs';
import { getBalances, checkBalance, getPaymentCounts, resetStartingFunds, checkLedger } from './test_helpers.mjs';

const transfer = {
  reference: 'P3-COMMIT',
  type: 'transfer',
  sourceAccountNumber: '1000000001',
  destinationAccountNumber: '1000000002',
  amountMinor: 200000,
};

export async function checkCommit(sessionA, log) {
  await resetStartingFunds(sessionA, 1000000);
  const before = await getBalances(sessionA);
  log('COMMIT — A: start with Ada NGN 10,000 and Bello NGN 0.');
  await postPayment(sessionA, transfer);
  const after = await getBalances(sessionA);
  checkBalance(after, '1000000001', 800000);
  checkBalance(after, '1000000002', 200000);
  const saved = await getPaymentCounts(sessionA, transfer.reference);
  assert.deepEqual(saved, { payments: 1, entries: 2, audit_events: 1 });
  await checkLedger(sessionA);
  log('PASS: BEGIN -> transfer NGN 2,000 -> COMMIT. Ada has NGN 8,000; Bello has NGN 2,000.');
  return { before, after, saved };
}

export async function checkRollback(sessionA, sessionB, log) {
  await resetStartingFunds(sessionA, 1000000);
  const before = await getBalances(sessionA);
  const payment = { ...transfer, reference: 'P3-ROLLBACK' };
  let beforeRollback;
  let savedInside;
  let errorDetails;
  log('ROLLBACK — A: BEGIN; stage the NGN 2,000 transfer without committing.');
  await sessionA.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  try {
    await writePayment(sessionA, payment);
    beforeRollback = await getBalances(sessionA);
    savedInside = await getPaymentCounts(sessionA, payment.reference);
    checkBalance(beforeRollback, '1000000001', 800000);
    assert.deepEqual(savedInside, { payments: 1, entries: 2, audit_events: 1 });
    assert.deepEqual(await getBalances(sessionB), before);

    // Cause a real database error after writing, but before COMMIT.
    await sessionA.query('SELECT 1 / 0');
  } catch (error) {
    errorDetails = { code: error.code, message: error.message };
    await sessionA.query('ROLLBACK');
  }
  assert.equal(errorDetails?.code, '22012');
  const after = await getBalances(sessionB);
  assert.deepEqual(after, before);
  const saved = await getPaymentCounts(sessionB, payment.reference);
  assert.deepEqual(saved, { payments: 0, entries: 0, audit_events: 0 });
  await checkLedger(sessionB);
  log('PASS: division-by-zero error 22012 -> ROLLBACK. Both balances unchanged; payment, entries, and audit event removed.');
  return { before, before_rollback_in_session_a: beforeRollback, rows_inside_session_a: savedInside, error: errorDetails, after, saved };
}
