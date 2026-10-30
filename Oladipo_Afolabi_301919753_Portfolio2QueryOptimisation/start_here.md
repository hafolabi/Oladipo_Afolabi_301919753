# Start here: reading and improving queries

Portfolio 1 set up the tables. In Portfolio 2, we use those tables to answer a few questions, then see whether an index helps one query run faster.

Read [query_01_balances.sql](queries/query_01_balances.sql) first. It asks: **which accounts belong to Ada, and how much is in each one?** You can picture its result as an array returned by an API:

```js
[
  { account_number: '1000000001', balance_ngn: '8000.00' },
  { account_number: '1000000003', balance_ngn: '0.00' },
]
```

These two fields are an excerpt; the actual query also returns the status and balance in kobo.

## Follow the first query

1. `FROM customers AS customer` starts with customer rows. `AS customer` gives the table a shorter name within this query.
2. `JOIN accounts` connects each account to its owner through `customer_id`.
3. `LEFT JOIN transaction_entries` adds money entries while keeping accounts with no entries yet.
4. `LEFT JOIN transactions` lets us check whether a payment completed.
5. `WHERE customer.email = 'ada@example.test'` selects Ada.
6. `GROUP BY account.account_id` groups each account's entries together.
7. `SUM(CASE WHEN ... THEN ... ELSE 0 END)` adds amounts from completed payments. Other statuses contribute zero.
8. `COALESCE(..., 0)` gives an unused account a zero balance. Dividing kobo by 100 gives naira.
9. `ORDER BY` makes the account order predictable.

PostgreSQL does this work and sends the result back to our JavaScript script.

## The other three questions

| Query | Question |
| --- | --- |
| [query_02_history.sql](queries/query_02_history.sql) | What completed payments affected Ada's main account on 2 October? |
| [query_03_daily_transfers.sql](queries/query_03_daily_transfers.sql) | How many transfers completed each day, and what was their total value? |
| [query_04_payment_problems.sql](queries/query_04_payment_problems.sql) | Are any entry pairs missing, unbalanced, or using the wrong account types? |

Each transfer has two entries, but query 3 counts only the positive one. That counts one transfer once. A later reversal does not remove the original from this gross transfer total.

Query 4 returns an empty array for the healthy sample. The automatic checks also give it three bad examples to confirm it can find real problems.

## What optimisation means here

The history query needs entries for one account. With many entries in the table, PostgreSQL can read the whole table to find them, or use an index to locate matching rows.

An index is similar to a book's index: it helps locate what you want without reading every page. Our example adds this one:

```sql
CREATE INDEX idx_entries_account_transaction
ON transaction_entries (account_id, transaction_id);
```

The order matters. `account_id` comes first because our query looks up an account. Portfolio 1's entry primary key starts with `transaction_id`, which suits looking up entries for a payment.

PostgreSQL still chooses the plan. We leave its normal scan options enabled and check the saved plan to see what it actually used. An index takes storage and needs maintaining when entries change, so adding one has a cost too.

## What EXPLAIN shows

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

`SELECT ...` is a placeholder here; the runner uses the full history query. `EXPLAIN` describes the steps PostgreSQL chose. `ANALYZE` runs that query and measures the steps. `BUFFERS` reports its use of database memory pages.

In the plans, `Seq Scan` means reading through a table. `Bitmap Index Scan` finds matching row locations through an index, and `Bitmap Heap Scan` fetches the table rows at those locations. `Execution Time` is measured in milliseconds. The `cost` numbers are planner estimates, not milliseconds.

The separate command `ANALYZE;` collects table statistics to help PostgreSQL choose a plan. It has a different job from the `ANALYZE` option inside `EXPLAIN`.

## Files to read later

The four query files are the place to start. [performance_seed.sql](performance_seed.sql) adds more made-up customers and payments so the comparison has enough rows to measure. It gives Ada position 0 and numbers the extra accounts from 1 to 199. `generate_series` supplies those numbers, and separate inserts add the outgoing and incoming entries.

The helper files use JavaScript with `import` and `export`, which is why their filenames end in `.mjs`. They run in Node.js. Each query has a name such as `queries.balances` or `queries.history`.

```js
const result = await database.query(queries.history);
const payments = result.rows;
```

Here, `queries.history` holds the SQL read from the history file. `await` waits for PostgreSQL, and `result.rows` gives us an array of payment objects.

| Helper | What it does |
| --- | --- |
| [run_queries.mjs](tools/run_queries.mjs) | Loads the data, runs the queries, adds the index, and saves the results |
| [check_queries.mjs](tools/check_queries.mjs) | Compares the answers with expected values and checks the date boundaries and bad examples |
| [measure_history.mjs](tools/measure_history.mjs) | Runs the history query five times per phase and works out the minimum, median, and maximum times |

The checks use Node's built-in `assert`. It stops the run with an error if an answer is wrong. Read the main runner from top to bottom; its comments follow the order in which the work happens.

The [README](README.md) contains the run commands. The [performance notes](performance_analysis.md) explain the measured results and their limits.
