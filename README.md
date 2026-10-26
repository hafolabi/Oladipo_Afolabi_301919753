# Advanced Database Systems Portfolio

**Student:** Oladipo Afolabi  
**Student ID:** 301919753  
**Selected case study:** Bank / Fintech Platform  
**Simulated organisation:** AfolabiPay

AfolabiPay is a fictional fintech platform where customers can open accounts, deposit money, make withdrawals, and transfer funds to one another. The database also needs to keep a clear payment history so staff can trace problems, reverse eligible transactions, and check account balances.

This is the case study for all five activities in the portfolio. The plan is to use **PostgreSQL for Portfolios 1–3** and **MongoDB for Portfolio 4**, then discuss how the system could run across multiple servers in Portfolio 5. The assignment includes both SQL and NoSQL work. If the lecturer names a required database product, the software choice can be updated.

## Portfolio folders

Every project folder follows `Surname_Firstname_StudentID_DocumentType`.

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

The folders are in place, and there is a first draft of the case study, database design, and plan for each activity. The database scripts and practical experiments still need to be completed. For now, the amounts and outcomes in the notes are worked examples; measured results and screenshots will be added as the work is carried out.

The [assignment checklist](assignment_requirements.md) covers the deliverables, marking rubric, verification process, and submission checks. The [case study description](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/case_study.md) explains how AfolabiPay works and what the database needs to do.

## Plan for the work

1. Review the design, create the PostgreSQL tables, and add fictional customer and payment data.
2. Write the SQL queries, save their results, and compare execution plans before and after optimisation.
3. Test commits, rollbacks, and what happens when two database sessions try to use the same account at once.
4. Build a MongoDB document model using the same customers, accounts, and payment scenarios.
5. Discuss replication, consistency, availability, and a possible cloud setup. Save deployment evidence if a setup is carried out.
6. Bring the findings together in the final 2–3 page summary.

The assignment requires a private GitHub repository with regular commits as the work develops. This folder has not been initialised as a Git repository or connected to GitHub yet. Each practical activity will also need a record of the software version, commands, and results so the work can be followed and repeated.

## Explaining and reviewing the work

This is an individual assessment. Each activity's README will need to explain how the work was implemented and tested, with links to its outputs. The final report will include a short personal reflection on the design decisions, challenges, and lessons learned. The brief does not require a viva or presentation for everyone, but the lecturer may ask selected students to explain their work.

AI has helped prepare the initial drafts, so the project includes a [working AI-use declaration](Oladipo_Afolabi_301919753_FinalDocumentation/ai_use_declaration.md). The student's review and testing details still need to be added. The [reference list](Oladipo_Afolabi_301919753_FinalDocumentation/references.md) and [reflection notes](Oladipo_Afolabi_301919753_FinalDocumentation/reflection_notes.md) will be updated as the practical work develops. Submission also requires uploading the required files through the LMS and checking that the assessor can open the private GitHub repository.
