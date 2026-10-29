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

## Evidence available from Portfolio 1 — 27 October 2026

These are factual notes from the Codex-assisted implementation, not a completed personal reflection:

- The five tables keep customer details, accounts, payments, money entries, and action notes separate. The balance is calculated by adding completed entries.
- [The saved checks](../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/evidence/schema_validation.txt) show valid inserts, 22 rejected writes, balanced sample payments, and five deliberately introduced payment problems being found.
- A completed payment needs an explicit `IS NOT NULL` check for its posting time. Comparing a missing time alone will not reject it in a SQL check constraint.
- The first deletion check expected `23503`; the embedded engine returned `23001` for `ON DELETE RESTRICT`. The expectation was corrected and the checks then passed. This is a concrete example to investigate and explain personally.
- PGlite allowed SQL verification before installing a database service, but its single connection cannot supply the separate-session evidence needed for Portfolio 3.
- After the request for beginner-friendly code, the sample data uses direct inserts and the automatic checks use JavaScript objects, loops, and `try/catch`. The [reading guide](../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/start_here.md) connects the database terms to frontend concepts.
- Questions for my own review: Why is `(transaction_id, account_id)` the entry key? Why can clearing have no owner? Why can two individually valid entries still describe an invalid payment? Which rules will need locks?

## Choosing what goes in the report

A decision, a challenge, and a lesson supported by a result should give the reflection a clear focus. I’ll explain those examples in my own words, link to the relevant files, and keep the reflection short enough to fit within the overall 2–3 page summary.
