# Relational schema

A relational schema describes the tables, their columns, and how they connect. This design uses five tables. [Oladipo_Afolabi_301919753_schema.sql](Oladipo_Afolabi_301919753_schema.sql) creates them, and [Oladipo_Afolabi_301919753_table_definitions.json](evidence/Oladipo_Afolabi_301919753_table_definitions.json) records what PostgreSQL created.

## Types and keys used here

| Term | Meaning |
| --- | --- |
| `bigint` | A whole number with room for large values; used for IDs and kobo |
| `text` | A string, such as a name or account number |
| `timestamptz` | A date and time representing an instant, displayed in the chosen time zone |
| Primary key (PK) | Identifies one row uniquely |
| Foreign key (FK) | Points to a row that must exist in another table |
| Candidate key | A column or combination that could uniquely identify the row |
| Nullable | The column may be `NULL`, meaning no value is recorded |

All columns are required unless the description says they are nullable. The four single-column primary keys use `GENERATED ALWAYS AS IDENTITY`, which lets PostgreSQL assign IDs automatically.

## Customers

| Column | Type | Purpose |
| --- | --- | --- |
| `customer_id` | bigint | PK, generated automatically |
| `first_name` | text | Customer's first name |
| `last_name` | text | Customer's last name |
| `email` | text | Unique email; another candidate key |
| `phone` | text | Contact number; it does not have to be unique |
| `verification_status` | text | `pending`, `verified`, or `rejected`; defaults to `pending` |
| `status` | text | `active`, `deleted`, or `suspended`; defaults to `active` |
| `created_at` | timestamptz | When the customer was added; defaults to the current time |
| `updated_at` | timestamptz | Defaults to the current time; refreshed automatically on every customer update |

Emails are lowercase with no spaces at either end. The caller prepares the email before insertion, and the database rejects it if it is not in that form. Customer identities and contact details are fictional sample data.

Customer status is separate from identity verification and account status. `deleted` marks a soft deletion: the customer row and linked financial history stay in the database. Changing customer status does not automatically change an account's status.

The `customers_updated_at_trg` trigger sets `updated_at` to the update statement's timestamp, including when a status changes. Ordinary profile and status updates leave `created_at` unchanged. The sample data starts with matching creation and update times.

## Accounts

| Column | Type | Purpose |
| --- | --- | --- |
| `account_id` | bigint | PK, generated automatically |
| `account_number` | text | Unique ten-digit number; another candidate key |
| `customer_id` | bigint | FK to `customers`; nullable for clearing |
| `account_type` | text | `customer` or `system_clearing` |
| `currency_code` | text | Always `NGN`, which is also the default |
| `status` | text | `active`, `frozen`, or `closed`; defaults to `active` |
| `opened_at` | timestamptz | When the account was opened; defaults to the current time |

A customer can have no accounts yet or several accounts. Every customer account has one owner. Clearing has no customer owner. Account numbers are text so a number such as `0000000000` keeps its leading zeroes.

## Transactions

| Column | Type | Purpose |
| --- | --- | --- |
| `transaction_id` | bigint | PK, generated automatically |
| `transaction_reference` | text | Unique payment reference; another candidate key |
| `transaction_type` | text | `deposit`, `withdrawal`, `transfer`, or `reversal` |
| `status` | text | `pending`, `posted`, or `failed`; defaults to `pending` |
| `reversal_of_transaction_id` | bigint | FK to the original payment in this same table; nullable for other types |
| `requested_at` | timestamptz | When the request was made; defaults to the current time |
| `posted_at` | timestamptz | When it completed; nullable until then |
| `failure_reason` | text | Why it failed; nullable for other statuses |

`posted` means completed. A posted payment must have a posting time at or after its request time. Pending and failed payments have no posting time. Failed payments need a nonblank reason, while other statuses have no failure reason.

A reversal names its original payment. Other types leave that link empty, and a payment cannot point to itself. Checking that the original is eligible to be reversed needs more than a single-row rule.

## Transaction entries

| Column | Type | Purpose |
| --- | --- | --- |
| `transaction_id` | bigint | FK to `transactions`; part of the PK |
| `account_id` | bigint | FK to `accounts`; part of the PK |
| `amount_minor` | bigint | Money added or removed, stored in kobo; cannot be zero |

The primary key is `(transaction_id, account_id)`. This is a **composite key**: the two values together identify the row. It prevents the same account appearing twice in one payment. One account can still appear in many different payments.

A completed payment has two entries on different accounts, with equal amounts and opposite signs. A pending or failed payment has none. The foreign keys allow several entry rows, so checking the required pair is a separate step.

## Audit events

| Column | Type | Purpose |
| --- | --- | --- |
| `event_id` | bigint | PK, generated automatically |
| `transaction_id` | bigint | FK to `transactions`; nullable when the event is not about a payment |
| `actor_reference` | text | A label for the person or script that acted |
| `action` | text | What happened |
| `occurred_at` | timestamptz | When it happened; defaults to the current time |
| `details` | text | A short explanation |

A payment can have several audit events. An event can also describe an account being frozen, as shown in the sample data. The actor is a descriptive label for the person or script associated with the event.

## Which rules the tables enforce

Primary keys, `UNIQUE`, and `NOT NULL` prevent duplicate identifiers and missing required data. `CHECK` restricts allowed statuses, ownership, account-number format, currency, timestamps, failure reasons, and reversal links. Required names and descriptions cannot be blank.

Foreign keys use `ON DELETE RESTRICT`: a referenced customer, account, or payment cannot be deleted. For example, an account with payment entries cannot be removed. This does not stop every possible edit to payment history.

The primary and unique keys also create the starting indexes. Portfolio 2 adds and measures an index for the account-history query.

## Rules involving several rows

[Oladipo_Afolabi_301919753_verify.sql](Oladipo_Afolabi_301919753_verify.sql) checks that the sample's completed payments have two entries adding up to zero. The [JavaScript runner](tools/Oladipo_Afolabi_301919753_verify.mjs) also checks its row counts and balances. These are checks of this sample, not rules automatically applied to every possible write.

A row-level `CHECK` cannot enforce all rules involving other rows; see PostgreSQL's [constraint documentation](https://www.postgresql.org/docs/18/ddl-constraints.html). Portfolio 3 demonstrates active-account checks, sufficient funds, and locks inside deposit, withdrawal, and transfer transactions.

## Calculating a balance

Add an account's entries from posted payments. Positive amounts add money and negative amounts take it away. With no entries, the balance is zero. There is no separate balance column to keep in sync.

For Ada's main account in the sample:

```text
Deposit:     +1000000 kobo
Transfer:     -200000 kobo
Balance:       800000 kobo = NGN 8,000.00
```

Bello's balance also includes his own deposit, withdrawal, and reversal; the full results are in the [README](Oladipo_Afolabi_301919753_README.md). Money is stored as exact integer amounts rather than floating-point values. PostgreSQL returns `numeric` when summing `bigint`, so the total has more room than one entry. See [Numeric Types](https://www.postgresql.org/docs/18/datatype-numeric.html) and [Aggregate Functions](https://www.postgresql.org/docs/18/functions-aggregate.html).
