-- Run this AFTER getting the account lock, as a separate statement.
-- Under Read Committed, this statement can see a payment that committed while we waited.
SELECT COALESCE(SUM(
    CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END
), 0)::text AS balance_minor
FROM accounts AS account
LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
WHERE account.account_number = $1;
