# Assignment checklist

This checklist summarises the five activities, marking, evidence, and final submission requirements from the assignment brief. The supplied screenshots do not give a deadline or specify a database product or report file type.

## Why the project uses SQL and NoSQL

The brief starts with relational design, SQL queries, and transactions, then asks for a NoSQL implementation in Portfolio 4. The repository requirements also list both SQL scripts and NoSQL work.

The project uses PostgreSQL for the relational activities and MongoDB for NoSQL, with AfolabiPay as the case study throughout.

## What each activity needs

| Activity | Marks | Required evidence | Current status |
| --- | ---: | --- | --- |
| Portfolio 1: Database Design and Modelling | 7 | Case study description; ER diagram; relational schema; keys; constraints; normalisation explanation | Design and SQL complete; embedded PostgreSQL checks and output saved |
| Portfolio 2: Query Processing and Optimisation | 7 | SQL queries; query results; execution plans; indexing/optimisation evidence; brief performance analysis | Four queries and checks complete; embedded PostgreSQL before/after plans, timings, index, and analysis saved |
| Portfolio 3: Transactions and Concurrency | 7 | Commit; rollback; isolation; concurrency issue or control mechanism; screenshots/output | Native PostgreSQL commit, rollback, Read Committed, and two-session locking checks passed; outputs and explanations saved |
| Portfolio 4: NoSQL and Advanced Data Models | 7 | NoSQL model for the same case study; document/key-value/column/graph example; implementation evidence; suitability explanation | Two MongoDB collections and three queries implemented; checks passed on MongoDB 8.0.16; model explanation and outputs saved |
| Portfolio 5: Distributed and Cloud Database Exercise | 6 | Discussion or setup for the same case study covering replication, sharding, availability, consistency, or deployment evidence | Sourced AfolabiPay discussion and proposed diagram complete; replication, availability, consistency, and sharding covered; no deployment |
| Final Documentation | 6 | 2–3 page summary; GitHub link; selected organisation; screenshots/evidence; individual reflection; references; AI-use declaration because AI has been used | Editable Word and Markdown drafts created, with all five portfolios and selected outputs; personal reflection/review notes and access confirmation still to finish |
| **Total** | **40** | | |

## Keeping the work within scope

Section 4 of the brief sets out the evidence for each activity. The table below follows those deliverables. The number of queries, documents, and examples is a project choice; the screenshots do not set minimum counts or dataset sizes.

| Activity | Core work for this portfolio |
| --- | --- |
| Portfolio 1 | Describe AfolabiPay; provide the ER diagram, relational schema, keys, constraints, and normalisation explanation. Build a small database that can also support Portfolios 2 and 3. |
| Portfolio 2 | Run a small set of relevant SQL queries, save their results, and explain one before-and-after optimisation comparison using execution plans and an index or query change. |
| Portfolio 3 | Demonstrate commit, rollback, isolation, and one concurrency issue or control mechanism, with outputs and a short explanation. The control example uses account-row locking. |
| Portfolio 4 | Implement one MongoDB document model for the same case study, insert sample documents, run queries, save outputs, and explain why the model suits those queries. |
| Portfolio 5 | Write a case-based discussion of replication, availability, and consistency, with a brief assessment of sharding. The brief allows discussion or setup; this activity takes the discussion route. |
| Final documentation | Produce the 2–3 page LMS summary with all five activities, the organisation, GitHub link, selected evidence, reflection, references, and AI-use declaration. |

The user roles, verification status, and balanced account postings in the case study explain the fictional customer records and payment examples. Word and Markdown versions are the chosen final formats.

The separate design notes and working files organise the supporting evidence in the repository. They do not increase the 2–3 page length of the LMS summary. Section 8 still calls for clear explanations of implementation and testing, so the shorter scope keeps those explanations and the saved outputs.

