-- Run after seed.sql. These queries only read data.
-- The first five queries look for problems. They should return no rows.
-- The last three show the row counts, account balances, and payment totals.

-- 1. A completed payment needs two entries that add up to zero.
-- A pending or failed payment should have no entries.
SELECT
    'A payment has the wrong number of entries or does not balance' AS problem,
    payment.transaction_reference
FROM transactions AS payment
LEFT JOIN transaction_entries AS entry ON entry.transaction_id = payment.transaction_id
GROUP BY payment.transaction_id
HAVING
    (payment.status = 'posted' AND (COUNT(entry.account_id) <> 2 OR SUM(entry.amount_minor) <> 0))
    OR (payment.status <> 'posted' AND COUNT(entry.account_id) <> 0);

-- 2. Check which kind of account is sending or receiving the money.
-- Transfers use customer accounts. Deposits come from clearing; withdrawals go to it.
SELECT
    'A payment uses the wrong account types' AS problem,
    payment.transaction_reference
FROM transactions AS payment
JOIN transaction_entries AS entry ON entry.transaction_id = payment.transaction_id
JOIN accounts AS account ON account.account_id = entry.account_id
WHERE payment.status = 'posted' AND (
    (payment.transaction_type = 'transfer' AND account.account_kind <> 'customer')
    OR (payment.transaction_type = 'deposit' AND (
        (entry.amount_minor > 0 AND account.account_kind <> 'customer')
        OR (entry.amount_minor < 0 AND account.account_kind <> 'system_clearing')
    ))
    OR (payment.transaction_type = 'withdrawal' AND (
        (entry.amount_minor < 0 AND account.account_kind <> 'customer')
        OR (entry.amount_minor > 0 AND account.account_kind <> 'system_clearing')
    ))
);

-- 3. A reversal must undo a completed payment, on the same accounts.
-- Adding the old amount to the reversal amount should give zero.
SELECT
    'A reversal does not match its original payment' AS problem,
    reversal.transaction_reference
FROM transactions AS reversal
JOIN transactions AS original ON original.transaction_id = reversal.reversal_of_transaction_id
JOIN transaction_entries AS new_entry ON new_entry.transaction_id = reversal.transaction_id
LEFT JOIN transaction_entries AS old_entry
    ON old_entry.transaction_id = original.transaction_id
    AND old_entry.account_id = new_entry.account_id
WHERE reversal.status = 'posted' AND (
    original.status <> 'posted'
    OR original.transaction_type = 'reversal'
    OR reversal.requested_at < original.posted_at
    OR old_entry.account_id IS NULL
    OR new_entry.amount_minor::numeric + old_entry.amount_minor <> 0
);

-- 4. We only allow one completed reversal for each original payment.
SELECT
    'A payment has more than one completed reversal' AS problem,
    reversal_of_transaction_id
FROM transactions
WHERE transaction_type = 'reversal' AND status = 'posted'
GROUP BY reversal_of_transaction_id
HAVING COUNT(*) > 1;

-- 5. Check that no customer finishes with a negative balance.
-- CASE is SQL's way to choose a value, similar to a condition in JavaScript.
SELECT
    'A customer balance is below zero' AS problem,
    account.account_number
FROM accounts AS account
LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
WHERE account.account_kind = 'customer'
GROUP BY account.account_id
HAVING COALESCE(SUM(CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END), 0) < 0;

-- How many rows did we add? UNION ALL puts these five counts in one result.
SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers
UNION ALL SELECT 'accounts', COUNT(*) FROM accounts
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL SELECT 'transaction_entries', COUNT(*) FROM transaction_entries
UNION ALL SELECT 'audit_events', COUNT(*) FROM audit_events;

-- Add up the completed entries for each account.
-- LEFT JOIN keeps accounts that have no entries yet.
-- COALESCE uses zero when there is no total. Divide kobo by 100 to get naira.
SELECT
    account.account_number,
    COALESCE(customer.first_name || ' ' || customer.last_name, 'System clearing') AS owner,
    COALESCE(SUM(CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END), 0) AS balance_minor,
    ROUND(COALESCE(SUM(CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END), 0) / 100.0, 2) AS balance_ngn
FROM accounts AS account
LEFT JOIN customers AS customer ON customer.customer_id = account.customer_id
LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
GROUP BY account.account_id, customer.first_name, customer.last_name
ORDER BY account.account_number;

-- A completed payment should show 2 entries and a total of 0.
SELECT
    payment.transaction_reference,
    payment.transaction_type,
    payment.status,
    COUNT(entry.account_id) AS entry_count,
    COALESCE(SUM(entry.amount_minor), 0) AS net_minor
FROM transactions AS payment
LEFT JOIN transaction_entries AS entry ON entry.transaction_id = payment.transaction_id
GROUP BY payment.transaction_id
ORDER BY payment.requested_at;
