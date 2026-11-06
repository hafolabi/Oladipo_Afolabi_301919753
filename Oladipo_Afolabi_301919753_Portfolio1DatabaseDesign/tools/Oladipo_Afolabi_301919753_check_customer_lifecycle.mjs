import assert from 'node:assert/strict';

export async function checkCustomerLifecycle(database, log) {
  await database.query('BEGIN');
  try {
    const defaults = await database.query(`
      INSERT INTO customers (first_name, last_name, email, phone)
      VALUES ('Test', 'Customer', 'lifecycle@example.test', '+2340000000097')
      RETURNING status, created_at IS NOT NULL AS has_created_at,
                updated_at = created_at AS timestamps_match
    `);
    assert.deepEqual(defaults.rows[0], {
      status: 'active', has_created_at: true, timestamps_match: true,
    });
    log('PASS: new customers default to active with matching creation and update timestamps');

    await database.query(`
      INSERT INTO customers (first_name, last_name, email, phone, created_at, updated_at)
      VALUES ('History', 'Customer', 'lifecycle-history@example.test', '+2340000000096',
              '2000-01-01 00:00:00+00', '2000-01-01 00:00:00+00')
    `);
    const profileUpdate = await database.query(`
      UPDATE customers SET phone = '+2340000000095', updated_at = '1999-01-01 00:00:00+00'
      WHERE email = 'lifecycle-history@example.test'
      RETURNING updated_at > '2000-01-01 00:00:00+00' AS refreshed,
                updated_at = statement_timestamp() AS matches_update,
                created_at = '2000-01-01 00:00:00+00' AS creation_unchanged
    `);
    assert.deepEqual(profileUpdate.rows[0], {
      refreshed: true, matches_update: true, creation_unchanged: true,
    });
    log('PASS: profile updates refresh updated_at automatically and preserve created_at');

    for (const status of ['suspended', 'deleted', 'active']) {
      const result = await database.query(`
        UPDATE customers SET status = $1 WHERE email = 'lifecycle-history@example.test'
        RETURNING status, updated_at = statement_timestamp() AS matches_update,
                  created_at = '2000-01-01 00:00:00+00' AS creation_unchanged
      `, [status]);
      assert.deepEqual(result.rows[0], {
        status, matches_update: true, creation_unchanged: true,
      });
    }
    log('PASS: suspended, deleted, and active statuses are accepted and refresh updated_at');
  } finally {
    await database.query('ROLLBACK');
  }

  const invalidExamples = [
    { name: 'unsupported customer status', sql: "UPDATE customers SET status = 'inactive'", code: '23514' },
    { name: 'missing customer status', sql: 'UPDATE customers SET status = NULL', code: '23502' },
    {
      name: 'missing customer update timestamp',
      sql: `INSERT INTO customers (first_name, last_name, email, phone, updated_at)
            VALUES ('Test', 'Customer', 'missing-time@example.test', '+2340000000094', NULL)`,
      code: '23502',
    },
  ];
  for (const example of invalidExamples) {
    await database.query('BEGIN');
    try {
      await assert.rejects(database.query(example.sql), { code: example.code });
      log(`PASS: database rejected "${example.name}" (error ${example.code})`);
    } finally {
      await database.query('ROLLBACK');
    }
  }
}
