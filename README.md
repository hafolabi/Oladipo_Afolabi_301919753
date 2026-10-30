# Advanced Database Systems Portfolio

**Student:** Oladipo Afolabi  
**Student ID:** 301919753  
**Selected case study:** Bank / Fintech Platform  
**Simulated organisation:** AfolabiPay

My case study is AfolabiPay, a fictional fintech platform for deposits, withdrawals, and transfers between customers. Alongside moving money, the system needs to keep a payment history that staff can follow when checking balances or investigating a problem.

I’ll use the same case study throughout the five activities: **PostgreSQL for Portfolios 1–3**, **MongoDB for Portfolio 4**, and a discussion of distributed and cloud databases in Portfolio 5. This covers the SQL and NoSQL work in the brief. The software choice can change if the lecturer specifies a particular product.

The aim is a small database portfolio with clear practical evidence. The work will focus on the deliverables in Section 4 of the brief: a sound design, SQL queries and an optimisation example, transaction and concurrency examples, one NoSQL model, and a distributed/cloud discussion. The [scope notes](assignment_requirements.md) identify optional extensions so they do not become extra requirements.

## Finding the work

The folders follow `Surname_Firstname_StudentID_DocumentType`.

| Component | Folder | Marks |
| --- | --- | ---: |
| Portfolio 1 | [Database design and modelling](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/README.md) | 7 |
| Portfolio 2 | [Query processing and optimisation](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/README.md) | 7 |
| Portfolio 3 | [Transactions and concurrency](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/README.md) | 7 |
| Portfolio 4 | [NoSQL and advanced data models](Oladipo_Afolabi_301919753_Portfolio4NoSQL/README.md) | 7 |
| Portfolio 5 | [Distributed and cloud databases](Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/README.md) | 6 |
| Final documentation | [Summary and technical reflection](Oladipo_Afolabi_301919753_FinalDocumentation/README.md) | 6 |
| **Total** | | **40** |

## Where the project stands

Portfolio 1 has the case study, ER diagram, relational schema, normalisation explanation, executable SQL tables, and fictional sample data. The schema and data checks passed in embedded PostgreSQL (PGlite); [the activity README](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/README.md) links to the actual output.

Portfolio 2 now has four checked queries and one before-and-after index comparison. The saved run uses 40,410 entries and returns the same 203 history rows in both phases. Its [README](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/README.md) and [performance notes](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/performance_analysis.md) explain the measured results and the embedded-engine limits.

Portfolio 3 uses a project-local native PostgreSQL server with separate connections. Commit, rollback after an error, Read Committed visibility, and competing withdrawals with account locks passed on 30 October 2026. The [activity README](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/README.md) links to the saved outputs and run command. The native server stops after the checks; Portfolio 2's saved performance comparison remains a PGlite run. Portfolios 4 and 5 remain at the planning stage.

The [assignment checklist](assignment_requirements.md) keeps the requirements and marking rubric in one place. The [case study](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/case_study.md) explains the organisation, its users, and the database requirements.

For a first look at the SQL, use the [Portfolio 1 reading guide](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/start_here.md). It explains the keys using JavaScript objects and walks through the sample transfer.

The [Portfolio 2 reading guide](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/start_here.md) follows the balances query and explains the index and execution plans.

The [Portfolio 3 reading guide](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/start_here.md) follows a payment from `BEGIN` to `COMMIT` or `ROLLBACK`, then explains the two-session tests.

## What comes next

1. Review and repeat the completed Portfolio 1–3 checks, then explain the design, query comparison, and transaction results.
2. Represent the same customers and payments as MongoDB documents for Portfolio 4.
3. Write Portfolio 5's distributed/cloud discussion around replication, availability, and consistency, with a short assessment of sharding. A deployment is optional.
4. After Portfolio 5, add one interactive terminal menu so the lecturer can list the existing mock accounts and supply values for the implemented operations.
5. Write the final 2–3 page summary, covering all five activities, AfolabiPay, the GitHub link, and the required evidence. Prepare editable Word and Markdown versions for the LMS submission.

Git is initialised with an `origin` remote. Before submission, I’ll check that the GitHub repository is private and the assessor has access. As the work develops, I’ll commit useful milestones and keep the commands, software versions, and results with each activity so the experiments can be repeated.

## Notes for the final submission

Each activity’s README will explain how it was built and tested. I’ll use the [reflection notes](Oladipo_Afolabi_301919753_FinalDocumentation/reflection_notes.md) to record design decisions, challenges, and lessons for the final report. This is an individual assessment, and the lecturer may ask selected students to explain their work; a viva is not compulsory for everyone.

The [AI-use declaration](Oladipo_Afolabi_301919753_FinalDocumentation/ai_use_declaration.md) records Codex’s contribution and my documentation review so far. I’ll update it as the practical work is completed and keep the [reference list](Oladipo_Afolabi_301919753_FinalDocumentation/references.md) up to date. Before uploading the required files to the LMS, I need to check that the assessor can open the private GitHub repository.
