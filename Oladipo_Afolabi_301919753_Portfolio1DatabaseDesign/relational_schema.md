# Relational schema — first draft

The design uses five tables to keep customer details, accounts, payments, account entries, and audit events separate. The types below are planned for PostgreSQL; the SQL script still needs to be written. Together, the payment entries form a simplified wallet ledger where each completed payment has a matching outgoing and incoming amount.

## Tables and keys

A primary key (PK) identifies a row, and a foreign key (FK) points to a related row. A candidate key is another field, or combination of fields, that could uniquely identify the row.

| Relation | Proposed columns | Keys and relationships |
| --- | --- | --- |
| `customers` | `customer_id` bigint, `first_name` text, `last_name` text, `email` text, `phone` text, `verification_status` text, `created_at` timestamptz | PK `customer_id`; candidate key `email` |
| `accounts` | `account_id` bigint, `account_number` text, `customer_id` bigint nullable, `account_kind` text, `currency_code` text, `status` text, `opened_at` timestamptz | PK `account_id`; candidate key `account_number`; FK `customer_id → customers` |
| `transactions` | `transaction_id` bigint, `transaction_reference` text, `idempotency_key` text, `transaction_type` text, `status` text, `reversal_of_transaction_id` bigint nullable, `requested_at` timestamptz, `posted_at` timestamptz nullable, `failure_reason` text nullable | PK `transaction_id`; candidate keys `transaction_reference`, `idempotency_key`; nullable self-FK `reversal_of_transaction_id → transactions` |
| `transaction_entries` | `transaction_id` bigint, `account_id` bigint, `amount_minor` bigint | Composite PK `(transaction_id, account_id)`; FKs to `transactions` and `accounts` |
| `audit_events` | `event_id` bigint, `transaction_id` bigint nullable, `actor_reference` text, `action` text, `occurred_at` timestamptz, `details` text | PK `event_id`; nullable FK `transaction_id → transactions` |

All fields are required unless marked nullable. `actor_reference` records the database or application user responsible for an action; login handling still needs its own implementation. Email addresses will be trimmed and stored in lower case before checking uniqueness, so differences in spacing or capital letters do not create duplicate addresses.

## Relationships

- A customer can have several accounts or none yet. Each customer account has one owner; the system clearing account has no customer owner.
- A pending or failed transaction has no committed money entries. A posted transaction has exactly two.
- An account can appear in many transaction entries. A new account may have none.
- A transaction can have several audit events. An audit event can also describe an action unrelated to a payment, such as an account status change.
- Each reversal points to one original transaction. Failed reversal attempts may be recorded, but only one reversal of the original can be posted successfully.

## Checks within a row

| Rule | Intended implementation |
| --- | --- |
| IDs and payment references cannot be missing or duplicated | Primary keys, `UNIQUE`, and `NOT NULL` |
| Linked customers, accounts, and transactions must exist | Foreign keys; restrict deletion of referenced financial history |
| Verification status must be one of the allowed values | `CHECK` over `pending`, `verified`, `rejected` |
| Account kind must be one of the allowed values | `CHECK` over `customer`, `system_clearing` |
| Ownership matches account kind | `CHECK`: customer kind requires an owner; system clearing kind requires a null owner |
| All accounts use NGN | `CHECK (currency_code = 'NGN')` |
| Account status must be one of the allowed values | `CHECK` over `active`, `frozen`, `closed` |
| Transaction type and status must use allowed values | `CHECK` over `deposit`, `withdrawal`, `transfer`, `reversal`; status `pending`, `posted`, `failed` |
| Posting time must agree with the transaction status | Posted rows require `posted_at >= requested_at`; other statuses require a null posting time |
| Failed transactions need an explanation | Failed rows require a non-empty failure reason; other statuses have no failure reason |
| A reversal must point to its original transaction | `CHECK`: the original reference is present exactly when type is `reversal`; a transaction cannot reference itself |
| An entry cannot move zero money | `CHECK (amount_minor <> 0)` |

## Rules that involve more than one row

Checking each row on its own is not enough to make a payment safe. For example, a valid withdrawal amount could still leave an account overdrawn. Posting and reversal routines will need to check related rows, use locks, and control who can write financial entries. Some checks may also need deferred constraint triggers so they can inspect the complete transaction before it commits.

1. Every posted transaction must have two entries on different accounts. Their amounts must be equal with opposite signs. Pending and failed transactions must leave no committed money entries.
2. A transfer moves money between customer accounts. A deposit moves money from clearing to a customer, and a withdrawal moves it from a customer to clearing.
3. A reversal must use the same accounts as the original payment and reverse the signs of its entries. The original must be posted and cannot itself be a reversal. A planned partial unique index on `reversal_of_transaction_id`, covering posted reversals, will prevent a second successful reversal of the same payment.
4. A customer balance must stay at zero or above. Before calculating balances and adding entries, every routine that posts money must lock the affected account rows in the same order. The implementation and experiments will record the isolation level used.
5. A customer must be verified before an account is opened. Accounts must be active for ordinary payments. Administrative exceptions are outside the initial scope.
6. The normal application role must not edit or delete posted transactions or their entries. Corrections add a reversal and an audit record, keeping the original history intact.
7. An idempotency key lets the system recognise a request that has been sent again. The retry must have the same type, accounts, and amount. Reusing the key for different payment details must be rejected. A unique key alone cannot make this comparison, so a separate record of request details may be needed for pending or failed payments during implementation.

## Calculating a balance

An account's balance is the sum of its entries from posted transactions:

`balance_minor(account) = SUM(amount_minor)`

An account with no entries has a zero balance. Positive amounts add money and negative amounts take money away. In this first design, the balance is calculated from the entries rather than saved in a separate editable column.

For example, suppose Customer A deposits NGN 10,000.00 and then sends NGN 2,000.00 to Customer B. The expected entries are shown below. This example has not been run in the database yet.

| Operation | Account | Amount in kobo |
| --- | --- | ---: |
| Deposit NGN 10,000.00 | System clearing | -1000000 |
| Same deposit | Customer A | +1000000 |
| Transfer NGN 2,000.00 | Customer A | -200000 |
| Same transfer | Customer B | +200000 |

After those two payments, A should have NGN 8,000.00 and B should have NGN 2,000.00. Clearing should have NGN -10,000.00 because it supplied the opening deposit in this model. Each transaction's entries add up to zero. The clearing account is a simplified way of tracking deposits and withdrawals for this project.
