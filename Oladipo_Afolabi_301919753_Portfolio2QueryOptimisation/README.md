# Portfolio 2: Query Processing and Optimisation

**Marks:** 7  
**Database:** PostgreSQL  
**Progress:** Queries planned; runs and timings still to complete.

Here I’ll write queries for everyday questions about accounts and payments, then look at how efficiently PostgreSQL answers them. Section 4 asks for SQL queries, results, execution plans, optimisation evidence, and a brief performance analysis. The plan is a small set of queries and one focused optimisation comparison.

## Queries to write

- List a customer's accounts and balances, including accounts that have no entries yet.
- Show an account's payment history for a chosen date range by joining accounts, entries, and transactions.
- Count completed transfers and add up their value for each day. Each transfer should count once, even though it has two account entries.
- Find payments with missing entries, incorrect account combinations, or amounts that do not balance.

These four queries are a project choice. The brief does not specify a minimum number.

## Comparing performance

I’ll use the account-history query for one before-and-after comparison. A small seed script will provide enough rows to make the execution plan worth discussing. I’ll record the row counts, query parameters, PostgreSQL version, and timing conditions. A large dataset or load-testing framework is not required.

First, I’ll save the query output and its `EXPLAIN (ANALYZE, BUFFERS)` plan. Then I’ll add an index suited to the filters and joins, refresh statistics where needed, and rerun the same query. The data and parameters will stay the same. Repeated runs should help distinguish a consistent timing change from normal variation.

The short analysis will focus on how rows were found, whether the index was used, and what changed in execution time. Row estimates, actual rows, and buffer figures can help explain the result. Any improvement needs to be supported by the measurements.

## Files and results to keep

- [ ] SQL queries and the outputs they produce.
- [ ] A sample-data script and the resulting row counts.
- [ ] The execution plan and timings before the change.
- [ ] The index or rewritten query, with a reason for the change.
- [ ] The plan and timings afterwards, plus a check that the query returns the same results.
- [ ] A short explanation of what changed and what the measurements show.
- [ ] Setup, software versions, and commands for repeating the comparison.
- [ ] Notes on how the results were checked, including any fixes or limits.

I’ll refer to PostgreSQL’s guide to [`EXPLAIN`](https://www.postgresql.org/docs/current/using-explain.html) when interpreting the plans, alongside the commands and results saved from the experiment.

## Optional extensions

Failed-payment summaries and reversal lookups can be added if useful. Tuning every query, building a benchmark suite, and running large-scale load tests are outside the core plan.
