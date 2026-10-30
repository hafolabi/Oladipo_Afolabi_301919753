-- A healthy sample should return no rows here.
-- First look for missing entries, unbalanced amounts, or entries on unfinished payments.
SELECT
    payment.transaction_reference,
    'Wrong entry count or unbalanced amounts' AS problem
FROM transactions AS payment
LEFT JOIN transaction_entries AS entry ON entry.transaction_id = payment.transaction_id
GROUP BY payment.transaction_id
HAVING
    (payment.status = 'posted' AND (COUNT(entry.account_id) <> 2 OR SUM(entry.amount_minor) <> 0))
    OR (payment.status <> 'posted' AND COUNT(entry.account_id) <> 0)

UNION ALL

-- Then check the account types and direction of ordinary payments.
-- UNION ALL combines the results of these two checks.
-- Reversal eligibility is checked separately in Portfolio 1.
SELECT DISTINCT
    payment.transaction_reference,
    'Wrong account types or money direction' AS problem
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
)
ORDER BY transaction_reference, problem;
