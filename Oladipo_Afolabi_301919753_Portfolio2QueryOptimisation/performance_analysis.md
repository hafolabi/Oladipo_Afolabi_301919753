# Account-history query: before and after an index

The [history query](queries/query_02_history.sql) finds completed payments for Ada's account `1000000001` on 2 October 2026, using UTC boundaries. This comparison checks whether an index starting with `account_id` reduces the work needed to find its entries.

## Method

The recorded run was on **29 October 2026**, using PGlite 0.5.12 / PostgreSQL 18.6 and Node.js 26.0.0 on macOS x64. The temporary database held **20,207 payments and 40,410 entries**, including generated mock data from [performance_seed.sql](performance_seed.sql). Its funding and circular transfers left no negative customer closing balances. This performance fixture retains the original audit events rather than adding one for every generated payment.

The SQL, account, dates, data, and settings stayed the same. `ANALYZE` collected statistics before measurement. Existing primary-key and unique indexes remained in place. Each phase fetched the result, performed one additional untimed warm-up, then recorded five `EXPLAIN (ANALYZE, BUFFERS)` runs. PostgreSQL chose its own plans; scans were not forced. These are database execution times, excluding setup and index creation.

## Results

| Measure | Before the extra index | After the extra index |
| --- | ---: | ---: |
| History rows | 203 | 203, identical values and order |
| Median execution time | 44.248 ms | 1.971 ms |
| Entry lookup | Sequential scan of all 40,410 entries | Bitmap index/heap scan finding 203 entries |
| Extra index storage | None | 1256 kB |

The median is the middle of the five sorted times. The before median was about **22.45 times** the after median in this run. The slower first before time, **94.660 ms**, is retained in the evidence.

The added index is:

```sql
CREATE INDEX idx_entries_account_transaction
ON transaction_entries (account_id, transaction_id);
```

Putting `account_id` first matches the account lookup. The original entry primary key starts with `transaction_id`. All five [before plans](evidence/query_02_plan_before.txt) scan the entries table; all five [after plans](evidence/query_02_plan_after.txt) use the new index to locate matching entries. The query still sorts its results and looks up payment details. The improvement comes from avoiding a test of every entry row, while preserving all 203 answers.

## Tradeoff and limits

The index uses storage and needs maintenance when entries change. Write costs were not measured. This was one warm-cache query in one process, with the before phase followed by the after phase. Runtime warm-up, machine load, and a different dataset can affect results. The result does not establish the same speed improvement on a production server.

[measurements.json](evidence/measurements.json) records versions, settings, row counts, baseline indexes, and every timing. [measurements.csv](evidence/measurements.csv) is the smaller timing table. Full [before](evidence/query_02_large_result_before.json) and [after](evidence/query_02_large_result_after.json) outputs support the equality check. Rerunning replaces this evidence, so review these figures after a new run.

The method follows PostgreSQL's [EXPLAIN guide](https://www.postgresql.org/docs/18/using-explain.html), [multicolumn-index guide](https://www.postgresql.org/docs/18/indexes-multicolumn.html), and [ANALYZE reference](https://www.postgresql.org/docs/18/sql-analyze.html).
