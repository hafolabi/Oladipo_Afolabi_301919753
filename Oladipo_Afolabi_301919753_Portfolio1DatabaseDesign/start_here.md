# Start here: reading the database design

If you are coming from frontend work, begin with the data you would expect an API to return. A table stores rows with the same set of columns. For this example, you can picture rows as JavaScript objects:

```js
const customer = { customer_id: 1, first_name: 'Ada' };
const account = { account_id: 2, customer_id: 1, account_number: '1000000001' };
```

The account's `customer_id` points to Ada. In the database, a **foreign key** checks that the customer really exists. A **primary key** identifies each row, like `customer_id` in the first object.

## Read the files in this order

1. [case_study.md](case_study.md): what AfolabiPay does and what information it needs.
2. [er_diagram.svg](er_diagram.svg): a picture of the tables and their links.
3. [schema.sql](schema.sql): the SQL that creates those tables and their rules.
4. [seed.sql](seed.sql): made-up customers and payments, with comments explaining the IDs.
5. [normalisation.md](normalisation.md): why the information is split across tables.
6. [verify.sql](verify.sql): queries that check the example data and calculate balances.

The JavaScript files in `tools` run the checks automatically. You can read them after the SQL; they are supporting tools for this activity.

## What the five tables do

| Table | What one row means |
| --- | --- |
| `customers` | One person using AfolabiPay |
| `accounts` | One account, linked to its customer when it has an owner |
| `transactions` | One payment request, including its type and status |
| `transaction_entries` | Money added to or taken from one account in a payment |
| `audit_events` | A note about an action, including who did it and when |

`transactions` and `transaction_entries` have different jobs. For example, the transaction says “Ada sent Bello NGN 2,000.” Its two entries say “take NGN 2,000 from Ada” and “add NGN 2,000 to Bello.” Keeping both entries lets us trace the money.

## SQL words you will see

| SQL | Meaning here |
| --- | --- |
| `CREATE TABLE` | Create a place to store rows with these columns |
| `INSERT INTO ... VALUES` | Add rows |
| `SELECT ... FROM` | Read data |
| `WHERE` | Choose which rows to read or change |
| `PRIMARY KEY` | Identify a row uniquely |
| `REFERENCES` | Require an ID to exist in another table |
| `NOT NULL` | Require a value |
| `UNIQUE` | Prevent duplicate values |
| `CHECK` | Reject a row when it breaks a rule |
| `CONSTRAINT name` | Give a rule a name so it is easier to identify in errors |
| `DEFAULT` | Use this value when the insert leaves it out |
| `GENERATED ALWAYS AS IDENTITY` | Let PostgreSQL create the ID |
| `JOIN` | Read related rows from more than one table |
| `SUM` | Add numbers together |
| `GROUP BY` | Collect rows into groups, such as all entries for one payment |
| `HAVING` | Filter those groups after calculating their totals |
| `COALESCE(value, 0)` | Use zero if the value is `NULL`, similar to `value ?? 0` |
| `BEGIN` / `COMMIT` | Start a group of changes / save them |
| `ROLLBACK` | Undo changes that have not been committed |

`NULL` means a value is missing. It is different from zero or an empty string. `btrim(email)` and `trim(email)` remove spaces at either end of the email, and `lower(email)` makes it lowercase. Together, these do the same preparation as `email.trim().toLowerCase()` in JavaScript. The `<>` operator means “not equal.”

## Follow one transfer

In [seed.sql](seed.sql), Ada's main account is account `2`, Bello's is account `3`, and their transfer is payment `3`:

```sql
-- Read the entries for Ada's transfer to Bello.
SELECT account_id, amount_minor
FROM transaction_entries
WHERE transaction_id = 3;
```

| account_id | amount_minor | Meaning |
| --- | ---: | --- |
| 2 | -200000 | Take NGN 2,000 from Ada |
| 3 | 200000 | Add NGN 2,000 to Bello |

Amounts are stored in **kobo**, so divide by 100 to get naira. A negative entry takes money out and a positive entry adds it. These two entries add up to zero because this transfer moves money between the accounts.

Deposits and withdrawals use a **clearing account** for the other entry. In this small example, it records money coming from or going outside AfolabiPay. It is not owned by a customer, and its balance is allowed to be negative.

An account's balance comes from adding its completed entries. `posted` means completed. `pending` and `failed` requests do not contribute to the balance. A reversal adds new entries with the opposite amounts, keeping the original payment in the history.

## What to be able to explain for Portfolio 1

Focus on why each table exists, how the keys link them, and why the customer's email is stored in one place. Be able to explain the two entries in the transfer above and why some rules need to check several rows together.

The [activity README](README.md) has the commands for running the examples and the saved results to compare them with.
