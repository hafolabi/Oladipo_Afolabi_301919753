# Technical reflection — working notes

These notes will help prepare the short individual reflection in the final report. Fill them in while building and checking the project. They are prompts for recording experience; the reflection itself has not been written yet.

## A design choice worth explaining

- **The choice:** [Describe a decision made or accepted after reviewing the design.]
- **The alternatives:** [Explain what else could have been used.]
- **The reason:** [Explain why the chosen approach fits AfolabiPay and what tradeoff it introduces.]
- **The evidence:** [Link to the design, script, query result, or experiment that supports the explanation.]

Possible starting points include calculating balances from entries, representing a reversal as a new transaction, or deciding which MongoDB details to embed. Choose a decision that can be explained and defended after reviewing the implementation.

## A challenge encountered during the work

- **What happened:** [Describe a problem that actually came up.]
- **What was expected:** [State the intended behaviour.]
- **What was tried:** [Record the investigation or changes made.]
- **What the result showed:** [Explain whether the change helped and link to the relevant output.]
- **What was learned:** [Describe what would be done differently next time.]

This section can stay unfinished until there is a real example to discuss.

## Questions to revisit after each activity

| Activity | Points to explain from the completed work |
| --- | --- |
| Portfolio 1 | Why do the tables have these keys and relationships? Which rules can a row constraint enforce, and which need checks across rows? |
| Portfolio 2 | What changed in the execution plan? Do the measurements show a useful improvement, and what limits the comparison? |
| Portfolio 3 | What did the two sessions see? How did locking or isolation affect the withdrawal results? |
| Portfolio 4 | Why were some details embedded and others referenced? Which queries benefit, and what consistency rules still need additional handling? |
| Portfolio 5 | What happens when a server fails? Which parts of the architecture were discussed, simulated, or actually deployed? |

## Bringing the reflection into the final report

Choose a few specific examples from these notes: a decision, a challenge, and a lesson supported by a result. Explain them in the student's own words and connect them to the relevant files. Keep the reflection concise enough to fit within the overall 2–3 page summary.
