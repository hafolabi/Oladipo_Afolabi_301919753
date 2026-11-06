-- Show Ada's accounts, including the spare account with no payments.
-- CASE counts only completed payments. COALESCE gives an unused account zero.
SELECT
    account.account_number,
    account.status,
    COALESCE(SUM(
        CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END
    ), 0) AS balance_minor,
    ROUND(COALESCE(SUM(
        CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END
    ), 0) / 100.0, 2) AS balance_ngn
FROM customers AS customer
JOIN accounts AS account ON account.customer_id = customer.customer_id
LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
WHERE customer.email = 'ada@example.test'
GROUP BY account.account_id
ORDER BY account.account_number;
