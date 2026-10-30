# Notes for my technical reflection

I’ll use these notes to record decisions and lessons while working on the project, then choose a few examples for the final report. The prompts are still to fill in; the reflection has not been written yet.

## A design decision

- **What I chose:** [Describe a decision made or accepted after reviewing the design.]
- **Other options:** [What else could have worked?]
- **Why it fits:** [Explain the reason for the choice and its tradeoff for AfolabiPay.]
- **What supports it:** [Link to the relevant design, script, query result, or experiment.]

Possible examples include calculating balances from entries, recording a reversal as a new transaction, or deciding what to embed in MongoDB. The chosen example should be something I can explain after reviewing the implementation.

## A problem I worked through

- **What happened:** [Describe a problem encountered during the work.]
- **What I expected:** [Describe how it should have behaved.]
- **What I tried:** [Record the investigation and any changes.]
- **What changed:** [Explain the result and link to the output.]
- **What I learned:** [Describe what would help next time.]

This can stay blank until there is an experience to write about.

## Points to revisit after each activity

| Activity | Points to explain from the completed work |
| --- | --- |
| Portfolio 1 | Why do the tables have these keys and relationships? Which rules can a row constraint enforce, and which need checks across rows? |
| Portfolio 2 | What changed in the execution plan? Do the measurements show a useful improvement, and what limits the comparison? |
| Portfolio 3 | What did the two sessions see? How did locking or isolation affect the withdrawal results? |
| Portfolio 4 | Why were some details embedded and others referenced? Which queries benefit, and what consistency rules still need additional handling? |
| Portfolio 5 | What happens when a server fails? Which parts of the architecture were discussed, simulated, or actually deployed? |

## Evidence available from Portfolio 1 — 30 October 2026

These are factual notes from the Codex-assisted implementation, not a completed personal reflection:

- The five tables keep customer details, accounts, payments, money entries, and action notes separate. The balance is calculated by adding completed entries.
- [The saved checks](../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/evidence/schema_validation.txt) show valid inserts, six examples of rejected writes covering the main constraint types, and correct sample row counts, balances, and entry pairs.
- A completed payment needs an explicit `IS NOT NULL` check for its posting time. Comparing a missing time alone will not reject it in a SQL check constraint.
- PGlite allowed SQL verification before installing a database service, but its single connection cannot supply the separate-session evidence needed for Portfolio 3.
- Questions for my own review: Why is `(transaction_id, account_id)` the entry key? Why can clearing have no owner? Why can two individually valid entries still describe an invalid payment? Which rules will need locks?

## Evidence available from Portfolio 2 — 29 October 2026

These are notes from the Codex-assisted implementation to review before writing my own reflection:

- The four queries cover account balances, history, daily transfer totals, and payment problems. The first includes an account with no entries; the transfer summary counts only the positive entry so one transfer is counted once.
- The history test inserts payments at both midnight boundaries. The start is included, and the next day is excluded. Those test payments are then rolled back.
- The performance dataset has 40,410 entries. An index starting with `account_id` changes the entry lookup from a full sequential scan to a bitmap index/heap scan. The same 203 history rows are returned in both phases.
- In the latest saved embedded-engine run, the median execution time changed from 44.248 ms to 1.971 ms across five runs per phase. The slower first before run, 94.660 ms, is retained in the evidence. The results are not a production-server benchmark.
- The index used 1256 kB. That storage and the extra maintenance needed for future writes are tradeoffs; the activity did not measure write performance.
- The [performance notes](../Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/performance_analysis.md) link to the complete plans and measurements. Questions for my review: Why does column order matter in this index? Why can PostgreSQL still scan the small accounts table? Why should the result stay unchanged when an index is added?

## Evidence available from Portfolio 3 — 30 October 2026

These are factual notes from the Codex-assisted implementation, not a completed personal reflection:

- A native PostgreSQL 18.4 process supplied separate A, B, and observer connections. The run uses the same five-table schema with a fresh account fixture and reset starting funds for each experiment.
- The commit example saved one transfer, two entries, and one audit event. A division-by-zero error before commit caused rollback to remove all those new rows and restore every starting balance.
- Under Read Committed, B could not see A's uncommitted transfer. B's later read in the same transaction saw the transfer after A committed. This shows no dirty read and an allowed nonrepeatable read.
- The observer confirmed a real lock wait using `pg_blocking_pids`. After the first NGN 800 withdrawal committed from an NGN 1,000 balance, the second request obtained its locks, read NGN 200, and was rejected. Only the first withdrawal remained.
- The balance check runs as a new statement after acquiring account locks. Checking before the wait, or relying on a statement snapshot from before the wait, could use an outdated balance. Read Committed alone is not the overdraft control.
- The four demonstrations include balance and saved-row checks and use only Ada, Bello, and clearing in their fixture.
- Questions for my review: Why must one transaction stay on one connection? Why do the account locks come before the balance query? What happens if a writer bypasses this procedure? Why does locking clearing also make some unrelated requests wait?

## Choosing what goes in the report

A decision, a challenge, and a lesson supported by a result should give the reflection a clear focus. I’ll explain those examples in my own words, link to the relevant files, and keep the reflection short enough to fit within the overall 2–3 page summary.
