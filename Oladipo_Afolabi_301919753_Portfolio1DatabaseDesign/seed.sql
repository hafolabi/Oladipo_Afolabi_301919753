-- Add made-up data so we have something to query.
-- Run this once, straight after schema.sql, with no earlier inserts.
-- The IDs below follow the order in which PostgreSQL adds these example rows.
BEGIN;

-- Customer IDs: 1 = Ada, 2 = Bello, 3 = Chika, 4 = Dami.
INSERT INTO customers (first_name, last_name, email, phone, verification_status, created_at)
VALUES
    ('Ada', 'Okafor', 'ada@example.test', '+2340000000001', 'verified', '2026-10-01 08:00:00+00'),
    ('Bello', 'Musa', 'bello@example.test', '+2340000000002', 'verified', '2026-10-01 08:05:00+00'),
    ('Chika', 'Obi', 'chika@example.test', '+2340000000003', 'verified', '2026-10-01 08:10:00+00'),
    ('Dami', 'Ade', 'dami@example.test', '+2340000000004', 'pending', '2026-10-01 08:15:00+00');

-- Account IDs: 1 = clearing, 2 = Ada, 3 = Bello, 4 = Ada's spare, 5 = Chika.
-- customer_id points to the customer above. NULL means there is no customer owner.
INSERT INTO accounts (account_number, customer_id, account_kind, status, opened_at)
VALUES
    ('0000000000', NULL, 'system_clearing', 'active', '2026-10-01 09:00:00+00'),
    ('1000000001', 1, 'customer', 'active', '2026-10-01 09:00:00+00'),
    ('1000000002', 2, 'customer', 'active', '2026-10-01 09:00:00+00'),
    ('1000000003', 1, 'customer', 'active', '2026-10-01 09:00:00+00'),
    ('1000000004', 3, 'customer', 'frozen', '2026-10-01 09:00:00+00');

-- Payments 1-4: two deposits, a transfer, and a withdrawal.
-- Payments 5-6: a failed request and a request that is still pending.
-- Payment 7: reverse payment 4, so reversal_of_transaction_id is 4.
INSERT INTO transactions (
    transaction_reference, transaction_type, status, reversal_of_transaction_id,
    requested_at, posted_at, failure_reason
)
VALUES
    ('DEP-001', 'deposit', 'posted', NULL, '2026-10-02 09:00:00+00', '2026-10-02 09:00:01+00', NULL),
    ('DEP-002', 'deposit', 'posted', NULL, '2026-10-02 09:05:00+00', '2026-10-02 09:05:01+00', NULL),
    ('TRF-001', 'transfer', 'posted', NULL, '2026-10-02 10:00:00+00', '2026-10-02 10:00:01+00', NULL),
    ('WDR-001', 'withdrawal', 'posted', NULL, '2026-10-02 11:00:00+00', '2026-10-02 11:00:01+00', NULL),
    ('WDR-FAIL-001', 'withdrawal', 'failed', NULL, '2026-10-02 12:00:00+00', NULL, 'Insufficient funds'),
    ('TRF-PEND-001', 'transfer', 'pending', NULL, '2026-10-02 12:05:00+00', NULL, NULL),
    ('REV-001', 'reversal', 'posted', 4, '2026-10-02 13:00:00+00', '2026-10-02 13:00:01+00', NULL);

-- Each completed payment has two entries. Each pair adds up to zero.
-- All amounts are kobo: 1000000 = NGN 10,000.00.
INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
VALUES
    -- Payment 1: Ada deposits NGN 10,000 from clearing into her account.
    (1, 1, -1000000),
    (1, 2,  1000000),
    -- Payment 2: Bello deposits NGN 5,000.
    (2, 1, -500000),
    (2, 3,  500000),
    -- Payment 3: Ada sends Bello NGN 2,000.
    (3, 2, -200000),
    (3, 3,  200000),
    -- Payment 4: Bello withdraws NGN 500.
    (4, 3, -50000),
    (4, 1,  50000),
    -- Payment 7: undo the withdrawal using the same amounts with opposite signs.
    (7, 3,  50000),
    (7, 1, -50000);

-- No entries for payments 5 and 6: they have not moved any money.

INSERT INTO audit_events (transaction_id, actor_reference, action, occurred_at, details)
VALUES
    (1, 'seed-script', 'payment_posted', '2026-10-02 09:00:01+00', 'Ada deposited NGN 10,000.'),
    (2, 'seed-script', 'payment_posted', '2026-10-02 09:05:01+00', 'Bello deposited NGN 5,000.'),
    (3, 'seed-script', 'payment_posted', '2026-10-02 10:00:01+00', 'Ada sent Bello NGN 2,000.'),
    (4, 'seed-script', 'payment_posted', '2026-10-02 11:00:01+00', 'Bello withdrew NGN 500.'),
    (5, 'seed-script', 'payment_failed', '2026-10-02 12:00:00+00', 'Withdrawal failed: insufficient funds.'),
    (6, 'seed-script', 'payment_pending', '2026-10-02 12:05:00+00', 'Transfer request is still pending.'),
    (7, 'seed-script', 'payment_posted', '2026-10-02 13:00:01+00', 'Bello received NGN 500 after reversing the withdrawal.'),
    (NULL, 'operations-demo', 'account_frozen', '2026-10-02 14:00:00+00', 'Account 1000000004 was frozen.');

COMMIT;