The [terminal menu](Oladipo_Afolabi_301919753_README.md#run-the-terminal-menu) lets the student or lecturer list existing mock accounts and supply values for history, deposits, withdrawals, and transfers. It reuses the existing SQL payment implementation and provides a simple way to try it.

## How the portfolio is marked

Both tables describe the same 40 marks. The activity table shows what to submit; the rubric shows how the portfolio is assessed.

| Criterion | Marks | How the work can demonstrate it |
| --- | ---: | --- |
| Technical correctness | 8 | Scripts that run, correct results, and focused checks of the selected constraints and payment examples |
| Database design quality | 6 | A clear ER diagram, suitable relationships, justified keys and constraints, and a sound normalisation explanation |
| Practical implementation | 8 | Working SQL and NoSQL scripts, repeatable setup instructions, and saved results from running them |
| Query and performance analysis | 5 | Comparable execution plans and measurements, with an explanation of what changed and why |
| Application of advanced database concepts | 5 | Case-specific work on transactions, concurrency, NoSQL modelling, and distributed/cloud design |
| Documentation and GitHub organisation | 5 | Clear activity READMEs, well-organised files, accessible evidence, and progressive commits |
| Technical reflection/evidence of individual understanding | 3 | A short personal explanation of design choices, challenges, lessons learned, and the results behind them |
| **Total** | **40** | |

The brief also looks for problem-solving and independent work. Each screenshot or code example needs a short explanation of what it shows.

## Individual work and sources

General concepts can be discussed with colleagues. The implementation, scripts, analysis, documentation, and conclusions submitted must still represent individual work and understanding. Development tools, books, documentation, online resources, and AI may be used as learning aids where permitted. The student is responsible for checking and understanding the submitted work.

The submission must follow the University’s academic integrity requirements. The [reference list](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_references.md) records the documentation, code, datasets, libraries, and other external resources used.

The [AI-use declaration](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_ai_use_declaration.md) names the tool used, describes its contribution, and records the review and testing completed so far. Update the review details after completing the remaining checks.

## Repository requirements

- Create a **private** GitHub repository for the course.
- Keep scripts, schemas, diagrams, NoSQL work, execution plans, measurements, screenshots, relevant configurations, test results, and documentation together.
- Commit useful milestones as the work develops so the history shows its progress.
- Follow the chosen naming convention for folders and project files: `Oladipo_Afolabi_301919753_DocumentType`, with each file's original extension.

The folders keep the brief’s six components and use the chosen naming convention. Documentation, scripts, diagrams, and saved evidence use the same prefix. npm requires `package.json` and `package-lock.json`, and Git uses `.gitignore`, so these configuration files keep their standard names.

## Evidence and review

Technical evidence, documentation, and GitHub history support the review. The portfolio needs:

- A README for each activity explaining the implementation, setup, run commands, and testing.
- Screenshots, outputs, execution plans, logs, or configuration files that support those explanations.
- Commits showing development across the semester.
- A short personal reflection on design choices, challenges, and lessons learned.

The notes should make the work and its reasoning easy to follow.

## Keeping a useful record

Keep each experiment's command or script, output, software version, and a short explanation in its activity folder. Matching names such as `Oladipo_Afolabi_301919753_query_01.sql`, `Oladipo_Afolabi_301919753_query_01_result.txt`, `Oladipo_Afolabi_301919753_query_01_plan_before.txt`, and `Oladipo_Afolabi_301919753_query_01_plan_after.txt` make the files easy to find.

Label untested examples as expected outcomes. Timing results need the dataset size and measurement conditions. All customer and payment data is fictional.

The [reflection notes](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_reflection_notes.md) are a place to record decisions and experiences as they happen. The personal reflection is still to write.

## LMS submission — Section 6

The LMS submission is a 2–3 page document covering all five activities, the selected organisation, and the GitHub link. The assessor must have repository access before submission. Screenshots or other supporting evidence must be included where required.

The [final documentation folder](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_README.md) contains an editable Word draft (`.docx`) and a Markdown copy (`.md`). The brief does not specify a file type. After completing the highlighted personal notes and fine-tuning the text, proofread the report and check its page count in Word.

## Final submission checks

- [x] Clearly state the selected case study and organisation.
- [x] Use AfolabiPay consistently across all five activities, unless the lecturer approves a change.
- [x] Complete all five portfolio activities.
- [ ] Organise the private GitHub repository clearly.
- [x] Include the practical work and its supporting evidence.
- [x] Explain implementation and testing in the READMEs and documentation.
- [ ] Submit the required files through the LMS.
- [ ] Describe all five activities, name the case study, and include the GitHub link in the LMS document.
- [ ] Include supporting screenshots or evidence in the LMS submission where required.
- [ ] Check that the GitHub link works and the assessor can access the private repository before submission.
- [ ] Reference all sources, datasets, libraries, and other external resources used.
- [ ] Include the AI-use declaration with the tool, uses, and student's review or verification details.
- [ ] Include a clear individual technical reflection.
- [ ] Check that the final summary is 2–3 pages.

The assignment screenshots are in the chat; copies have not been saved in this folder.
