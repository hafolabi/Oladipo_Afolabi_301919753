// One example for each main constraint type used in the design.
const examples = [
  {
    name: 'duplicate email (UNIQUE)',
    sql: `INSERT INTO customers (first_name, last_name, email, phone)
          VALUES ('Other', 'Customer', 'ada@example.test', '+2340000000098')`,
    expectedCode: '23505',
  },
  {
    name: 'missing customer name (NOT NULL)',
    sql: `UPDATE customers SET first_name = NULL WHERE email = 'ada@example.test'`,
    expectedCode: '23502',
  },
  {
    name: 'customer account with no owner (CHECK)',
    sql: `INSERT INTO accounts (account_number, account_kind) VALUES ('1000000098', 'customer')`,
    expectedCode: '23514',
  },
  {
    name: 'account points to a missing customer (FOREIGN KEY)',
    sql: `UPDATE accounts SET customer_id = 999999 WHERE account_number = '1000000001'`,
    expectedCode: '23503',
  },
  {
    name: 'same account entered twice in a payment (PRIMARY KEY)',
    sql: `INSERT INTO transaction_entries (transaction_id, account_id, amount_minor) VALUES (1, 1, -1000000)`,
    expectedCode: '23505',
  },
  {
    name: 'delete an account with entries (ON DELETE RESTRICT)',
    sql: `DELETE FROM accounts WHERE account_number = '1000000001'`,
    expectedCode: '23001',
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
