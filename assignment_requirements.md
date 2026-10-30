# Assignment checklist

This is my checklist from the assignment brief. It covers the five activities, marking, evidence, and final submission. The screenshots do not give a deadline or specify a database product or report file type.

## Why the project uses SQL and NoSQL

The brief starts with relational design, SQL queries, and transactions, then asks for a NoSQL implementation in Portfolio 4. The repository requirements also list both SQL scripts and NoSQL work.

I’ll use PostgreSQL for the relational activities and MongoDB for NoSQL, keeping AfolabiPay as the case study throughout.

## What each activity needs

| Activity | Marks | Required evidence | Current status |
| --- | ---: | --- | --- |
| Portfolio 1: Database Design and Modelling | 7 | Case study description; ER diagram; relational schema; keys; constraints; normalisation explanation | Design and SQL complete; embedded PostgreSQL checks and output saved |
| Portfolio 2: Query Processing and Optimisation | 7 | SQL queries; query results; execution plans; indexing/optimisation evidence; brief performance analysis | Four queries and checks complete; embedded PostgreSQL before/after plans, timings, index, and analysis saved |
| Portfolio 3: Transactions and Concurrency | 7 | Commit; rollback; isolation; concurrency issue or control mechanism; screenshots/output | Native PostgreSQL commit, rollback, Read Committed, and two-session locking checks passed; outputs and explanations saved |
| Portfolio 4: NoSQL and Advanced Data Models | 7 | NoSQL model for the same case study; document/key-value/column/graph example; implementation evidence; suitability explanation | Collections outlined; MongoDB work still to build |
| Portfolio 5: Distributed and Cloud Database Exercise | 6 | Discussion or setup for the same case study covering replication, sharding, availability, consistency, or deployment evidence | Discussion outlined; no system deployed |
| Final Documentation | 6 | 2–3 page summary; GitHub link; selected organisation; screenshots/evidence; individual reflection; references; AI-use declaration because AI has been used | Report plan ready; final report still to write |
| **Total** | **40** | | |

## Keeping the work within scope

Section 4 of the brief sets out the evidence for each activity. The plan below follows those deliverables. The number of queries, documents, and examples is a project choice; the screenshots do not set minimum counts or dataset sizes.

| Activity | Core plan for this portfolio | Optional extensions |
| --- | --- | --- |
| Portfolio 1 | Describe AfolabiPay; provide the ER diagram, relational schema, keys, constraints, and normalisation explanation. Build a small database that can also support Portfolios 2 and 3. | A login system, detailed access-control implementation, real customer verification, or a complete banking application |
| Portfolio 2 | Run a small set of relevant SQL queries, save their results, and explain one before-and-after optimisation comparison using execution plans and an index or query change. | A large benchmark suite, load testing, or tuning every query |
| Portfolio 3 | Demonstrate commit, rollback, isolation, and one concurrency issue or control mechanism, with outputs and a short explanation. The planned control example uses account-row locking. | Showing both an unsafe and corrected implementation, request-retry handling, automatic deadlock retries, or durable failure-logging workflows |
| Portfolio 4 | Implement one MongoDB document model for the same case study, insert sample documents, run queries, save outputs, and explain why the model suits those queries. | Additional NoSQL model types, extra collections, advanced validation, aggregation exercises, or a separate MongoDB performance study |
| Portfolio 5 | Write a case-based discussion of replication, availability, and consistency, with a brief assessment of sharding. The brief allows discussion or setup; this plan takes the discussion route. | A deployed cluster, cloud spending, a failover demonstration, backup/restore drills, or a provider cost study |
| Final documentation | Produce the 2–3 page LMS summary with all five activities, the organisation, GitHub link, selected evidence, reflection, references, and AI-use declaration. | A longer technical report or reproducing every script and screenshot in the summary |

The user roles, verification status, and balanced account postings in the case study are modelling choices. They help explain the data and payment examples. They do not require a working user interface, external verification service, or production banking system. Word and Markdown versions remain the chosen final formats.

The separate design notes and working files organise the supporting evidence in the repository. They do not increase the 2–3 page length of the LMS summary. Section 8 still calls for clear explanations of implementation and testing, so the shorter scope keeps those explanations and the saved outputs.

