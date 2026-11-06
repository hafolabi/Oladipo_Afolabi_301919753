-- Show the customer accounts available in the menu, including unused accounts.
SELECT
    account.account_number,
    customer.first_name || ' ' || customer.last_name AS owner,
    account.status,
    ROUND(COALESCE(SUM(
        CASE WHEN payment.status = 'posted' THEN entry.amount_minor ELSE 0 END
    ), 0) / 100.0, 2)::text AS balance_ngn
FROM accounts AS account
JOIN customers AS customer ON customer.customer_id = account.customer_id
LEFT JOIN transaction_entries AS entry ON entry.account_id = account.account_id
LEFT JOIN transactions AS payment ON payment.transaction_id = entry.transaction_id
WHERE account.account_type = 'customer'
GROUP BY account.account_id, customer.customer_id
ORDER BY account.account_number;
