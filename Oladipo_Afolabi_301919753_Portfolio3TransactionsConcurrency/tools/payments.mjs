import { readFile } from 'node:fs/promises';

async function readSql(filename) {
  return readFile(new URL(`../sql/${filename}`, import.meta.url), 'utf8');
}

const queries = {
  lockAccounts: await readSql('lock_accounts.sql'),
  balance: await readSql('get_balance.sql'),
  createPayment: await readSql('create_payment.sql'),
  createEntries: await readSql('create_entries.sql'),
  createAuditEvent: await readSql('create_audit_event.sql'),
};

// The caller must BEGIN first, then COMMIT or ROLLBACK on this same connection.
// Keeping commit separate lets the experiments inspect work before it is saved.
export async function writePayment(database, payment) {
  const { reference, type, sourceAccountNumber, destinationAccountNumber, amountMinor } = payment;

  if (typeof reference !== 'string' || reference.trim() === '') {
    throw new Error('A payment reference is required.');
  }
  if (!['deposit', 'withdrawal', 'transfer'].includes(type)) {
    throw new Error('Use deposit, withdrawal, or transfer.');
  }
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('The amount must be a positive whole number of kobo.');
  }
  if (sourceAccountNumber === destinationAccountNumber) {
    throw new Error('Choose two different accounts.');
  }

  const accountsResult = await database.query(queries.lockAccounts, [
    sourceAccountNumber,
    destinationAccountNumber,
  ]);
  const source = accountsResult.rows.find((account) => account.account_number === sourceAccountNumber);
  const destination = accountsResult.rows.find((account) => account.account_number === destinationAccountNumber);

  if (!source || !destination) {
    throw new Error('Account not found.');
  }
  if (source.status !== 'active' || destination.status !== 'active') {
    throw new Error('Both accounts must be active.');
  }

  if (type === 'transfer' && (source.account_kind !== 'customer' || destination.account_kind !== 'customer')) {
    throw new Error('A transfer needs two customer accounts.');
  }
  if (type === 'deposit' && (source.account_kind !== 'system_clearing' || destination.account_kind !== 'customer')) {
    throw new Error('A deposit must move from clearing to a customer account.');
  }
  if (type === 'withdrawal' && (source.account_kind !== 'customer' || destination.account_kind !== 'system_clearing')) {
    throw new Error('A withdrawal must move from a customer account to clearing.');
  }

  // Take the lock first, then read the balance. Do not combine these two queries.
  if (source.account_kind === 'customer') {
    const balanceResult = await database.query(queries.balance, [sourceAccountNumber]);
    const availableMinor = balanceResult.rows[0].balance_minor;

    // PostgreSQL returns this exact whole-number total as text.
    // BigInt compares it without losing precision for large balances.
    if (BigInt(availableMinor) < BigInt(amountMinor)) {
      throw new Error(`Insufficient funds: available ${availableMinor} kobo, requested ${amountMinor} kobo.`);
    }
  }

  const paymentResult = await database.query(queries.createPayment, [reference, type]);
  const transactionId = paymentResult.rows[0].transaction_id;
  await database.query(queries.createEntries, [
    transactionId,
    source.account_id,
    destination.account_id,
    amountMinor,
  ]);
  const details = `${reference}: ${amountMinor} kobo from ${sourceAccountNumber} to ${destinationAccountNumber}.`;
  await database.query(queries.createAuditEvent, [transactionId, details]);
  return transactionId;
}

// This is the usual entry point: either save the whole payment or undo it.
export async function postPayment(database, payment) {
  await database.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  try {
    const transactionId = await writePayment(database, payment);
    await database.query('COMMIT');
    return transactionId;
  } catch (error) {
    await database.query('ROLLBACK');
    throw error;
  }
}
