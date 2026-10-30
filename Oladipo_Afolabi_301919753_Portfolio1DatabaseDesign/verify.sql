-- Run after seed.sql. These queries only read data.
-- The first query checks the sample entry pairs and should return no rows.
-- The other three show row counts, account balances, and payment totals.

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
