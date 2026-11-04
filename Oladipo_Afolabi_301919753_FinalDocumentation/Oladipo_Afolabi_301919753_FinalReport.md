# Advanced Database Systems

## Portfolio summary: AfolabiPay

**Student:** Oladipo Afolabi | **Student ID:** 301919753 | **Prepared:** 31 October 2026

**GitHub:** [github.com/hafolabi/Oladipo_Afolabi_301919753](https://github.com/hafolabi/Oladipo_Afolabi_301919753)

*Editable draft: complete the highlighted personal notes and confirm lecturer access to the repository before submission.*

### Case study and scope

AfolabiPay is a fictional fintech platform for deposits, withdrawals, transfers, balances, and payment history. The same case study connects all five activities. PostgreSQL holds the financial records, MongoDB demonstrates a document model, and the final activity discusses a possible cloud arrangement. All people and payments are fictional. Amounts are stored as whole kobo: 100 kobo equals NGN 1. Balances come from completed entries rather than an editable balance field.

### Portfolio 1: Database design and modelling

The design has five tables: `customers`, `accounts`, `transactions`, `transaction_entries`, and `audit_events`. One customer can own several accounts. Accounts and payments each link to many entries; a payment can also have several audit events. The [full ER diagram](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/er_diagram.svg) shows the keys and relationships.

Customers have an `active`, `deleted`, or `suspended` status, separate from verification and account status. A trigger refreshes `updated_at` whenever a customer row changes; `deleted` preserves the row and its financial history.

Entries use the combined primary key `(transaction_id, account_id)`. Other tables have individual ID keys. Foreign keys link records; unique constraints protect emails, account numbers, and payment references. Required fields, check constraints, and restricted deletion protect the stored rows [1].

The normalisation explanation covers 1NF through single values, 2NF through amounts depending on the whole entry key, and 3NF through keeping customer details out of account rows. Payment balance rules still need checks across rows and transaction logic.

**Evidence 1 — saved schema checks:** five tables created; 4 customers, 5 accounts, 7 payments, 10 entries, and 8 audit events loaded. Nine invalid writes were rejected, and customer-status and timestamp checks passed on 4 November 2026. Ada's closing balance was NGN 8,000 and Bello's was NGN 7,000. [Open the saved output](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/evidence/schema_validation.txt).

### Portfolio 2: Query processing and optimisation

Four queries cover balances, account history, daily transfer totals, and payment problems. History uses an inclusive start and exclusive end in UTC. On 40,410 entries, an index on `(account_id, transaction_id)` changed the history lookup from a full entry scan to a bitmap index/heap scan [2].

| Recorded measure | Before index | After index |
| --- | --- | --- |
| History rows | 203 | 203, identical values and order |
| Median execution time, five runs | 44.248 ms | 1.971 ms |
| Extra index storage | None | 1256 kB |

**Evidence 2 — index comparison:** the median ratio was 22.45 in the 29 October run. SQL, data, and settings stayed the same. The index costs storage and future write maintenance. These PGlite 0.5.12 / PostgreSQL 18.6 timings are an embedded-engine comparison, not a production benchmark. [Plans, method, and full results](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/performance_analysis.md) are saved together.

<!-- PAGE BREAK -->

### Portfolio 3: Transactions and concurrency

A native PostgreSQL 18.4 server provides separate connections A, B, and an observer. Each demonstration has fresh starting funds. Each payment locks accounts, checks funds, records the payment and two balanced entries, and adds an audit event. `COMMIT` saves the whole payment; an error leads to `ROLLBACK` on the same connection [3].

| Example | Saved result (amounts in NGN) |
| --- | --- |
| Commit | Transfer of 2,000: Ada 10,000 → 8,000; Bello 0 → 2,000. |
| Rollback | Division by zero caused rollback: no new payment, entries, or audit event; balances unchanged. |
| Read Committed | B saw no unfinished payment. Its next read in the same transaction saw A's committed change. |
| Concurrency control | Two requests for 800 from 1,000: B waited, then saw 200 and was refused. |

**Evidence 3 — transaction output:** [the saved log](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/evidence/transaction_validation.txt) and linked JSON record all four passing checks. The observer confirmed a real lock wait. Only one competing withdrawal was saved. The isolation example shows no dirty read and an allowed nonrepeatable read. Funds are checked in a new statement after locking; all cooperating payment writers must follow that order.

### Portfolio 4: NoSQL and advanced data models

MongoDB uses two collections: `customer_profiles` and `transaction_events`. Names and contact details are embedded in profiles. Each payment embeds its two entries, while customer IDs reference the profiles. A shortened transfer excerpt shows the entries:

```text
TRF-001, posted: 1000000001 = -200000 kobo
                1000000002 = +200000 kobo
```

The implementation uses BSON Long integers for exact whole kobo. It reuses Ada, Bello, and the first three SQL payments. Three queries find a profile by email, an account's history, and completed transfers. Embedding suits details read together; keeping history in separate event documents avoids a growing array inside one customer profile [4].

**Evidence 4 — MongoDB output:** [the saved checks](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_Portfolio4NoSQL/evidence/validation.txt) passed on MongoDB 8.0.16: two profiles, three events, Ada's `DEP-001` and `TRF-001` history, and the NGN 2,000 transfer. Each sample event had two balanced BSON Long entries. Document references do not supply SQL foreign-key guarantees, and one atomic event does not prevent overdrafts across events. PostgreSQL remains the financial record; there is no automatic synchronisation.

### Trying the implementation

From the repository root, run `npm run setup` once, then `npm start`. The menu accepts existing mock accounts, amounts, and history dates. Restarting resets the data. The [root README](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/README.md#run-the-terminal-menu) explains usage and `npm run check:p1` through `npm run check:p4` for repeatable checks. Rerunning the optimisation check replaces its timings.

<!-- PAGE BREAK -->

### Portfolio 5: Distributed and cloud databases

The brief permits discussion or setup. This activity provides a sourced proposal, with no cloud deployment or measured failover. It considers a PostgreSQL primary and standby in separate availability zones, plus a three-member MongoDB replica set across three zones.

For financial payments, synchronous PostgreSQL replication could wait for the standby to save the commit record, reducing the risk of losing an acknowledged change but adding delay and possible waits. Failover also needs coordination to promote a standby and stop the old primary accepting writes [5]. MongoDB majority acknowledgement and elections improve resilience, but secondary reads can lag and writes can pause when a majority is unavailable [6].

Payment decisions must use the PostgreSQL primary and the Portfolio 3 lock-then-check sequence. A delayed replica could approve a withdrawal using an old balance. The small dataset stays unsharded: splitting the ledger would complicate transfers, and a proposed event shard key would need workload testing. The [full discussion and architecture diagram](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/distributed_discussion.md) explain these tradeoffs.

### Individual reflection — draft for personal review

The payment examples show the difference between finding a negative balance afterwards and refusing an unaffordable payment before it is saved. Locking before checking funds protects that decision when requests overlap. The index comparison also shows why an optimisation must preserve the answers and be assessed against its measurement conditions and storage cost.

**Personal challenge and check:** [Describe a challenge encountered, the steps taken, what changed, and a check repeated with its result.]

### AI use and verification

OpenAI Codex assisted with explanations, design suggestions, SQL and JavaScript drafts, and documentation. The student selected the case study and directed the project scope. The [AI-use declaration](ai_use_declaration.md) records the assistance and review status.

### Selected references

[1] PostgreSQL 18: [Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html).

[2] PostgreSQL 18: [Using EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html); [Multicolumn indexes](https://www.postgresql.org/docs/18/indexes-multicolumn.html).

[3] PostgreSQL 18: [Transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html), [Isolation](https://www.postgresql.org/docs/18/transaction-iso.html), and [Locking](https://www.postgresql.org/docs/18/explicit-locking.html).

[4] MongoDB: [Embedding](https://www.mongodb.com/docs/manual/data-modeling/embedding/) and [BSON types](https://www.mongodb.com/docs/v8.0/reference/bson-types/).

[5] PostgreSQL 18: [Replication](https://www.postgresql.org/docs/18/warm-standby.html) and [Failover](https://www.postgresql.org/docs/18/warm-standby-failover.html).

[6] MongoDB 8.0: [Replication](https://www.mongodb.com/docs/v8.0/replication/), [Write concern](https://www.mongodb.com/docs/v8.0/reference/write-concern/), and [Shard keys](https://www.mongodb.com/docs/v8.0/core/sharding-choose-a-shard-key/).

These sources were consulted during the project on 27–30 October 2026. [The full reference list](https://github.com/hafolabi/Oladipo_Afolabi_301919753/blob/main/Oladipo_Afolabi_301919753_FinalDocumentation/references.md) records the other pages, libraries, versions, fictional datasets, and tools.
