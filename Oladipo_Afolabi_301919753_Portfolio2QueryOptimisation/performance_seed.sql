-- Add more made-up payments so we can see a difference when testing the index.
-- Run this once, after Portfolio 1's schema.sql and seed.sql, in a fresh setup.
-- generate_series(1, 199) counts from 1 to 199, like a for loop in JavaScript.
-- || joins text. LPAD adds leading zeroes, like String(number).padStart(...).
BEGIN;

INSERT INTO customers (first_name, last_name, email, phone, verification_status, created_at)
SELECT 'Example', 'Customer ' || number,
       'performance' || number || '@example.test',
       '+2340001' || LPAD(number::text, 6, '0'),
       'verified', '2026-10-01 08:00:00+00'
FROM generate_series(1, 199) AS numbers(number);

-- Each new customer gets one active account. Account numbers still have ten digits.
INSERT INTO accounts (account_number, customer_id, account_kind, opened_at)
SELECT '8' || LPAD(number::text, 9, '0'), customer.customer_id,
       'customer', '2026-10-01 09:00:00+00'
FROM generate_series(1, 199) AS numbers(number)
JOIN customers AS customer ON customer.email = 'performance' || number || '@example.test';

-- Number the accounts from 0 to 199 so we can send money around the list.
-- Ada is position 0. The new accounts use positions 1 to 199.
-- PostgreSQL removes this temporary helper table when we reach COMMIT.
CREATE TEMP TABLE performance_accounts (
    position integer PRIMARY KEY,
    account_id bigint NOT NULL
) ON COMMIT DROP;

INSERT INTO performance_accounts (position, account_id)
SELECT 0, account_id FROM accounts WHERE account_number = '1000000001';

INSERT INTO performance_accounts (position, account_id)
SELECT number, account.account_id
FROM generate_series(1, 199) AS numbers(number)
JOIN accounts AS account ON account.account_number = '8' || LPAD(number::text, 9, '0');

-- Fund all 200 accounts through recorded deposits of NGN 10,000 each.
INSERT INTO transactions (transaction_reference, transaction_type, status, requested_at, posted_at)
SELECT 'PERF-DEP-' || position, 'deposit', 'posted',
       '2026-10-02 08:00:00+00', '2026-10-02 08:00:01+00'
FROM performance_accounts;

INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
SELECT payment.transaction_id, account.account_id, 1000000
FROM performance_accounts AS account
JOIN transactions AS payment ON payment.transaction_reference = 'PERF-DEP-' || account.position;

-- Clearing supplies the other side of each deposit.
INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
SELECT payment.transaction_id, clearing.account_id, -1000000
FROM transactions AS payment
JOIN accounts AS clearing ON clearing.account_number = '0000000000'
WHERE payment.transaction_reference LIKE 'PERF-DEP-%';

-- Create 20,000 transfers of NGN 50, each one second apart.
INSERT INTO transactions (transaction_reference, transaction_type, status, requested_at, posted_at)
SELECT 'PERF-TRF-' || number, 'transfer', 'posted',
       '2026-10-02 09:10:00+00'::timestamptz + number * interval '1 second',
       '2026-10-02 09:10:00+00'::timestamptz + (number + 1) * interval '1 second'
FROM generate_series(1, 20000) AS numbers(number);

-- Send money around the list: account 0 to 1, then 1 to 2, and so on.
-- % is the remainder operator, as in JavaScript. It wraps position 199 back to 0.
-- After 100 full rounds each account has sent and received the same total.
INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
SELECT payment.transaction_id, sender.account_id, -5000
FROM generate_series(1, 20000) AS numbers(number)
JOIN transactions AS payment ON payment.transaction_reference = 'PERF-TRF-' || number
JOIN performance_accounts AS sender ON sender.position = (number - 1) % 200;

-- Add the matching positive entry for the receiver.
INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
SELECT payment.transaction_id, receiver.account_id, 5000
FROM generate_series(1, 20000) AS numbers(number)
JOIN transactions AS payment ON payment.transaction_reference = 'PERF-TRF-' || number
JOIN performance_accounts AS receiver ON receiver.position = number % 200;

COMMIT;
