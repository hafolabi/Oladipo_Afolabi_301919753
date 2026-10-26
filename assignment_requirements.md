# Assignment checklist

This checklist follows the assignment screenshots shared for the project, including the later pages on individual work, technical verification, marking, AI use, and submission. The pages shown do not give a deadline, name a compulsory database product, or specify a report file format.

## Why the project uses SQL and NoSQL

The brief asks for both types of database work. Portfolio 1 covers relational design, including an ER diagram, keys, constraints, and normalisation. Portfolio 2 asks for SQL queries and an analysis of how they run. Portfolio 3 looks at transactions and concurrent access. Portfolio 4 then asks for a NoSQL model and a working implementation. The repository requirements also list both SQL scripts and NoSQL implementations.

The current plan is to use PostgreSQL for the relational activities and MongoDB for the NoSQL activity. AfolabiPay remains the case study throughout.

## What each activity needs

| Activity | Marks | Required evidence | Current status |
| --- | ---: | --- | --- |
| Portfolio 1: Database Design and Modelling | 7 | Case study description; ER diagram; relational schema; keys; constraints; normalisation explanation | First design draft ready; SQL tables still to build |
| Portfolio 2: Query Processing and Optimisation | 7 | SQL queries; query results; execution plans; indexing/optimisation evidence; brief performance analysis | Query and comparison plan ready; experiments still to run |
| Portfolio 3: Transactions and Concurrency | 7 | Commit; rollback; isolation; concurrency issue or control mechanism; screenshots/output | Scenarios planned; experiments still to run |
| Portfolio 4: NoSQL and Advanced Data Models | 7 | NoSQL model for the same case study; document/key-value/column/graph example; implementation evidence; suitability explanation | Collections outlined; MongoDB work still to build |
| Portfolio 5: Distributed and Cloud Database Exercise | 6 | Discussion or setup for the same case study covering replication, sharding, availability, consistency, or deployment evidence | Discussion outlined; no system deployed |
| Final Documentation | 6 | 2–3 page summary; GitHub link; selected organisation; screenshots/evidence; individual reflection; references; AI-use declaration because AI has been used | Report plan ready; final report still to write |
| **Total** | **40** | | |

## How the portfolio is marked

The activity allocations above and the rubric below describe the same 40-mark assessment. The first table helps organise the deliverables; this one shows the qualities the assessor will look for across the work.

| Criterion | Marks | How the work can demonstrate it |
| --- | ---: | --- |
| Technical correctness | 8 | Scripts that run, correct results, and checks of keys, constraints, balances, and failure cases |
| Database design quality | 6 | A clear ER diagram, suitable relationships, justified keys and constraints, and a sound normalisation explanation |
| Practical implementation | 8 | Working SQL and NoSQL scripts, repeatable setup instructions, and saved results from running them |
| Query and performance analysis | 5 | Comparable execution plans and measurements, with an explanation of what changed and why |
| Application of advanced database concepts | 5 | Case-specific work on transactions, concurrency, NoSQL modelling, and distributed/cloud design |
| Documentation and GitHub organisation | 5 | Clear activity READMEs, well-organised files, accessible evidence, and progressive commits |
| Technical reflection/evidence of individual understanding | 3 | A short personal explanation of design choices, challenges, lessons learned, and the results behind them |
| **Total** | **40** | |

The wider assessment expectations also include problem-solving, independent work, and being able to explain the submitted solution if selected for verification. Screenshots and code need explanations showing what they demonstrate.

## Individual work and learning aids

This is an individual assessment. General concepts can be discussed with colleagues, but the submitted implementation, scripts, analysis, documentation, and conclusions must represent the student's own work and understanding. Development tools, documentation, textbooks, online resources, and AI can be used as learning aids where permitted. The student remains responsible for checking, understanding, and explaining everything submitted.

The submission must follow the University's academic integrity requirements. Sources need to be acknowledged wherever they contribute to the work, including code, datasets, libraries, documentation, and other external resources. The [reference list](Oladipo_Afolabi_301919753_FinalDocumentation/references.md) will keep track of these as the project develops.

AI has already helped with this project, so a brief AI-use declaration is required. It needs to name the tool, explain what it helped with, and describe how the student reviewed, corrected, tested, or verified the output. The [working declaration](Oladipo_Afolabi_301919753_FinalDocumentation/ai_use_declaration.md) records the assistance so far and leaves the student's review details to be completed.

## Repository requirements

- Create a **private** GitHub repository for the course.
- Keep the SQL scripts, schemas, diagrams, NoSQL work, execution plans, performance results, screenshots, relevant configurations, test results, and documentation in the repository.
- Commit useful milestones as the project develops so the history shows how the work progressed.
- Follow the chosen folder naming convention: `Oladipo_Afolabi_301919753_DocumentType`.

The brief gives a suggested repository layout. This project keeps the same six components and uses the requested folder names.

## How the work will be verified

The brief does not require every student to give a viva or presentation. Verification will mainly use the submitted technical evidence, structured documentation, and progressive GitHub activity. In particular, each activity needs:

- A README explaining how it was implemented and tested, including setup and run instructions.
- Relevant screenshots, outputs, execution plans, logs, or configuration files that support the explanation.
- A development history showing work across the semester.
- A short individual reflection on design choices, challenges, and lessons learned.

The lecturer may select a small sample of students for a brief technical discussion where clarification is needed. Unclear, copied, inaccessible, or suspicious submissions may also lead to an individual verification discussion. The project notes should make it possible to follow the work and explain the decisions behind it.

## Keeping a useful record

For each experiment, save the script or command, the result it produced, the software version, and a short explanation in the relevant portfolio folder. Filenames such as `query_01.sql`, `query_01_result.txt`, `query_01_plan_before.txt`, and `query_01_plan_after.txt` make the files easy to match.

Keep worked examples labelled as expected outcomes until the experiments have been run. For performance comparisons, note the dataset size and how the timings were collected. If something goes wrong, keep the result and explain what changed when it was fixed. All customer and payment data will be fictional.

The [reflection notes](Oladipo_Afolabi_301919753_FinalDocumentation/reflection_notes.md) provide space to record those decisions and experiences while they are still fresh. They are working prompts for the final report, not a completed reflection.

## Final submission checks

- [ ] Clearly state the selected case study and organisation.
- [ ] Use AfolabiPay consistently across all five activities, unless the lecturer approves a change.
- [ ] Complete all five portfolio activities.
- [ ] Organise the private GitHub repository clearly.
- [ ] Include the practical work and its supporting evidence.
- [ ] Explain implementation and testing in the READMEs and documentation.
- [ ] Submit the required files through the LMS.
- [ ] Check that the GitHub link works and the assessor can access the private repository.
- [ ] Reference all sources, datasets, libraries, and other external resources used.
- [ ] Include the AI-use declaration with the tool, uses, and student's review or verification details.
- [ ] Include a clear individual technical reflection and be ready to explain the submitted work if selected.
- [ ] Check that the final summary is 2–3 pages.

The assignment screenshots were used to prepare this checklist. Copies of the images have not been saved in the project folder.
