-- Show completed payments for Ada's main account on 2 October, using UTC.
-- Include the start of the day and stop before the next day starts.
-- Keep these account and date values the same before and after adding the index.
SELECT
    payment.transaction_reference,
    payment.transaction_type,
    payment.posted_at,
    entry.amount_minor,
    ROUND(entry.amount_minor / 100.0, 2) AS amount_ngn
FROM accounts AS account
JOIN transaction_entries AS entry ON entry.account_id = account.account_id
JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
WHERE account.account_number = '1000000001'
    AND payment.status = 'posted'
    AND payment.posted_at >= '2026-10-02 00:00:00+00'
    AND payment.posted_at < '2026-10-03 00:00:00+00'
ORDER BY payment.posted_at, payment.transaction_reference;