After Portfolio 5, a small terminal menu will let the lecturer list existing mock accounts and supply values for the implemented operations. This is an agreed usability addition; it does not require a frontend or expand the assignment into a complete banking application.

## How the portfolio is marked

Both tables describe the same 40 marks. The activity table shows what to submit; the rubric shows what the assessor will look for across the portfolio.

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

The brief also looks for problem-solving, independent work, and the ability to explain the solution if selected for verification. Each screenshot or code example needs a short explanation of what it shows.

## Individual work and sources

General concepts can be discussed with colleagues. The implementation, scripts, analysis, documentation, and conclusions submitted must still represent individual work and understanding. Development tools, books, documentation, online resources, and AI may be used as learning aids where permitted. I remain responsible for checking and explaining what I submit.

The submission must follow the University’s academic integrity requirements. I’ll record documentation, code, datasets, libraries, and other external resources in the [reference list](Oladipo_Afolabi_301919753_FinalDocumentation/references.md) as they are used.

Because Codex has helped with the project, I also need an [AI-use declaration](Oladipo_Afolabi_301919753_FinalDocumentation/ai_use_declaration.md). It must name the tool, describe its contribution, and explain how I reviewed, corrected, tested, or verified the output. The declaration records my documentation review so far and will be updated as the practical work is completed.

## Repository requirements

- Create a **private** GitHub repository for the course.
- Keep scripts, schemas, diagrams, NoSQL work, execution plans, measurements, screenshots, relevant configurations, test results, and documentation together.
- Commit useful milestones as the work develops so the history shows its progress.
- Follow the chosen folder naming convention: `Oladipo_Afolabi_301919753_DocumentType`.

The folders keep the brief’s six components and use the chosen naming convention.

## How the work will be verified

Verification will mainly use the technical evidence, documentation, and GitHub history. A viva or presentation is not required for everyone. The portfolio needs:

- A README for each activity explaining the implementation, setup, run commands, and testing.
- Screenshots, outputs, execution plans, logs, or configuration files that support those explanations.
- Commits showing development across the semester.
- A short personal reflection on design choices, challenges, and lessons learned.

The lecturer may select a small sample for a brief technical discussion. Unclear, copied, inaccessible, or suspicious submissions may also need individual verification. The notes should make the work and its reasoning easy to follow.

## Keeping a useful record

For each experiment, I’ll keep the command or script, its output, the software version, and a short explanation in the activity folder. Matching names such as `query_01.sql`, `query_01_result.txt`, `query_01_plan_before.txt`, and `query_01_plan_after.txt` should make the files easy to find.

Worked examples will stay labelled as expected outcomes until they are tested. Timing results need the dataset size and measurement conditions. All customer and payment data will be fictional.

The [reflection notes](Oladipo_Afolabi_301919753_FinalDocumentation/reflection_notes.md) are a place to record decisions and experiences as they happen. The personal reflection is still to write.

## LMS submission — Section 6

The LMS submission is a 2–3 page document covering all five activities, the selected organisation, and the GitHub link. The assessor must have repository access before submission. Screenshots or other supporting evidence must be included where required.

I’ll keep an editable Word document (`.docx`) and a Markdown copy (`.md`). These are my preferred formats; the brief does not specify a file type. Once the practical work is finished, the report will be proofread and checked for consistent headings, spacing, table and image alignment, captions, links, and page count.

## Final submission checks

- [ ] Clearly state the selected case study and organisation.
- [ ] Use AfolabiPay consistently across all five activities, unless the lecturer approves a change.
- [ ] Complete all five portfolio activities.
- [ ] Organise the private GitHub repository clearly.
- [ ] Include the practical work and its supporting evidence.
- [ ] Explain implementation and testing in the READMEs and documentation.
- [ ] Submit the required files through the LMS.
- [ ] Describe all five activities, name the case study, and include the GitHub link in the LMS document.
- [ ] Include supporting screenshots or evidence in the LMS submission where required.
- [ ] Check that the GitHub link works and the assessor can access the private repository before submission.
- [ ] Reference all sources, datasets, libraries, and other external resources used.
- [ ] Include the AI-use declaration with the tool, uses, and student's review or verification details.
- [ ] Include a clear individual technical reflection and be ready to explain the submitted work if selected.
- [ ] Check that the final summary is 2–3 pages.

The assignment screenshots are in the chat; copies have not been saved in this folder.
