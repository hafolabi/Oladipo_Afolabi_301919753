// A table can accept two entries even when the pair describes a bad payment.
// Change the sample on purpose, check that verify.sql finds the problem,
// then undo the change. Each example starts with the original sample data.
const examples = [
  {
    name: 'two entries that do not add up to zero',
    sql: `UPDATE transaction_entries SET amount_minor = amount_minor + 1
          WHERE transaction_id = 1 AND account_id = 2`,
    expectedProblem: 'A payment has the wrong number of entries or does not balance',
  },
  {
    name: 'entries added to a pending payment',
    sql: `UPDATE transaction_entries SET transaction_id = 6 WHERE transaction_id = 3`,
    expectedProblem: 'A payment has the wrong number of entries or does not balance',
  },
  {
    name: 'deposit takes money out of the customer account',
    sql: `UPDATE transaction_entries SET amount_minor = -amount_minor WHERE transaction_id = 1`,
    expectedProblem: 'A payment uses the wrong account types',
  },
  {
    name: 'reversal returns the wrong amount',
    sql: `UPDATE transaction_entries SET amount_minor = amount_minor * 2 WHERE transaction_id = 7`,
    expectedProblem: 'A reversal does not match its original payment',
  },
  {
    name: 'transfer leaves a customer below zero',
    sql: `UPDATE transaction_entries SET amount_minor = amount_minor * 10 WHERE transaction_id = 3`,
    expectedProblem: 'A customer balance is below zero',
  },
];

export async function checkBadData(database, checkData, log) {
  for (const example of examples) {
    await database.exec('BEGIN');

    try {
      await database.exec(example.sql);
      let problem = '';

      try {
        await checkData();
      } catch (error) {
        problem = error.message;
      }

      if (problem !== example.expectedProblem) {
        throw new Error(`${example.name}: expected "${example.expectedProblem}", got "${problem}"`);
      }

      log(`PASS: queries found "${example.name}"`);
    } finally {
      // Always put the sample data back, even when a check fails.
      await database.exec('ROLLBACK');
    }
  }
}
