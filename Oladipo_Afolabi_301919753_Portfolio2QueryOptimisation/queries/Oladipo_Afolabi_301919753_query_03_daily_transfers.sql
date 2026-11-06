-- Group completed transfers by day. Use UTC so the day is unambiguous.
-- Count only the positive entry: otherwise each transfer would be counted twice.
-- This reports transfers made, rather than net movement after any later reversal.
SELECT
    (payment.posted_at AT TIME ZONE 'UTC')::date AS transfer_day,
    COUNT(*) AS transfer_count,
    SUM(entry.amount_minor) AS total_minor,
    ROUND(SUM(entry.amount_minor) / 100.0, 2) AS total_ngn
FROM transactions AS payment
JOIN transaction_entries AS entry ON entry.transaction_id = payment.transaction_id
WHERE payment.transaction_type = 'transfer'
    AND payment.status = 'posted'
    AND entry.amount_minor > 0
GROUP BY (payment.posted_at AT TIME ZONE 'UTC')::date
ORDER BY transfer_day;
