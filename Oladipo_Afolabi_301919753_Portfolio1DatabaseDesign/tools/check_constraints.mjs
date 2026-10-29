// These examples try writes that the database should reject.
// They use ordinary JavaScript objects and try/catch, with no SQL test function.
const examples = [
  {
    name: 'duplicate email after trimming and lowercasing',
    sql: `INSERT INTO customers (first_name, last_name, email, phone)
          VALUES ('Other', 'Customer', lower(trim('  ADA@EXAMPLE.TEST  ')), '+2340000000098')`,
    expectedCode: '23505',
  },
  {
    name: 'email still contains capital letters',
    sql: `UPDATE customers SET email = 'ADA@EXAMPLE.TEST' WHERE email = 'ada@example.test'`,
    expectedCode: '23514',
  },
  {
    name: 'missing customer name',
    sql: `UPDATE customers SET first_name = NULL WHERE email = 'ada@example.test'`,
    expectedCode: '23502',
  },
  {
    name: 'duplicate account number',
    sql: `INSERT INTO accounts (account_number, account_kind) VALUES ('0000000000', 'system_clearing')`,
    expectedCode: '23505',
  },
  {
    name: 'customer account with no owner',
    sql: `INSERT INTO accounts (account_number, account_kind) VALUES ('1000000098', 'customer')`,
    expectedCode: '23514',
  },
  {
    name: 'clearing account with a customer owner',
    sql: `UPDATE accounts SET account_kind = 'system_clearing' WHERE account_number = '1000000001'`,
    expectedCode: '23514',
  },
  {
    name: 'account points to a customer who does not exist',
    sql: `UPDATE accounts SET customer_id = 999999 WHERE account_number = '1000000001'`,
    expectedCode: '23503',
  },
  {
    name: 'account uses another currency',
    sql: `UPDATE accounts SET currency_code = 'USD' WHERE account_number = '1000000001'`,
    expectedCode: '23514',
  },
  {
    name: 'delete an account that has payment entries',
    sql: `DELETE FROM accounts WHERE account_number = '1000000001'`,
    expectedCode: '23001',
  },
  {
    name: 'duplicate payment reference',
    sql: `INSERT INTO transactions (transaction_reference, transaction_type) VALUES ('DEP-001', 'deposit')`,
    expectedCode: '23505',
  },
  {
    name: 'unknown payment status',
    sql: `INSERT INTO transactions (transaction_reference, transaction_type, status)
          VALUES ('BAD-STATUS', 'deposit', 'done')`,
    expectedCode: '23514',
  },
  {
    name: 'completed payment has no posting time',
    sql: `INSERT INTO transactions (transaction_reference, transaction_type, status)
          VALUES ('BAD-TIME', 'deposit', 'posted')`,
    expectedCode: '23514',
  },
  {
    name: 'posting time is earlier than the request',
    sql: `UPDATE transactions SET posted_at = requested_at - interval '1 second'
          WHERE transaction_reference = 'DEP-001'`,
    expectedCode: '23514',
  },
  {
    name: 'pending payment already has a posting time',
    sql: `UPDATE transactions SET posted_at = requested_at WHERE transaction_reference = 'TRF-PEND-001'`,
    expectedCode: '23514',
  },
  {
    name: 'failed payment has no reason',
    sql: `INSERT INTO transactions (transaction_reference, transaction_type, status)
          VALUES ('BAD-FAIL', 'transfer', 'failed')`,
    expectedCode: '23514',
  },
  {
    name: 'failure reason is only spaces',
    sql: `UPDATE transactions SET failure_reason = '   ' WHERE transaction_reference = 'WDR-FAIL-001'`,
    expectedCode: '23514',
  },
  {
    name: 'reversal does not name the original payment',
    sql: `INSERT INTO transactions (transaction_reference, transaction_type) VALUES ('BAD-REV', 'reversal')`,
    expectedCode: '23514',
  },
  {
    name: 'payment tries to reverse itself',
    sql: `UPDATE transactions SET transaction_type = 'reversal', reversal_of_transaction_id = transaction_id
          WHERE transaction_reference = 'DEP-001'`,
    expectedCode: '23514',
  },
  {
    name: 'original payment does not exist',
    sql: `INSERT INTO transactions (transaction_reference, transaction_type, reversal_of_transaction_id)
          VALUES ('BAD-ORIGINAL', 'reversal', 999999)`,
    expectedCode: '23503',
  },
  {
    name: 'same account is entered twice for one payment',
    sql: `INSERT INTO transaction_entries (transaction_id, account_id, amount_minor) VALUES (1, 1, -1000000)`,
    expectedCode: '23505',
  },
  {
    name: 'entry moves zero money',
    sql: `UPDATE transaction_entries SET amount_minor = 0 WHERE transaction_id = 1`,
    expectedCode: '23514',
  },
  {
    name: 'entry points to an account that does not exist',
    sql: `INSERT INTO transaction_entries (transaction_id, account_id, amount_minor) VALUES (6, 999999, 1)`,
    expectedCode: '23503',
  },
];

export async function checkConstraints(database, log) {
  // Add a valid customer and account, then undo them so the sample stays the same.
  await database.exec(`
    BEGIN;
    INSERT INTO customers (first_name, last_name, email, phone, verification_status)
    VALUES ('Test', 'Customer', lower(trim('  TEST@EXAMPLE.TEST  ')), '+2340000000099', 'verified');
    INSERT INTO accounts (account_number, customer_id, account_kind)
    SELECT '1000000099', customer_id, 'customer' FROM customers WHERE email = 'test@example.test';
    ROLLBACK;
  `);
  log('PASS: a valid customer and owned account were accepted, then rolled back');

  for (const example of examples) {
    let databaseError = null;

    try {
      await database.exec(example.sql);
    } catch (error) {
      databaseError = error;
    }

    // These codes tell us why PostgreSQL refused the write.
    if (databaseError === null) {
      throw new Error(`The database accepted this invalid write: ${example.name}`);
    }
    if (databaseError.code !== example.expectedCode) {
      throw new Error(`${example.name}: expected error ${example.expectedCode}, got ${databaseError.code}`);
    }

    log(`PASS: database rejected "${example.name}" (error ${databaseError.code})`);
  }
}
