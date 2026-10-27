# Relational schema

The model has five tables. Customer and account details stay separate from payments, and each completed payment has two entries showing the money leaving one account and entering another. This is a simplified wallet ledger for the case study. The PostgreSQL types are set out below; the SQL script is still to write.

## Tables and keys

A primary key (PK) identifies a row. A foreign key (FK) links it to a related row. Candidate keys are the fields, or combinations of fields, that could uniquely identify each row.

| Relation | Proposed columns | Keys and relationships |
| --- | --- | --- |
| `customers` | `customer_id` bigint, `first_name` text, `last_name` text, `email` text, `phone` text, `verification_status` text, `created_at` timestamptz | PK `customer_id`; candidate key `email` |
| `accounts` | `account_id` bigint, `account_number` text, `customer_id` bigint nullable, `account_kind` text, `currency_code` text, `status` text, `opened_at` timestamptz | PK `account_id`; candidate key `account_number`; FK `customer_id → customers` |
| `transactions` | `transaction_id` bigint, `transaction_reference` text, `transaction_type` text, `status` text, `reversal_of_transaction_id` bigint nullable, `requested_at` timestamptz, `posted_at` timestamptz nullable, `failure_reason` text nullable | PK `transaction_id`; candidate key `transaction_reference`; nullable self-FK `reversal_of_transaction_id → transactions` |
| `transaction_entries` | `transaction_id` bigint, `account_id` bigint, `amount_minor` bigint | Composite PK `(transaction_id, account_id)`; FKs to `transactions` and `accounts` |
| `audit_events` | `event_id` bigint, `transaction_id` bigint nullable, `actor_reference` text, `action` text, `occurred_at` timestamptz, `details` text | PK `event_id`; nullable FK `transaction_id → transactions` |

Fields are required unless marked nullable. `actor_reference` is a descriptive label for the person or process performing an action; a login system is outside the core scope. I’ll trim email addresses and store them in lower case before checking uniqueness, so spacing and capital letters do not allow duplicate addresses.

## Relationships

- A customer can have several accounts or none yet. Each customer account has one owner; the system clearing account has no customer owner.
- A pending or failed transaction has no committed money entries. A posted transaction has exactly two.
- An account can appear in many transaction entries. A new account may have none.
- A transaction can have several audit events. An audit event can also describe an action unrelated to a payment, such as an account status change.
- Each reversal points to one original transaction. Failed reversal attempts may be recorded, but only one reversal of the original can be posted successfully.

## Constraints to build into the tables

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

A withdrawal can have valid fields and still leave an account overdrawn. The example SQL transactions will therefore need to check related rows and use locking in the concurrency demonstration. The write-up will distinguish rules enforced by table constraints from checks performed by the example scripts. A database-wide permission system and deferred constraint triggers are optional extensions.

1. A posted transaction must have two entries on different accounts, with equal amounts and opposite signs. Pending and failed transactions must have no committed money entries.
2. Transfers connect customer accounts. Deposits move money from clearing to a customer; withdrawals move it back to clearing.
3. A reversal example must use the original payment’s accounts and negate its entries. It will check that the original is posted, is not itself a reversal, and has not already been reversed. A partial unique index preventing duplicate posted reversals could be added as an extension.
4. Customer balances must stay at zero or above in the payment examples. The controlled concurrency script will lock affected account rows in a consistent order and check the balance after acquiring the locks. The test notes will record the isolation level used.
5. A customer must be verified before opening an account, and accounts must be active for ordinary payments. Administrative exceptions are outside the initial scope.
6. The example scripts will preserve posted history. A correction adds opposite entries and an audit record, keeping the original transaction visible.

These rules guide the classroom demonstrations. The core plan does not claim that every possible direct SQL write is blocked by a production security or trigger layer. Request-retry handling, including idempotency keys and stored request payloads, has been left out of the core model.

## Calculating a balance

An account's balance is the sum of its entries from posted transactions:

`balance_minor(account) = SUM(amount_minor)`

With no entries, the balance is zero. Positive amounts add money; negative amounts take it away. I’m keeping the entries as the record from which the balance is calculated, with no separate editable balance column in this model.

Suppose Customer A deposits NGN 10,000.00 and sends NGN 2,000.00 to Customer B. The expected entries are below. This is a worked example, still to test in the database.

| Operation | Account | Amount in kobo |
| --- | --- | ---: |
| Deposit NGN 10,000.00 | System clearing | -1000000 |
| Same deposit | Customer A | +1000000 |
| Transfer NGN 2,000.00 | Customer A | -200000 |
| Same transfer | Customer B | +200000 |

A should finish with NGN 8,000.00 and B with NGN 2,000.00. Clearing should show NGN -10,000.00, offsetting the opening deposit. Each transaction’s entries add up to zero. This clearing account is a simple way to track deposits and withdrawals within the teaching model.
