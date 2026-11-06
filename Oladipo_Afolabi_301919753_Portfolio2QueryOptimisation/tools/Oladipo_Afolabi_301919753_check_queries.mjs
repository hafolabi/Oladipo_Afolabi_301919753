import assert from 'node:assert/strict';

// Check the small sample first, where we can work out the answers by hand.
export async function checkSmallResults(database, queries, log) {
  const balancesResult = await database.query(queries.balances);
  const accountBalances = balancesResult.rows.map((account) => ({
    account_number: account.account_number,
    balance_minor: String(account.balance_minor),
  }));
  const expectedBalances = [
    { account_number: '1000000001', balance_minor: '800000' },
    { account_number: '1000000003', balance_minor: '0' },
  ];
  assert.deepEqual(accountBalances, expectedBalances);
  log('PASS: Ada has NGN 8,000, and her unused account is included with zero');

  const historyResult = await database.query(queries.history);
  const payments = historyResult.rows.map((payment) => ({
    reference: payment.transaction_reference,
    amount_minor: String(payment.amount_minor),
  }));
  const expectedPayments = [
    { reference: 'DEP-001', amount_minor: '1000000' },
    { reference: 'TRF-001', amount_minor: '-200000' },
  ];
  assert.deepEqual(payments, expectedPayments);
  log('PASS: account history shows the right payments, signs, and order');

  const dailyResult = await database.query(queries.dailyTransfers);
  const daily = dailyResult.rows;
  assert.equal(daily.length, 1);
  const transferDay = new Date(daily[0].transfer_day);
  const dateText = transferDay.toISOString().slice(0, 10);
  assert.equal(dateText, '2026-10-02');
  assert.equal(Number(daily[0].transfer_count), 1);
  assert.equal(String(daily[0].total_minor), '200000');
  log('PASS: the transfer is counted once, with a value of NGN 2,000');

  const problemsResult = await database.query(queries.paymentProblems);
  assert.deepEqual(problemsResult.rows, []);
  log('PASS: the original sample has no payment problems');

  // Confirm that the date filter includes midnight on 2 October and excludes
  // midnight on 3 October. Undo both example payments after checking.
  await database.exec('BEGIN');
  try {
    await database.exec(`
      INSERT INTO transactions (transaction_reference, transaction_type, status, requested_at, posted_at)
      VALUES
        ('BOUNDARY-START', 'transfer', 'posted', '2026-10-02 00:00:00+00', '2026-10-02 00:00:00+00'),
        ('BOUNDARY-END', 'transfer', 'posted', '2026-10-03 00:00:00+00', '2026-10-03 00:00:00+00');
      INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
      SELECT transaction_id, 2, -100 FROM transactions WHERE transaction_reference LIKE 'BOUNDARY-%';
      INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
      SELECT transaction_id, 3, 100 FROM transactions WHERE transaction_reference LIKE 'BOUNDARY-%';
    `);
    const boundaryResult = await database.query(queries.history);
    const references = boundaryResult.rows.map((payment) => payment.transaction_reference);
    assert.deepEqual(references, ['BOUNDARY-START', 'DEP-001', 'TRF-001']);
    log('PASS: history includes the start of the day and excludes the next day');
  } finally {
    await database.exec('ROLLBACK');
  }

  // An empty answer is only useful if the query also catches real mistakes.
  const badExamples = [
    {
      name: 'missing transfer entry',
      sql: 'DELETE FROM transaction_entries WHERE transaction_id = 3 AND account_id = 3',
      reference: 'TRF-001',
      problem: 'Wrong entry count or unbalanced amounts',
    },
    {
      name: 'amounts do not balance',
      sql: 'UPDATE transaction_entries SET amount_minor = amount_minor + 1 WHERE transaction_id = 3 AND account_id = 3',
      reference: 'TRF-001',
      problem: 'Wrong entry count or unbalanced amounts',
    },
    {
      name: 'deposit moves money in the wrong direction',
      sql: 'UPDATE transaction_entries SET amount_minor = -amount_minor WHERE transaction_id = 1',
      reference: 'DEP-001',
      problem: 'Wrong account types or money direction',
    },
  ];
  const detectedProblems = [];
  for (const example of badExamples) {
    await database.exec('BEGIN');
    try {
      await database.exec(example.sql);
      const result = await database.query(queries.paymentProblems);
      const expectedProblemFound = result.rows.some((row) => (
        row.transaction_reference === example.reference && row.problem === example.problem
      ));
      assert.ok(expectedProblemFound, `The query missed this problem: ${example.name}`);
      detectedProblems.push({ example: example.name, detected: result.rows });
      log(`PASS: payment check found "${example.name}"`);
    } finally {
      await database.exec('ROLLBACK');
    }
  }
  const restoredResult = await database.query(queries.paymentProblems);
  assert.deepEqual(restoredResult.rows, []);
  return detectedProblems;
}
