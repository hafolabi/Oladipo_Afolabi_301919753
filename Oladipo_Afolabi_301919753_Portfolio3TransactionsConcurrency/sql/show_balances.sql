-- Include unused accounts and the clearing account so both sides can be checked.
SELECT
    account.account_number,
    account.account_kind,
    COALESCE(SUM(
        CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END
    ), 0)::text AS balance_minor,
    ROUND(COALESCE(SUM(
        CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END
    ), 0) / 100.0, 2)::text AS balance_ngn
FROM accounts AS account
LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
GROUP BY account.account_id
ORDER BY account.account_number;
