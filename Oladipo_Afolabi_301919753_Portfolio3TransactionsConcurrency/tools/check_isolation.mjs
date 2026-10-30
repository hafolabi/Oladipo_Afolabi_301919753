import assert from 'node:assert/strict';
import { writePayment } from './payments.mjs';
import { getBalances, checkBalance, resetStartingFunds, checkLedger } from './test_helpers.mjs';

export async function checkIsolation(sessionA, sessionB, log) {
  await resetStartingFunds(sessionA, 1000000);
  await sessionA.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  await sessionB.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  try {
    const isolationA = await sessionA.query('SHOW transaction_isolation');
    const isolationB = await sessionB.query('SHOW transaction_isolation');
    assert.equal(isolationA.rows[0].transaction_isolation, 'read committed');
    assert.equal(isolationB.rows[0].transaction_isolation, 'read committed');
    const firstReadB = await getBalances(sessionB);
    checkBalance(firstReadB, '1000000001', 1000000);
    log('ISOLATION — B: BEGIN READ COMMITTED; reads Ada NGN 10,000.');

    await writePayment(sessionA, {
      reference: 'P3-ISOLATION',
      type: 'transfer',
      sourceAccountNumber: '1000000001',
      destinationAccountNumber: '1000000002',
      amountMinor: 200000,
    });
    const uncommittedReadA = await getBalances(sessionA);
    checkBalance(uncommittedReadA, '1000000001', 800000);
    log('ISOLATION — A: stages transfer; sees its own new balance of NGN 8,000. No COMMIT yet.');

    const beforeCommitB = await getBalances(sessionB);
    assert.deepEqual(beforeCommitB, firstReadB);
    log('PASS: B still reads NGN 10,000; it cannot see A\'s uncommitted payment (no dirty read).');

    await sessionA.query('COMMIT');
    log('ISOLATION — A: COMMIT.');
    const afterCommitB = await getBalances(sessionB);
    checkBalance(afterCommitB, '1000000001', 800000);
    checkBalance(afterCommitB, '1000000002', 200000);
    log('PASS: B reads again in the SAME transaction and now sees NGN 8,000 (a nonrepeatable read).');
    await sessionB.query('COMMIT');
    await checkLedger(sessionB);
    return {
      isolation_level: isolationB.rows[0].transaction_isolation,
      first_read_b: firstReadB,
      uncommitted_read_a: uncommittedReadA,
      before_commit_b: beforeCommitB,
      after_commit_b_in_same_transaction: afterCommitB,
    };
  } catch (error) {
    await sessionA.query('ROLLBACK');
    await sessionB.query('ROLLBACK');
    throw error;
  }
}
