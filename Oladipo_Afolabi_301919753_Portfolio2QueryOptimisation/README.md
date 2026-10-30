# Portfolio 2: Query Processing and Optimisation

**Marks:** 7

**Progress:** Four queries and one before/after index comparison completed on 29 October 2026 using PostgreSQL through PGlite.

This activity uses Portfolio 1's tables and mock data. It answers four questions, checks the results, and improves the account-history lookup with one extra index. Start with [the reading guide](start_here.md).

## Required work and evidence

| Requirement | Evidence |
| --- | --- |
| SQL queries | The four linked query files below |
| Query results | The four linked result files below |
| Execution plans | [Before plans](evidence/query_02_plan_before.txt) and [after plans](evidence/query_02_plan_after.txt) |
| Indexing/optimisation | [add_history_index.sql](add_history_index.sql), with [recorded conditions and measurements](evidence/measurements.json) |
| Brief performance analysis | [performance_analysis.md](performance_analysis.md) |

| Query | Question | Original sample result |
| --- | --- | --- |
| [1: Balances](queries/query_01_balances.sql) | Which accounts belong to Ada, and how much is in each? | [Main account NGN 8,000; spare account zero](evidence/query_01_result.json) |
| [2: History](queries/query_02_history.sql) | Which completed payments affected Ada's main account on 2 October, in UTC? | [NGN 10,000 deposit and NGN 2,000 outgoing transfer](evidence/query_02_result.json) |
| [3: Daily transfers](queries/query_03_daily_transfers.sql) | How many transfers completed each day, and what was their value? | [One transfer worth NGN 2,000](evidence/query_03_result.json) |
| [4: Payment problems](queries/query_04_payment_problems.sql) | Are entries missing, unbalanced, or using the wrong account types? | [No problem rows in the healthy sample](evidence/query_04_result.json) |

Query 1 includes unused accounts with `LEFT JOIN`. Query 2 includes the start date and excludes the end date. Query 3 counts only the positive entry, so a transfer is counted once; it reports transfers made rather than a net total after reversals. Query 4 detects stored problems; it does not prevent bad writes.

## Run the activity

With Node.js 20 or later and npm, run these commands from the repository root:

```sh
cd Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/tools
npm ci
npm run verify
```

The lockfile pins PGlite 0.5.12. Installation needs npm access or a cached copy. The runner loads Portfolio 1's unchanged schema and sample data into a fresh temporary database, runs the checks and comparison, saves the evidence, and closes the database.

A successful run finishes with:

```text
ALL PORTFOLIO 2 CHECKS PASSED. Closing the temporary database.
```

The recorded environment was PGlite 0.5.12 / PostgreSQL 18.6, Node.js 26.0.0, and macOS x64. Full conditions are in [measurements.json](evidence/measurements.json).

## Checks and comparison

[check_queries.mjs](tools/check_queries.mjs) checks the four answers against the original sample. It also checks both history date boundaries and confirms query 4 finds a missing entry, unequal amounts, and a deposit flowing in the wrong direction. Each deliberate change is rolled back. The [detected problems](evidence/query_04_detected_problems.json) and [validation log](evidence/query_validation.txt) show the results.

[performance_seed.sql](performance_seed.sql) adds fictional records so the index has enough entries to search. The larger dataset contains **20,207 payments and 40,410 entries**. Ada's larger balance is NGN 18,000 after an extra funding deposit; generated transfers into and out of her account cancel out. The small query-result files still show the original NGN 8,000 balance.

The runner checks the larger sample, measures the same history query five times before and five times after adding the index, and confirms all **203 history rows** have identical values and order. The data and query stay the same between phases. [measurements.csv](evidence/measurements.csv) contains the timings; the full [before](evidence/query_02_large_result_before.json) and [after](evidence/query_02_large_result_after.json) results support the equality check.

| Helper | Purpose |
| --- | --- |
| [run_queries.mjs](tools/run_queries.mjs) | Load the data, run the checks and comparison, and save results |
| [check_queries.mjs](tools/check_queries.mjs) | Check query answers and selected edge cases |
| [measure_history.mjs](tools/measure_history.mjs) | Save repeated execution plans and calculate timing summaries |

## Scope

This is one index comparison in an embedded database with made-up data. It does not establish production-server or simultaneous-request performance. The [brief analysis](performance_analysis.md) explains the recorded improvement and index tradeoff. Rerunning replaces the generated evidence; review the written timings after a new run.

[Portfolio 3](../Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/README.md) covers commit, rollback, isolation, and competing withdrawals. The interactive menu remains planned for after Portfolio 5.
