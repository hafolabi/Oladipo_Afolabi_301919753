-- This is the Portfolio 2 history query with values supplied by the user.
-- $1 is the account; $2 is the start; $3 is the exclusive end, all passed separately.
SELECT
    payment.transaction_reference,
    payment.transaction_type,
    payment.posted_at,
    ROUND(entry.amount_minor / 100.0, 2)::text AS amount_ngn
FROM accounts AS account
JOIN transaction_entries AS entry ON entry.account_id = account.account_id
JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
WHERE account.account_number = $1
    AND payment.status = 'posted'
    AND payment.posted_at >= $2::timestamptz
    AND payment.posted_at < $3::timestamptz
ORDER BY payment.posted_at, payment.transaction_reference;
