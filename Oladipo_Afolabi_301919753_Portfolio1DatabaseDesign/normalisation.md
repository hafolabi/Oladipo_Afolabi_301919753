# Normalisation

Normalisation helps us decide which facts belong together in a table. For AfolabiPay, the aim is to avoid repeating customer and account details every time someone makes a payment.

For example, if Ada makes ten payments, her email should still be stored once in `customers`. Changing her email then means updating one row. These notes explain the five tables in [schema.sql](schema.sql).

## Why one large table would cause problems

Imagine keeping the payment, customer details, account details, and action notes in one record:

```text
Payment(reference, type, status,
        entries = [{account_number, owner_email, amount}, ...],
        audit_events = [{actor, action, time, details}, ...])
```

The entries and audit events can repeat. Customer details would also appear in many payments. This creates three common problems, called **anomalies**:

- **Update:** changing an email means finding and changing every copy.
- **Insertion:** it is awkward to add a customer who has not made a payment yet.
- **Deletion:** removing their last payment could also remove the only copy of their details.

## First normal form: one value in each field

Each column holds one value for that row. Instead of storing both account numbers or several amounts in one field, each payment entry gets its own row in `transaction_entries`. Each audit event also gets its own row.

For Ada's transfer to Bello, there are two entries: one taking money from Ada and one adding it to Bello. This is easier to query than a comma-separated list of accounts and amounts.

## Second normal form: use the whole key

The key for `transaction_entries` is the pair `(transaction_id, account_id)`. We need both IDs: which payment is this, and which account does this entry affect?

The amount belongs to that pair. The payment's status depends only on `transaction_id`, so it stays in `transactions`. The account number depends only on `account_id`, so it stays in `accounts`. We do not copy either into the entry row.

This removes **partial dependencies**: facts that depend on only part of a combined key. The other tables use single-column candidate keys, so this particular issue does not arise for them.

## Third normal form: keep customer facts with the customer

An account links to its owner through `customer_id`. It does not store another copy of the customer's name or email.

If we put the email in `accounts`, the dependency would be:

```text
account_id → customer_id → email
```

The account identifies a customer, and the customer identifies the email. This is a **transitive dependency**. Keeping the email in `customers` avoids it. The same idea applies to audit events: they link to a payment without copying its reference, type, and status.

## The dependencies in this design

A **functional dependency** means one value, or group of values, determines another. Here, each key below identifies the rest of its row:

| Table | Key that determines the other columns |
| --- | --- |
| `customers` | `customer_id`, or the unique lowercase email |
| `accounts` | `account_id`, or the unique account number |
| `transactions` | `transaction_id`, or the unique payment reference |
| `transaction_entries` | `transaction_id` and `account_id` together |
| `audit_events` | `event_id` |

Under this project's assumptions, the tables follow 3NF: each field holds one value, facts depend on the whole key, and customer or payment details are not copied into other tables through another non-key field. Foreign keys let us join the tables when we need those details.

All accounts use NGN, and statuses are short allowed values with no extra descriptions to store. If we later add currency details or other facts about those codes, we can consider separate lookup tables.

Normalisation does not check that a payment balances or that a customer has enough money. The [saved checks](evidence/schema_validation.txt) test the sample data. Payment checks and locking are separate topics for Portfolio 3.
