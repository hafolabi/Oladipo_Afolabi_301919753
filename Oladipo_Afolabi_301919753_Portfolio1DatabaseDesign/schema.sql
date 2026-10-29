-- This file creates the five AfolabiPay tables. Run it once in an empty database.
-- BEGIN and COMMIT save the setup together as one database transaction.
BEGIN;

-- Each row is one customer.
-- IDENTITY gives each new customer an ID automatically.
-- PRIMARY KEY makes that ID unique. NOT NULL means a value is required.
CREATE TABLE customers (
    customer_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name text NOT NULL CHECK (btrim(first_name) <> ''),
    last_name text NOT NULL CHECK (btrim(last_name) <> ''),
    email text NOT NULL,
    phone text NOT NULL CHECK (btrim(phone) <> ''),
    verification_status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_email_key UNIQUE (email),
    -- Keep emails lowercase with no spaces at either end.
    -- In JavaScript, the same preparation is email.trim().toLowerCase().
    CONSTRAINT customers_email_canonical_ck CHECK (
        email <> '' AND email = lower(btrim(email))
    ),
    CONSTRAINT customers_verification_status_ck CHECK (
        verification_status IN ('pending', 'verified', 'rejected')
    )
);

-- An account links to its owner through customer_id.
-- REFERENCES checks that the linked row exists.
-- ON DELETE RESTRICT stops us deleting a row that other records still use.
CREATE TABLE accounts (
    account_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_number text NOT NULL UNIQUE,
    customer_id bigint REFERENCES customers (customer_id) ON DELETE RESTRICT,
    account_kind text NOT NULL,
    currency_code text NOT NULL DEFAULT 'NGN',
    status text NOT NULL DEFAULT 'active',
    opened_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Store account numbers as text so the first zero is kept.
    -- This pattern accepts exactly ten digits.
    CONSTRAINT accounts_number_format_ck CHECK (account_number ~ '^[0-9]{10}$'),
    CONSTRAINT accounts_kind_ck CHECK (account_kind IN ('customer', 'system_clearing')),
    -- Customer accounts need an owner. The clearing account has no customer.
    CONSTRAINT accounts_ownership_ck CHECK (
        (account_kind = 'customer' AND customer_id IS NOT NULL)
        OR (account_kind = 'system_clearing' AND customer_id IS NULL)
    ),
    CONSTRAINT accounts_currency_ck CHECK (currency_code = 'NGN'),
    CONSTRAINT accounts_status_ck CHECK (status IN ('active', 'frozen', 'closed'))
);

-- Each row describes one payment. Its money movements go in transaction_entries.
-- Here, 'posted' means the payment has completed.
CREATE TABLE transactions (
    transaction_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_reference text NOT NULL UNIQUE,
    transaction_type text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    reversal_of_transaction_id bigint REFERENCES transactions (transaction_id) ON DELETE RESTRICT,
    requested_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posted_at timestamptz,
    failure_reason text,
    CONSTRAINT transactions_reference_ck CHECK (btrim(transaction_reference) <> ''),
    CONSTRAINT transactions_type_ck CHECK (
        transaction_type IN ('deposit', 'withdrawal', 'transfer', 'reversal')
    ),
    CONSTRAINT transactions_status_ck CHECK (status IN ('pending', 'posted', 'failed')),
    -- A completed payment needs a time. Other payments should not have one yet.
    -- Check for NULL as well: comparing a missing time alone will not reject it.
    CONSTRAINT transactions_posting_state_ck CHECK (
        (status = 'posted' AND posted_at IS NOT NULL AND posted_at >= requested_at)
        OR (status IN ('pending', 'failed') AND posted_at IS NULL)
    ),
    -- Keep a reason for failed payments, and leave it empty for other statuses.
    CONSTRAINT transactions_failure_state_ck CHECK (
        (status = 'failed' AND failure_reason IS NOT NULL AND btrim(failure_reason) <> '')
        OR (status IN ('pending', 'posted') AND failure_reason IS NULL)
    ),
    -- A reversal must say which payment it is undoing.
    CONSTRAINT transactions_reversal_link_ck CHECK (
        (transaction_type = 'reversal' AND reversal_of_transaction_id IS NOT NULL)
        OR (transaction_type <> 'reversal' AND reversal_of_transaction_id IS NULL)
    ),
    CONSTRAINT transactions_no_self_reversal_ck CHECK (
        reversal_of_transaction_id IS NULL OR reversal_of_transaction_id <> transaction_id
    )
);

-- These are the money movements: negative takes money out, positive puts it in.
-- Store kobo, so NGN 500.00 is 50000. There is no editable balance column.
CREATE TABLE transaction_entries (
    transaction_id bigint NOT NULL REFERENCES transactions (transaction_id) ON DELETE RESTRICT,
    account_id bigint NOT NULL REFERENCES accounts (account_id) ON DELETE RESTRICT,
    amount_minor bigint NOT NULL,
    -- The two IDs together identify one entry for an account in a payment.
    PRIMARY KEY (transaction_id, account_id),
    CONSTRAINT transaction_entries_nonzero_ck CHECK (amount_minor <> 0)
);

-- Keep a short record of who did something and what happened.
-- transaction_id can be NULL when the event is not about a payment.
CREATE TABLE audit_events (
    event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id bigint REFERENCES transactions (transaction_id) ON DELETE RESTRICT,
    actor_reference text NOT NULL CHECK (btrim(actor_reference) <> ''),
    action text NOT NULL CHECK (btrim(action) <> ''),
    occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details text NOT NULL CHECK (btrim(details) <> '')
);

COMMIT;
