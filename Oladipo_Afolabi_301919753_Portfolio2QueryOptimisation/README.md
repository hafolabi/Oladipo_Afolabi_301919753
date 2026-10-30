# Portfolio 2: Query Processing and Optimisation

**Marks:** 7

**Database:** PostgreSQL through PGlite

**Progress:** Four queries, their checks, and one measured index comparison completed on 29 October 2026. Results are from embedded PostgreSQL; a standalone server has not been used.

This activity uses the AfolabiPay design from Portfolio 1. It answers four questions about the data, then compares the account-history query before and after adding an index. The SQL files have short comments explaining what each part does.

Start with [the reading guide](start_here.md), then open [query_01_balances.sql](queries/query_01_balances.sql). The guide follows that first query using familiar JavaScript ideas.

## The four queries

| Query | Question | Result on the original small dataset |
| --- | --- | --- |
| [1: Balances](queries/query_01_balances.sql) | Which accounts belong to Ada, and what are their balances? | Main account NGN 8,000; unused spare account NGN 0 |
| [2: History](queries/query_02_history.sql) | What completed payments affected Ada's main account on 2 October, in UTC? | Deposit NGN 10,000 and outgoing transfer NGN 2,000 |
| [3: Daily transfers](queries/query_03_daily_transfers.sql) | How many transfers completed each day, and what was their total value? | One transfer worth NGN 2,000 |
| [4: Payment problems](queries/query_04_payment_problems.sql) | Are entries missing, unbalanced, or using the wrong account types? | No rows, because the sample passes those checks |

Query 1 keeps accounts without entries by using `LEFT JOIN`. Query 2 includes the start of the requested day and excludes the start of the next day. Query 3 counts only positive transfer entries so it counts each transfer once. It reports the original completed transfer amounts, not a net total after reversals. Query 4 finds problems in stored data; preventing an invalid payment before it is saved belongs to the payment examples in Portfolio 3.

The four query results are saved as [query_01_result.json](evidence/query_01_result.json), [query_02_result.json](evidence/query_02_result.json), [query_03_result.json](evidence/query_03_result.json), and [query_04_result.json](evidence/query_04_result.json). JSON is used so the results are easy to read as frontend-style arrays of objects.

## Run the activity

You need Node.js 20 or later and npm. From the repository root:

```sh
cd Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/tools
npm ci
npm run verify
```

The version is pinned in `package-lock.json`. The first installation needs the npm package or a cached copy. The recorded run reused the cached PGlite package already used by Portfolio 1.

The script starts with an empty database in memory and loads Portfolio 1's tables and sample inserts. It checks the four queries, adds the extra sample payments, then measures the history query before and after adding the index. The results go into this activity's `evidence` folder before the temporary database closes.

The main steps are in [run_queries.mjs](tools/run_queries.mjs). The expected-answer checks are in [check_queries.mjs](tools/check_queries.mjs), and the repeated timing work is in [measure_history.mjs](tools/measure_history.mjs). The SQL files remain separate so you can read each query on its own.

The run should finish with:

```text
ALL PORTFOLIO 2 CHECKS PASSED. Closing the temporary database.
```

The recorded environment was PGlite **0.5.12 / PostgreSQL 18.6**, Node.js **26.0.0**, on **macOS x64**. The full version and settings are in [measurements.json](evidence/measurements.json).

## What was checked

[tools/check_queries.mjs](tools/check_queries.mjs) checks the answers that can be worked out by hand. It also adds two temporary payments exactly at the date boundaries: the history must include midnight on 2 October and exclude midnight on 3 October. Both payments are then rolled back.

The helper also temporarily creates a missing entry, an unbalanced amount, and a deposit flowing in the wrong direction. Query 4 finds each problem. Those changes are rolled back, and its answer returns to an empty array. [query_04_detected_problems.json](evidence/query_04_detected_problems.json) saves what it found.

The larger sample is checked for row counts, balanced payments, expected transfer totals, expected Ada balances, and nonnegative closing customer balances. After the index is added, the script confirms that the dataset counts and all 203 returned history rows are unchanged.

The [validation log](evidence/query_validation.txt) records the passing checks. Node's built-in `assert` stops the script if an expected answer is wrong. Execution times can change between runs; the checks do not assume that every rerun must achieve a particular speed.

