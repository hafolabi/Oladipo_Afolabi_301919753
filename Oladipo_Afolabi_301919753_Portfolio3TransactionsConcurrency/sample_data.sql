-- Reuse just the people and accounts needed for these four experiments.
-- Payments are added separately so each experiment can choose its starting funds.
BEGIN;

INSERT INTO customers (first_name, last_name, email, phone, verification_status)
VALUES
    ('Ada', 'Okafor', 'ada@example.test', '+2340000000001', 'verified'),
    ('Bello', 'Musa', 'bello@example.test', '+2340000000002', 'verified');

INSERT INTO accounts (account_number, customer_id, account_kind, status)
VALUES
    ('0000000000', NULL, 'system_clearing', 'active'),
    ('1000000001', 1, 'customer', 'active'),
    ('1000000002', 2, 'customer', 'active');

COMMIT;
