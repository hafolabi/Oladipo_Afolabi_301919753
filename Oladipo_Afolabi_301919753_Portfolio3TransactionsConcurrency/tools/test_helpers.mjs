import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { postPayment } from './payments.mjs';

const balancesSql = await readFile(new URL('../sql/show_balances.sql', import.meta.url), 'utf8');

export async function getBalances(database) {
  const result = await database.query(balancesSql);
  return result.rows;
}

export function checkBalance(balances, accountNumber, expectedMinor) {
  const account = balances.find((row) => row.account_number === accountNumber);
  assert.ok(account, `Missing account ${accountNumber}`);
  assert.equal(account.balance_minor, String(expectedMinor));
}

export async function getPaymentCounts(database, reference) {
  const result = await database.query(`
    SELECT
      (SELECT COUNT(*)::integer FROM transactions WHERE transaction_reference = $1) AS payments,
      (SELECT COUNT(*)::integer FROM transaction_entries AS entry
        JOIN transactions AS payment USING (transaction_id)
        WHERE payment.transaction_reference = $1) AS entries,
      (SELECT COUNT(*)::integer FROM audit_events AS event
        JOIN transactions AS payment USING (transaction_id)
        WHERE payment.transaction_reference = $1) AS audit_events
  `, [reference]);
  return result.rows[0];
}

export async function resetStartingFunds(database, amountMinor) {
  // This connection belongs to the NEW disposable database made by our runner.
  // Keep the customers/accounts, but give each experiment its own payment history.
  await database.query('TRUNCATE audit_events, transaction_entries, transactions RESTART IDENTITY');
  await postPayment(database, {
    reference: 'P3-STARTING-FUNDS',
    type: 'deposit',
    sourceAccountNumber: '0000000000',
    destinationAccountNumber: '1000000001',
    amountMinor,
  });
}

export async function checkLedger(database) {
  const problemsResult = await database.query(`
    SELECT payment.transaction_reference
    FROM transactions AS payment
    LEFT JOIN transaction_entries AS entry USING (transaction_id)
    GROUP BY payment.transaction_id
    HAVING payment.status <> 'posted'
      OR COUNT(entry.account_id) <> 2
      OR SUM(entry.amount_minor) <> 0
  `);
  assert.deepEqual(problemsResult.rows, []);
  const balances = await getBalances(database);
  for (const account of balances) {
    if (account.account_kind === 'customer') {
      assert.ok(BigInt(account.balance_minor) >= 0n, `Negative customer balance: ${account.account_number}`);
    }
  }
  const countsResult = await database.query(`
    SELECT
      (SELECT COUNT(*) FROM transactions) AS payments,
      (SELECT COUNT(*) FROM audit_events) AS audit_events
  `);
  assert.equal(countsResult.rows[0].payments, countsResult.rows[0].audit_events);
}
