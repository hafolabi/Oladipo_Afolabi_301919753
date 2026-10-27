# Normalisation

The tables separate facts that belong to different things: a customer’s email, an account’s status, and a payment’s details. That means a change to one fact can be made in one place. This explanation follows the current design; I’ll check it against the SQL tables once they are built.

## The problem with one large payment record

Putting customer details, account details, payment entries, and audit events into one record would repeat a lot of information. A customer making ten payments would have the same name and email stored against all ten.

Changing that email would mean updating several records. It could also be difficult to add an account before its first payment, or to delete a payment without losing the only copy of the customer’s details. These are the update, insertion, and deletion problems the separate tables are intended to avoid.

## First normal form: separate repeating groups

Each table has a key, and each field holds one value for this application. Account postings have separate rows in `transaction_entries`, and audit events have separate rows in `audit_events`.

A transfer therefore has two entry rows, one for each account. Account numbers and amounts do not need to be packed into comma-separated fields. First and last names are separate because the queries may use them individually.

## Second normal form: remove partial dependencies

In `transaction_entries`, the key is `(transaction_id, account_id)`. The transaction ID identifies the payment, and the account ID identifies the account affected. Both are needed to identify a particular entry, so `amount_minor` depends on the whole key.

Payment type, status, and request time depend only on the transaction ID and belong in `transactions`. Account number, ownership, and status depend only on the account ID and belong in `accounts`. Leaving those details out of entry rows removes dependencies on part of the composite key. The other tables have single-field candidate keys, so partial key dependencies do not arise there.

## Third normal form: remove transitive dependencies

Customer name and email stay in `customers`. If email were also stored in `accounts`, the dependency would be `account_id → customer_id → email`. An account identifies its owner, and that owner determines the email. Keeping the customer foreign key in the account avoids duplicating the email.

Audit events follow the same approach: they link to the transaction without copying its payment reference, type, and status.

The main functional dependencies are:

| Relation | Determinant | Dependent attributes |
| --- | --- | --- |
| `customers` | `customer_id`, or unique canonical `email` | All other customer attributes |
| `accounts` | `account_id`, or `account_number` | All other account attributes |
| `transactions` | `transaction_id` or `transaction_reference` | All other transaction attributes |
| `transaction_entries` | `(transaction_id, account_id)` | `amount_minor` |
| `audit_events` | `event_id` | All other event attributes |

Under the project’s assumptions, no non-key field determines another independent non-key fact in these tables. Status and type fields use fixed allowed values, with no code descriptions stored beside them. All accounts use NGN. Calculating balances from postings also avoids maintaining a separate editable balance alongside the payment history.

These choices are intended to give a third normal form design. Payment routines, constraints, and concurrency control still need to keep entries balanced and prevent overdrafts. Those checks are set out in the schema and will be tested in Portfolio 3.
