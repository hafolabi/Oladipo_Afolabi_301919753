import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { checkSmallResults } from './check_queries.mjs';
import { measureHistoryQuery, summariseTimings } from './measure_history.mjs';

// Start with an empty database each time we run this file.
const database = new PGlite();
const activityFolder = new URL('../', import.meta.url);
const designFolder = new URL('../../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/', import.meta.url);
const evidenceFolder = new URL('evidence/', activityFolder);
const messages = [];

function log(message) {
  console.log(message);
  messages.push(message);
}

async function readSqlFile(filename) {
  return readFile(new URL(filename, activityFolder), 'utf8');
}

async function saveJson(filename, value) {
  await writeFile(new URL(filename, evidenceFolder), JSON.stringify(value, null, 2) + '\n');
}

async function saveQueryResults(filename, query) {
  const result = await database.query(query);
  await saveJson(filename, result.rows);
}

async function getTableCounts() {
  const result = await database.query(`
    SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers
    UNION ALL SELECT 'accounts', COUNT(*) FROM accounts
    UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
    UNION ALL SELECT 'transaction_entries', COUNT(*) FROM transaction_entries
    UNION ALL SELECT 'audit_events', COUNT(*) FROM audit_events
  `);
  return result.rows;
}

try {
  // Keep the software version with the results so the run can be explained later.
  await mkdir(evidenceFolder, { recursive: true });
  log('AfolabiPay — Portfolio 2 query and optimisation checks');
  const runDate = new Date().toISOString();
  log(`Run date: ${runDate}`);
  const packageFile = new URL('./node_modules/@electric-sql/pglite/package.json', import.meta.url);
  const packageText = await readFile(packageFile, 'utf8');
  const packageInfo = JSON.parse(packageText);
  const versionResult = await database.query('SELECT version() AS version');
  const engine = versionResult.rows[0].version;
  log(engine);
  log(`PGlite ${packageInfo.version}; Node.js ${process.version}; ${process.platform}/${process.arch}`);
  log('Temporary in-memory database; these measurements are not a standalone-server benchmark.');

  // Load the same tables and small sample used in Portfolio 1.
  const schemaSql = await readFile(new URL('schema.sql', designFolder), 'utf8');
  const sampleSql = await readFile(new URL('seed.sql', designFolder), 'utf8');
  await database.exec("SET TIME ZONE 'UTC'");
  await database.exec(schemaSql);
  await database.exec(sampleSql);

  const queries = {
    balances: await readSqlFile('queries/query_01_balances.sql'),
    history: await readSqlFile('queries/query_02_history.sql'),
    dailyTransfers: await readSqlFile('queries/query_03_daily_transfers.sql'),
    paymentProblems: await readSqlFile('queries/query_04_payment_problems.sql'),
  };

  // Check answers we can work out by hand, then save each query's result.
  const detectedProblems = await checkSmallResults(database, queries, log);
  await saveJson('query_04_detected_problems.json', detectedProblems);
  await saveQueryResults('query_01_result.json', queries.balances);
  await saveQueryResults('query_02_result.json', queries.history);
  await saveQueryResults('query_03_result.json', queries.dailyTransfers);
  await saveQueryResults('query_04_result.json', queries.paymentProblems);
  const smallCounts = await getTableCounts();
  await saveJson('small_dataset_counts.json', smallCounts);
  log('PASS: saved all four query results for the small dataset');

  // Add more sample payments so searching by account has enough work to measure.
  const performanceSql = await readSqlFile('performance_seed.sql');
  await database.exec(performanceSql);
  const countsBefore = await getTableCounts();
  const expectedCounts = {
    customers: 203,
    accounts: 204,
    transactions: 20207,
    transaction_entries: 40410,
    audit_events: 8,
  };
  for (const table of countsBefore) {
    assert.equal(Number(table.row_count), expectedCounts[table.table_name]);
  }

  const problemsResult = await database.query(queries.paymentProblems);
  assert.deepEqual(problemsResult.rows, []);
  const balancesResult = await database.query(queries.balances);
  const largeBalances = balancesResult.rows;
  assert.equal(String(largeBalances[0].balance_minor), '1800000');
  assert.equal(String(largeBalances[1].balance_minor), '0');

  const dailyResult = await database.query(queries.dailyTransfers);
  const largeDaily = dailyResult.rows;
  assert.equal(largeDaily.length, 1);
  assert.equal(Number(largeDaily[0].transfer_count), 20001);
  assert.equal(String(largeDaily[0].total_minor), '100200000');
  const negativeBalancesResult = await database.query(`
    SELECT account.account_id
    FROM accounts AS account
    LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
    LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
    WHERE account.account_kind = 'customer'
    GROUP BY account.account_id
    HAVING COALESCE(SUM(CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END), 0) < 0
  `);
  assert.deepEqual(negativeBalancesResult.rows, []);
  log('PASS: larger dataset has 20,207 transactions, 40,410 balanced entries, and no negative customer balances');

  // Give PostgreSQL up-to-date table statistics before it chooses a plan.
  // Leave the data and statistics alone while comparing the index.
  await database.exec('ANALYZE');
  const settingsResult = await database.query(`
    SELECT current_setting('TimeZone') AS time_zone,
      current_setting('shared_buffers') AS shared_buffers,
      current_setting('work_mem') AS work_mem,
      current_setting('random_page_cost') AS random_page_cost,
      current_setting('enable_seqscan') AS enable_seqscan,
      current_setting('enable_indexscan') AS enable_indexscan,
      current_setting('enable_bitmapscan') AS enable_bitmapscan
  `);
  const settings = settingsResult.rows[0];
  const indexesResult = await database.query(`
    SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname
  `);
  const indexesBefore = indexesResult.rows;

  // Save the history rows and measure the query before adding the index.
  const historyBeforeResult = await database.query(queries.history);
  const historyBefore = historyBeforeResult.rows;
  assert.equal(historyBefore.length, 203);
  await saveJson('query_02_large_result_before.json', historyBefore);
  const before = await measureHistoryQuery(database, queries.history, evidenceFolder, 'before');
  log('Saved five execution plans before adding the index');

  // Add the index, then repeat the exact same query and measurements.
  const indexSql = await readSqlFile('add_history_index.sql');
  await database.exec(indexSql);
  const historyAfterResult = await database.query(queries.history);
  const historyAfter = historyAfterResult.rows;
  assert.deepEqual(historyAfter, historyBefore);
  const countsAfter = await getTableCounts();
  assert.deepEqual(countsAfter, countsBefore);
  await saveJson('query_02_large_result_after.json', historyAfter);
  const after = await measureHistoryQuery(database, queries.history, evidenceFolder, 'after');
  log('PASS: all 203 history rows are identical before and after adding the index');

  const indexName = 'idx_entries_account_transaction';
  const indexUsed = after.plans.every((plan) => plan.includes(indexName));
  const indexSizeResult = await database.query(`SELECT pg_size_pretty(pg_relation_size('${indexName}')) AS size`);
  const indexSize = indexSizeResult.rows[0].size;
  const beforeSummary = summariseTimings(before.measurements);
  const afterSummary = summariseTimings(after.measurements);

  // Save the conditions and all five times, not just the quickest result.
  const comparison = {
    run_date: runDate,
    engine,
    pglite_version: packageInfo.version,
    node_version: process.version,
    host: `${process.platform}/${process.arch}`,
    environment: 'Fresh PGlite in-memory database. No concurrent clients. Warm-cache comparison.',
    parameters: { account_number: '1000000001', from_inclusive: '2026-10-02 00:00:00+00', to_exclusive: '2026-10-03 00:00:00+00' },
    settings,
    row_counts: countsBefore,
    indexes_before: indexesBefore,
    warm_up_runs_per_phase: 1,
    measured_runs_per_phase: 5,
    statistics: 'ANALYZE before the first phase; data and statistics unchanged between phases',
    before: before.measurements,
    after: after.measurements,
    before_summary: beforeSummary,
    after_summary: afterSummary,
    median_speedup: beforeSummary.median_ms / afterSummary.median_ms,
    matching_history_rows: historyBefore.length,
    results_identical: true,
    new_index: indexName,
    new_index_size: indexSize,
    new_index_used_in_all_after_plans: indexUsed,
    entries_sequential_scan_before: before.plans.some((plan) => plan.includes('Seq Scan on transaction_entries')),
  };
  await saveJson('measurements.json', comparison);
  const csv = ['phase,run,execution_ms,planning_ms'];
  for (const row of before.measurements) {
    csv.push(`before,${row.run},${row.execution_ms},${row.planning_ms}`);
  }
  for (const row of after.measurements) {
    csv.push(`after,${row.run},${row.execution_ms},${row.planning_ms}`);
  }
  await writeFile(new URL('measurements.csv', evidenceFolder), csv.join('\n') + '\n');
  log(`Index used in all five after plans: ${indexUsed}; index size: ${indexSize}`);
  log(`Median execution time before: ${beforeSummary.median_ms} ms; after: ${afterSummary.median_ms} ms`);
  log(`Median time ratio (before / after): ${comparison.median_speedup.toFixed(2)}`);
  log('ALL PORTFOLIO 2 CHECKS PASSED. Closing the temporary database.');
  await writeFile(new URL('query_validation.txt', evidenceFolder), messages.join('\n') + '\n');
} catch (error) {
  console.error(`PORTFOLIO 2 CHECK FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  await database.close();
}
