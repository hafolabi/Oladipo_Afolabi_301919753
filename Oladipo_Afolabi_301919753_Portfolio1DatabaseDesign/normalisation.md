# Normalisation — first draft

The aim of this design is to give each fact a clear home. A customer's email should be stored with the customer, an account's status with the account, and a payment's details with the transaction. This keeps updates manageable and makes it easier to follow the payment history. The explanation below follows the current schema and will need another check once the SQL tables are built.

## What would go wrong with one large table?

One large payment record could hold the customer name and email, account number and status, payment details, a list of money entries, and a list of audit events. That layout would repeat the same customer and account details every time a payment was made.

If a customer changed their email, several payment records would need updating. An account might also be impossible to add without inventing a payment first. Deleting a customer's only payment record could remove the only stored copy of their details. Splitting the data into related tables avoids these update, insertion, and deletion problems.

## First normal form: separate repeating groups

Each table has a key, and each field holds one value for the purposes of this application. Every account posting gets its own `transaction_entries` row, and every audit event gets its own `audit_events` row. This removes repeating lists from a payment record.

For example, a transfer has two entry rows, one for each account. There is no need to squeeze both account numbers and amounts into comma-separated fields. First and last names are also stored separately because the planned queries may use them individually.

## Second normal form: remove partial dependencies

The key for `transaction_entries` is the pair `(transaction_id, account_id)`. Both parts are needed to identify the entry. The transaction ID alone does not say which account's amount is being recorded, and the account ID alone does not say which payment it belongs to. The `amount_minor` therefore depends on the whole key.

Payment type, status, and request time depend only on the transaction ID, so they stay in `transactions`. Account number, ownership, and status depend only on the account ID, so they stay in `accounts`. Keeping those details out of entry rows removes dependencies on just part of the composite key. The other tables have single-field candidate keys, so there is no smaller part of those keys for an attribute to depend on.

## Third normal form: remove transitive dependencies

Customer name and email belong in `customers`. Putting the email in `accounts` would create the dependency `account_id → customer_id → email`: the email belongs to the customer who owns the account. Storing just the customer foreign key in the account avoids repeating that fact.

The same reasoning applies to audit events. An event links to its transaction, so it does not need its own copies of the payment reference, type, and status.

For the current design, the main functional dependencies are:

| Relation | Determinant | Dependent attributes |
| --- | --- | --- |
| `customers` | `customer_id`, or unique canonical `email` | All other customer attributes |
| `accounts` | `account_id`, or `account_number` | All other account attributes |
| `transactions` | `transaction_id`, `transaction_reference`, or `idempotency_key` | All other transaction attributes |
| `transaction_entries` | `(transaction_id, account_id)` | `amount_minor` |
| `audit_events` | `event_id` | All other event attributes |

Under the project's assumptions, no non-key field determines another independent non-key fact in these tables. Status and type fields use a fixed set of allowed values, with no separate code descriptions stored beside them. Every account uses NGN. Balances are calculated from the postings, so there is no second editable balance to keep in step with the payment history.

The design is intended to meet third normal form under these assumptions. The database still needs payment routines, constraints, and concurrency control to keep entries balanced and prevent overdrafts. Those checks are described in the schema and planned for Portfolio 3.
