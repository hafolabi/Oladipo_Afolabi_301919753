# Account-history query: before and after an index

The history query looks for completed entries on Ada's main account, `1000000001`, from the start of 2 October 2026 up to, but excluding, 3 October. Both boundaries use UTC. The aim was to see whether an index starting with `account_id` would reduce the work needed to find those entries.

## What was measured

The recorded run took place on **29 October 2026**, using PGlite 0.5.12 / PostgreSQL 18.6, Node.js 26.0.0, and macOS x64. The database was temporary and held in memory. No other clients were connected.

The original five-table design was loaded unchanged. [performance_seed.sql](performance_seed.sql) added 199 fictional customers and accounts, funded 200 accounts including Ada's, and made 20,000 transfers of NGN 50 around that group. Each account sent and received the same amount after 100 rounds. The helper account-position table was dropped when the inserts committed.

The final dataset had 203 customers, 204 accounts, **20,207 transactions and 40,410 entries**. The eight original audit events were retained; this performance fixture does not create an event for every generated payment. The financial checks found balanced payments and no negative closing customer balances.

The history query returned **203 rows**: Ada's original two payments, one added deposit, and 100 outgoing plus 100 incoming transfers. The runner checked that every returned value and its order were identical before and after the index. Both [saved result files](evidence/query_02_large_result_before.json) contain the full rows; the [after file](evidence/query_02_large_result_after.json) provides the comparison.

## How the comparison was kept consistent

The SQL, account number, dates, data, and database settings stayed the same. `ANALYZE;` collected statistics before measurement. The data and those statistics were then left unchanged between phases. The baseline already had the primary-key and unique indexes from Portfolio 1; it was not an index-free database.

Each phase first fetched the history rows for the equality check, then had one additional untimed query warm-up, followed by five `EXPLAIN (ANALYZE, BUFFERS)` runs. All measured runs were kept. Sequential, index, and bitmap scans remained enabled; the planner was free to choose. The measured numbers below are PostgreSQL's execution times, recorded separately from planning time. They exclude starting the database, loading the data, building the index, and returning query rows to a UI.

The full engine version, row counts, settings, initial index definitions, and individual timings are in [measurements.json](evidence/measurements.json). [measurements.csv](evidence/measurements.csv) is a smaller copy of the timings.

## Results

| Measure | Before the new index | After the new index |
| --- | ---: | ---: |
| Matching history rows | 203 | 203 |
| Minimum execution time | 42.115 ms | 1.949 ms |
| Median execution time | 44.248 ms | 1.971 ms |
| Maximum execution time | 94.660 ms | 1.983 ms |
| Entry access | Sequential scan of 40,410 entries | Bitmap index/heap scan returning 203 entries |
| Top-level execution shared-buffer hits | 870 | 816 |
| New index storage | Not present | 1256 kB |

The median is the middle of the five times after sorting them. The ratio of the medians was **22.45**: the before time was about 22.45 times the after time in this particular run. The first before measurement was much slower than the other four. All five times are kept in the evidence.

## What changed in the plans

In the [before plans](evidence/query_02_plan_before.txt), PostgreSQL read all **40,410 entry rows** with `Seq Scan on transaction_entries`. A hash join selected Ada's 203 entries. It then used the existing transaction primary-key index to find each payment.

The added index is:

```sql
CREATE INDEX idx_entries_account_transaction
ON transaction_entries (account_id, transaction_id);
```

In all five [after plans](evidence/query_02_plan_after.txt), PostgreSQL used `Bitmap Index Scan on idx_entries_account_transaction`, followed by `Bitmap Heap Scan` to fetch the matching entries. The entry lookup touched 201 heap pages and three index pages in these plans, compared with 258 entry-table pages in the sequential scan. Each access was reported as a buffer hit. These are page-access counts, not counts of disk reads or unique physical pages across the entire query. The matching entries were spread across many pages in this sample; the index still avoided testing every entry row.

The estimated final row count was 198 and the actual count was 203 in both phases. Both plans still sorted 203 rows and performed 203 payment primary-key lookups. The accounts table was scanned in both phases: it had only 204 rows. The main improvement was finding the account's entries without reading the whole entries table.

Putting `account_id` first matches the lookup being made. PostgreSQL's [multicolumn-index guide](https://www.postgresql.org/docs/18/indexes-multicolumn.html) explains why the leading columns matter. The primary-key index on `(transaction_id, account_id)` remains useful for payment lookups and still enforces uniqueness.

## Limits and tradeoffs

This is one query, one account/date range, and a synthetic dataset in embedded PostgreSQL. The data was already in memory, and the phases ran before-then-after in one process. A single query warm-up does not remove every possible WebAssembly runtime or host-load effect, which may contribute to timing variation. The changed scan strategy and lower buffer use support the explanation, but this does not establish a production performance improvement of the same size.

The new index also uses 1256 kB and would need updating when entries are inserted, changed, or deleted. Those write costs and index-build time were not benchmarked. Wider history requests or different data distributions may give different plans and benefits. Standalone PostgreSQL performance and simultaneous clients were not tested here.

The [EXPLAIN guide](https://www.postgresql.org/docs/18/using-explain.html) supports reading the plan output, and the [ANALYZE reference](https://www.postgresql.org/docs/18/sql-analyze.html) explains collecting planner statistics. The saved outputs above come from the run at **16:31:39 WAT on 29 October 2026** (15:31:39 UTC in the measurements), after the readability changes. The Portfolio 1 checks had finished before this comparison started. Rerunning the activity replaces the generated files, so the numbers in these notes need reviewing when a new run is saved.
