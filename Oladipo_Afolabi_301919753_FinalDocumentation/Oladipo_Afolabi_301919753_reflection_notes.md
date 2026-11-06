# Technical reflection notes

These notes collect design decisions, results, and lessons from the five activities. The activity notes summarise the saved evidence.

## Evidence available from Portfolio 1 — 4 November 2026

- The five tables keep customer details, accounts, payments, money entries, and action notes separate. The balance is calculated by adding completed entries.
- [The saved checks](../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/evidence/Oladipo_Afolabi_301919753_schema_validation.txt) show valid inserts, six examples covering the main constraint types, customer-status and update-timestamp checks, and correct sample row counts, balances, and entry pairs.
- Customers default to `active`; `deleted` and `suspended` are also valid. A trigger refreshes `updated_at` on profile and status updates while ordinary updates preserve `created_at`. A deleted status keeps the customer row and linked history.
- A completed payment needs an explicit `IS NOT NULL` check for its posting time. Comparing a missing time alone does not reject it in a SQL check constraint.
- PGlite allowed SQL verification before installing a database service, but its single connection cannot supply the separate-session evidence needed for Portfolio 3.

## Evidence available from Portfolio 2 — 29 October 2026

- The four queries cover account balances, history, daily transfer totals, and payment problems. The first includes an account with no entries; the transfer summary counts only the positive entry so one transfer is counted once.
- The history test inserts payments at both midnight boundaries. The start is included, and the next day is excluded. Those test payments are then rolled back.
- The performance dataset has 40,410 entries. An index starting with `account_id` changes the entry lookup from a full sequential scan to a bitmap index/heap scan. The same 203 history rows are returned in both phases.
- In the latest saved embedded-engine run, the median execution time changed from 44.248 ms to 1.971 ms across five runs per phase. The slower first before run, 94.660 ms, is retained in the evidence. The results are not a production-server benchmark.
- The index used 1256 kB. That storage and the extra maintenance needed for future writes are tradeoffs; the activity did not measure write performance.
- The [performance notes](../Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/Oladipo_Afolabi_301919753_performance_analysis.md) link to the complete plans and measurements.

## Evidence available from Portfolio 3 — 30 October 2026

- A native PostgreSQL 18.4 process supplied separate A, B, and observer connections. The run uses the same five-table schema with a fresh account fixture and reset starting funds for each experiment.
- The commit example saved one transfer, two entries, and one audit event. A division-by-zero error before commit caused rollback to remove all those new rows and restore every starting balance.
- Under Read Committed, B could not see A's uncommitted transfer. B's later read in the same transaction saw the transfer after A committed. This shows no dirty read and an allowed nonrepeatable read.
- The observer confirmed a real lock wait using `pg_blocking_pids`. After the first NGN 800 withdrawal committed from an NGN 1,000 balance, the second request obtained its locks, read NGN 200, and was rejected. Only the first withdrawal remained.
- The balance check runs as a new statement after acquiring account locks. Checking before the wait, or relying on a statement snapshot from before the wait, could use an outdated balance. Read Committed alone is not the overdraft control.
- The four demonstrations include balance and saved-row checks and use only Ada, Bello, and clearing in their fixture.

## Evidence available from Portfolio 4 — 30 October 2026

- The two collections reuse Ada, Bello, and the first three SQL payments. Name/contact objects and a payment's two entries are embedded; customer IDs reference separate profiles. Account history stays in separate event documents.
- The [saved MongoDB checks](../Oladipo_Afolabi_301919753_Portfolio4NoSQL/evidence/Oladipo_Afolabi_301919753_validation.txt) confirm the profile lookup, Ada's two history events, the NGN 2,000 transfer, and balanced BSON Long entries. The run used a real temporary MongoDB 8.0.16 process; no SQL-to-MongoDB synchronisation is implemented.

## Material available from Portfolio 5 — 30 October 2026

- The [proposed arrangement](../Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/Oladipo_Afolabi_301919753_distributed_discussion.md) keeps PostgreSQL as the financial record and considers a standby plus a three-member MongoDB replica set. Replication protects copies; the local transaction checks remain necessary for payment decisions.
- The discussion connects stale balances to the competing withdrawals, explains pauses during failover or lost acknowledgements, and assesses why the small dataset should stay unsharded. It is a sourced proposal, not an observed cloud or failover experiment.
