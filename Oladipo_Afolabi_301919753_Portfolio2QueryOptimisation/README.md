# Portfolio 2: Query Processing and Optimisation

**Marks:** 7  
**Database:** PostgreSQL  
**Progress:** The queries are planned. They have not been run or timed yet.

This activity looks at the questions staff might ask about AfolabiPay's data, then checks how efficiently the database can answer them. An account history is a useful starting point: it should return the right payments without having to read every payment in the system.

## Queries to write

- List a customer's accounts and balances, including accounts that have no entries yet.
- Show an account's payment history for a chosen date range by joining accounts, entries, and transactions.
- Count completed transfers and add up their value for each day. Each transfer should count once, even though it has two account entries.
- Group failed payments by type and failure reason.
- Match original payments with their completed reversals.
- Find payments with missing entries, incorrect account combinations, or amounts that do not balance.

These queries are the current plan. The pages supplied do not set a minimum number of queries.

## Comparing performance

The main comparison will use an account-history query that returns a small part of the full dataset. The sample data needs to be large enough for a change in how PostgreSQL finds the rows to be noticeable. The notes will include the total row counts, date range, number of matching rows, PostgreSQL version, and machine details. A seed script will make it possible to recreate the same data.

First, run the query and save its result together with an `EXPLAIN (ANALYZE, BUFFERS)` plan. Then add an index that fits the query's filters and joins, refresh statistics where needed, and run the same query again. Keeping the data and parameters the same makes the comparison useful. Repeating the runs will help show whether a timing difference is consistent or just normal variation.

The analysis will compare estimated and actual row counts, scans, joins, sorting, buffers, planning time, and execution time. It will also explain whether PostgreSQL used the new index. If the index makes little difference, or slows the query down, that result belongs in the discussion too.

## Files and results to keep

- [ ] SQL queries and the outputs they produce.
- [ ] A sample-data script and the resulting row counts.
- [ ] The execution plan and timings before the change.
- [ ] The index or rewritten query, with a reason for the change.
- [ ] The plan and timings afterwards, plus a check that the query returns the same results.
- [ ] A short explanation of what changed and what the measurements show.
- [ ] README instructions giving the setup, software versions, and commands for repeating the comparison.
- [ ] Notes explaining how the results were checked and any corrections or limits found.

PostgreSQL's guide to [`EXPLAIN`](https://www.postgresql.org/docs/current/using-explain.html) will support the plan analysis. The practical notes will record the commands and database version used for the comparison.
