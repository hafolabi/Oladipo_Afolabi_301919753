import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { openDemoDatabase } from './Oladipo_Afolabi_301919753_demo_database.mjs';
import { postPayment } from './Oladipo_Afolabi_301919753_payments.mjs';

const queries = {
  accounts: await readFile(new URL('../sql/Oladipo_Afolabi_301919753_menu_accounts.sql', import.meta.url), 'utf8'),
  history: await readFile(new URL('../sql/Oladipo_Afolabi_301919753_menu_history.sql', import.meta.url), 'utf8'),
};
const clearingAccount = '0000000000';
let session;
let input;
const inputClosed = new AbortController();

async function ask(prompt) {
  const answer = await input.question(prompt, { signal: inputClosed.signal });
  return answer.trim();
}

async function showAccounts(database) {
  const result = await database.query(queries.accounts);
  console.table(result.rows);
}

async function askAccount(database, prompt) {
  const accountNumber = await ask(prompt);
  const result = await database.query(
    "SELECT account_number FROM accounts WHERE account_number = $1 AND account_kind = 'customer'",
    [accountNumber],
  );
  if (result.rows.length === 0) {
    throw new Error('Account not found. Choose a customer account from the list.');
  }
  return accountNumber;
}

function amountInKobo(text) {
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error('Enter naira like 500 or 500.50, without commas or a currency symbol.');
  }
  const [naira, decimal = ''] = text.split('.');
  // Work with whole numbers so 0.29 naira becomes exactly 29 kobo.
  const kobo = BigInt(naira) * 100n + BigInt(decimal.padEnd(2, '0'));
  if (kobo <= 0n || kobo > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Enter a positive amount no larger than NGN 90071992547409.91.');
  }
  return Number(kobo);
}

function checkDate(text) {
  const date = new Date(`${text}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime())) {
    throw new Error('Enter a date as YYYY-MM-DD.');
  }
  if (date.toISOString().slice(0, 10) !== text) {
    throw new Error('That date does not exist.');
  }
}

async function showHistory(database) {
  const accountNumber = await askAccount(database, 'Account number: ');
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const defaultEnd = tomorrow.toISOString().slice(0, 10);
  const startDate = await ask('Start date [2026-10-02]: ') || '2026-10-02';
  const endDate = await ask(`End date, excluded [${defaultEnd}]: `) || defaultEnd;
  checkDate(startDate);
  checkDate(endDate);
  if (endDate <= startDate) throw new Error('The end date must be after the start date.');

  // Values go in the array, rather than being joined into the SQL text.
  const result = await database.query(queries.history, [
    accountNumber,
    `${startDate}T00:00:00Z`,
    `${endDate}T00:00:00Z`,
  ]);
  if (result.rows.length === 0) {
    console.log('No completed payments for that account and date range.');
    return;
  }
  const rows = result.rows.map((payment) => ({
    ...payment,
    posted_at: payment.posted_at.toISOString(),
  }));
  console.table(rows);
}

async function makePayment(database, type) {
  let sourceAccountNumber = clearingAccount;
  let destinationAccountNumber = clearingAccount;
  if (type === 'deposit') {
    destinationAccountNumber = await askAccount(database, 'Deposit into account: ');
  } else if (type === 'withdrawal') {
    sourceAccountNumber = await askAccount(database, 'Withdraw from account: ');
  } else {
    sourceAccountNumber = await askAccount(database, 'From account: ');
    destinationAccountNumber = await askAccount(database, 'To account: ');
  }
  const amountMinor = amountInKobo(await ask('Amount in NGN: '));
  const reference = await ask('Unique payment reference (e.g. TEST-001): ');

  // Reuse Portfolio 3: lock accounts, check funds, then commit or roll back.
  const transactionId = await postPayment(database, {
    reference, type, sourceAccountNumber, destinationAccountNumber, amountMinor,
  });
  console.log(`Saved ${type} ${reference} (transaction ${transactionId}).`);
  await showAccounts(database);
}

try {
  console.log('AfolabiPay — terminal demo for the student and lecturer');
  console.log('Starting a temporary PostgreSQL database with the Portfolio 1 mock data...');
  session = await openDemoDatabase();
  input = createInterface({ input: process.stdin, output: process.stdout });
  input.on('close', () => inputClosed.abort());
  input.on('SIGINT', () => input.close());
  console.log('Amounts are in NGN. Changes last until you exit; restarting restores the mock data.');
  await showAccounts(session.database);

  while (!inputClosed.signal.aborted) {
    console.log('\n1. List accounts and balances\n2. View account history\n3. Deposit\n4. Withdraw\n5. Transfer\n0. Exit');
    try {
      const choice = await ask('Choose an option: ');
      if (choice === '0') break;
      if (choice === '1') await showAccounts(session.database);
      else if (choice === '2') await showHistory(session.database);
      else if (choice === '3') await makePayment(session.database, 'deposit');
      else if (choice === '4') await makePayment(session.database, 'withdrawal');
      else if (choice === '5') await makePayment(session.database, 'transfer');
      else console.log('Choose 0, 1, 2, 3, 4, or 5.');
    } catch (error) {
      if (error.name === 'AbortError') break;
      if (error.code === '23505') console.log('That payment reference is already in use. Try another one.');
      else console.log(`Could not complete that option: ${error.message}`);
    }
  }
} catch (error) {
  console.error(`Could not start the demo: ${error.message || 'PostgreSQL startup failed.'}`);
  process.exitCode = 1;
} finally {
  input?.close();
  if (session) {
    await session.close();
    console.log('Demo closed. The temporary database has been removed.');
  }
}

// Preserve failures after the native server library finishes its exit cleanup.
if (process.exitCode) process.exit(process.exitCode);
