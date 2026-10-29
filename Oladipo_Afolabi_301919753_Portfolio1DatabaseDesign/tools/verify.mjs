import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { checkConstraints } from './check_constraints.mjs';
import { checkBadData } from './check_bad_data.mjs';

// PGlite runs PostgreSQL inside this script. The database lasts for this run only.
const database = new PGlite();
const output = [];
const evidenceFolder = new URL('../evidence/', import.meta.url);

function log(message) {
  console.log(message);
  output.push(message);
}

async function readSql(filename) {
  return readFile(new URL(`../${filename}`, import.meta.url), 'utf8');
}

const checkSql = await readSql('verify.sql');
const expectedCounts = { customers: '4', accounts: '5', transactions: '7', transaction_entries: '10', audit_events: '8' };
const expectedBalances = {
  '0000000000': '-1500000',
  '1000000001': '800000',
  '1000000002': '700000',
  '1000000003': '0',
  '1000000004': '0',
};

async function checkData(showResults = false) {
  const results = await database.exec(checkSql);

  for (const result of results) {
    const looksForProblems = result.fields.some((column) => column.name === 'problem');

    if (looksForProblems && result.rows.length > 0) {
      throw new Error(result.rows[0].problem);
    }

    for (const row of result.rows) {
      // PostgreSQL may return large numbers as strings. Compare them as strings.
      if (row.table_name && String(row.row_count) !== expectedCounts[row.table_name]) {
        throw new Error(`Wrong number of rows in ${row.table_name}`);
      }
      if (row.account_number && String(row.balance_minor) !== expectedBalances[row.account_number]) {
        throw new Error(`Wrong sample balance for account ${row.account_number}`);
      }
    }

    if (showResults && !looksForProblems) {
      log(JSON.stringify(result.rows, null, 2));
    }
  }
}

try {
  log('AfolabiPay — database design checks');
  log(`Run date: ${new Date().toISOString()}`);
  log(`Node.js: ${process.version}; host: ${process.platform}/${process.arch}`);
  const packageInfo = JSON.parse(await readFile(new URL('./node_modules/@electric-sql/pglite/package.json', import.meta.url), 'utf8'));
  log(`PGlite: ${packageInfo.version}; temporary database`);
  const versionResult = await database.query('SELECT version() AS version');
  log(versionResult.rows[0].version);
  log('These checks use embedded PostgreSQL. Separate-session tests still need a database server.');

  await database.exec(await readSql('schema.sql'));
  log('\nPASS: created all five tables');
  await database.exec(await readSql('seed.sql'));
  log('PASS: added the sample data');
  await checkData(true);
  log('PASS: sample payments, reversals, row counts, and balances are correct');

  log('\nChecking which writes the database accepts or rejects:');
  await checkConstraints(database, log);
  await checkData();
  log('PASS: the sample rows are unchanged after the write checks');

  log('\nChecking that the queries spot bad payment data:');
  await checkBadData(database, checkData, log);
  await checkData();
  log('PASS: all five changes were found and rolled back');

  // Read the table definitions from PostgreSQL so the evidence matches the SQL.
  const columns = await database.query(`
    SELECT table_name, column_name, data_type, is_nullable, is_identity, column_default
    FROM information_schema.columns WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);
  const constraints = await database.query(`
    SELECT conrelid::regclass::text AS relation, conname AS name, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY relation, name
  `);

  await mkdir(evidenceFolder, { recursive: true });
  await writeFile(new URL('table_definitions.json', evidenceFolder), JSON.stringify({ columns: columns.rows, constraints: constraints.rows }, null, 2) + '\n');
  log('\nALL CHECKS PASSED. Closing the temporary database.');
  await writeFile(new URL('schema_validation.txt', evidenceFolder), output.join('\n') + '\n');
} catch (error) {
  console.error(`CHECK FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  await database.close();
}