## The optimisation example

The original small dataset has only ten entries. [performance_seed.sql](performance_seed.sql) adds enough fictional records to make searching by account worth measuring. It creates 199 additional customers and accounts, deposits into 200 accounts including Ada's, and makes 20,000 NGN 50 transfers around those accounts. The temporary account-position helper is dropped when the insert transaction commits.

The final financial dataset has **20,207 transactions and 40,410 entries**. Ada's larger balance is NGN 18,000 because the extra sample adds a NGN 10,000 deposit; its generated incoming and outgoing transfers cancel out. The small-result files above still show the original NGN 8,000. The before-and-after comparison uses the larger dataset for both phases.

[add_history_index.sql](add_history_index.sql) adds an index on `(account_id, transaction_id)`. The history query finds entries for one account, so `account_id` is the leading column. The original entry primary key starts with `transaction_id`.

| Measured result | Before | After |
| --- | ---: | ---: |
| History rows returned | 203 | 203, with identical values and order |
| Median of five execution times | 44.248 ms | 1.971 ms |
| Entry access | Sequential scan of 40,410 entries | Bitmap index/heap scan returning 203 entries |

The new index was used in all five after plans and occupied **1256 kB**. Read [performance_analysis.md](performance_analysis.md) for the full comparison, including the slower first before measurement, buffer figures, and tradeoffs.

The evidence includes [all five before plans](evidence/query_02_plan_before.txt), [all five after plans](evidence/query_02_plan_after.txt), the [individual timings](evidence/measurements.csv), and the [complete conditions and measurements](evidence/measurements.json). The large [before result](evidence/query_02_large_result_before.json) and [after result](evidence/query_02_large_result_after.json) allow the equality check to be inspected.

## Using a PostgreSQL server later

The commands below have not been run here. They require a running PostgreSQL 18 server, the `createdb` and `psql` tools, and a role allowed to create a database. From this activity's folder:

```sh
createdb afolabipay_queries
psql -X -v ON_ERROR_STOP=1 -d afolabipay_queries -f ../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/schema.sql
psql -X -v ON_ERROR_STOP=1 -d afolabipay_queries -f ../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/seed.sql
psql -X -v ON_ERROR_STOP=1 -d afolabipay_queries -f queries/query_01_balances.sql
psql -X -v ON_ERROR_STOP=1 -d afolabipay_queries -f queries/query_02_history.sql
psql -X -v ON_ERROR_STOP=1 -d afolabipay_queries -f queries/query_03_daily_transfers.sql
psql -X -v ON_ERROR_STOP=1 -d afolabipay_queries -f queries/query_04_payment_problems.sql
```

Use a fresh database with no earlier inserts because Portfolio 1's simple seed uses IDs assigned in order. Load that schema and seed once. For a manual performance comparison, load `performance_seed.sql` once, collect statistics with `ANALYZE;`, then put `EXPLAIN (ANALYZE, BUFFERS)` before the full history query. Save repeated runs before adding the index, apply `add_history_index.sql`, and repeat with the same query and data. The JavaScript runner performs and saves this process automatically in the embedded engine.

## Limits and activity boundary

These are real measurements from PostgreSQL compiled to WebAssembly through PGlite. They cover one warm-cache query in one process with a synthetic dataset. They do not establish standalone-server, disk, network, UI, or simultaneous-request performance. The phases run before-then-after, so host load and runtime warm-up can influence the timings. An index also adds storage and write-maintenance work, which this comparison does not measure.

Portfolio 2's required queries, outputs, plans, index example, and brief analysis are present. Payment enforcement, commit/rollback demonstrations, isolation, and competing withdrawals remain for Portfolio 3.

The method follows PostgreSQL's [EXPLAIN guide](https://www.postgresql.org/docs/18/using-explain.html), [multicolumn-index guide](https://www.postgresql.org/docs/18/indexes-multicolumn.html), and [ANALYZE reference](https://www.postgresql.org/docs/18/sql-analyze.html). Rerunning the helper replaces the generated evidence with the new run; the recorded timings in the notes need reviewing if those files are regenerated.
