# Advanced Database Systems Portfolio

**Student:** Oladipo Afolabi  
**Student ID:** 301919753  
**Selected case study:** Bank / Fintech Platform  
**Simulated organisation:** AfolabiPay

AfolabiPay is a fictional fintech platform for deposits, withdrawals, and transfers between customers. Alongside moving money, the system keeps a payment history that staff can follow when checking balances or investigating a problem.

The same case study connects all five activities: **PostgreSQL for Portfolios 1–3**, **MongoDB for Portfolio 4**, and a discussion of distributed and cloud databases in Portfolio 5.

The portfolio covers database design, SQL queries and an optimisation example, transaction and concurrency examples, one NoSQL model, and a distributed/cloud discussion.

## Finding the work

Project files follow `Surname_Firstname_StudentID_DocumentType.extension`, for example `Oladipo_Afolabi_301919753_README.md` and `Oladipo_Afolabi_301919753_schema.sql`. Each file keeps its original format. npm manifests (`package.json` and `package-lock.json`) and `.gitignore` retain their required standard names. The component folders use the same student prefix.

| Component | Folder | Marks |
| --- | --- | ---: |
| Portfolio 1 | [Database design and modelling](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/Oladipo_Afolabi_301919753_README.md) | 7 |
| Portfolio 2 | [Query processing and optimisation](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/Oladipo_Afolabi_301919753_README.md) | 7 |
| Portfolio 3 | [Transactions and concurrency](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/Oladipo_Afolabi_301919753_README.md) | 7 |
| Portfolio 4 | [NoSQL and advanced data models](Oladipo_Afolabi_301919753_Portfolio4NoSQL/Oladipo_Afolabi_301919753_README.md) | 7 |
| Portfolio 5 | [Distributed and cloud databases](Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/Oladipo_Afolabi_301919753_README.md) | 6 |
| Final documentation | [Summary and technical reflection](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_README.md) | 6 |
| **Total** | | **40** |

## Implemented work

Portfolio 1 has the case study, ER diagram, relational schema, normalisation explanation, executable SQL tables, and fictional sample data. The schema and data checks passed in embedded PostgreSQL (PGlite); [the activity README](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/Oladipo_Afolabi_301919753_README.md) links to the actual output.

Portfolio 2 has four checked queries and one before-and-after index comparison. The saved run uses 40,410 entries and returns the same 203 history rows in both phases. Its [README](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/Oladipo_Afolabi_301919753_README.md) and [performance notes](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/Oladipo_Afolabi_301919753_performance_analysis.md) explain the measured results and the embedded-engine limits.

Portfolio 3 uses a project-local native PostgreSQL server with separate connections. Commit, rollback after an error, Read Committed visibility, and competing withdrawals with account locks passed on 30 October 2026. The [activity README](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/Oladipo_Afolabi_301919753_README.md) links to the saved outputs and run command. The native server stops after the checks; Portfolio 2's saved performance comparison remains a PGlite run.

Portfolio 4 has two MongoDB collections, three checked queries, saved outputs, and a short explanation of embedding and references. Its [README](Oladipo_Afolabi_301919753_Portfolio4NoSQL/Oladipo_Afolabi_301919753_README.md) explains the implementation and provides the run command. The checks passed on MongoDB 8.0.16 on 30 October 2026.

Portfolio 5 has a sourced [distributed/cloud discussion](Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/Oladipo_Afolabi_301919753_distributed_discussion.md) covering replication, availability, consistency, and sharding, with a proposed architecture diagram. No distributed cluster or cloud deployment was performed. The [PDF report](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_FinalReport.pdf) brings the five activities and their results together.

The [case study](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/Oladipo_Afolabi_301919753_case_study.md) explains the organisation, its users, and the database requirements.

For a first look at the SQL, use the [Portfolio 1 reading guide](Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/Oladipo_Afolabi_301919753_start_here.md). It explains the keys using JavaScript objects and walks through the sample transfer.

The [Portfolio 2 reading guide](Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/Oladipo_Afolabi_301919753_start_here.md) follows the balances query and explains the index and execution plans.

The [Portfolio 3 reading guide](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/Oladipo_Afolabi_301919753_start_here.md) follows a payment from `BEGIN` to `COMMIT` or `ROLLBACK`, then explains the two-session tests.

The [Portfolio 4 document model](Oladipo_Afolabi_301919753_Portfolio4NoSQL/Oladipo_Afolabi_301919753_document_model.md) explains the nested objects, entries array, and links back to the same customers and accounts.

## Run the terminal menu

The menu lets students and lecturers try the payment operations with their own amounts and the existing mock account numbers. It runs a local PostgreSQL database, using Portfolio 1's schema and sample data and Portfolio 3's payment functions.

Install Node.js 22 or newer with npm. Open a terminal in this project's root folder, where this README and `package.json` are, and run:

```bash
npm run setup
npm start
```

Run `setup` once after cloning the project; it installs the locked dependencies for Portfolios 1–4. Installation needs internet access. The first Portfolio 4 check also downloads its MongoDB binary. The database helpers start local servers, so a separate PostgreSQL or MongoDB installation is not needed. The practical scripts have been checked on macOS x64 with Node.js 26.

For later sessions, just run `npm start`. The menu shows:

```text
1. List accounts and balances
2. View account history
3. Deposit
4. Withdraw
5. Transfer
0. Exit
```

Type an option number and press Enter. The starting customer accounts are:

| Account number | Customer | Status | Starting balance (NGN) |
| --- | --- | --- | ---: |
| `1000000001` | Ada Okafor | Active | 8,000.00 |
| `1000000002` | Bello Musa | Active | 7,000.00 |
| `1000000003` | Ada Okafor, spare account | Active | 0.00 |
| `1000000004` | Chika Obi | Frozen | 0.00 |

Use an account from this list. Dami has a customer record but no account in the mock data. The internal clearing account, `0000000000`, is selected automatically for deposits and withdrawals.

### Try a transfer

1. Choose `5`.
2. Enter `1000000001` as the sending account and `1000000002` as the receiving account.
3. Enter `500` as the amount in naira and `TEST-001` as the payment reference.
4. The menu saves the payment and shows Ada with NGN 7,500.00 and Bello with NGN 7,500.00, if this is the first change in the session.

Amounts such as `500` or `500.50` are accepted, without commas or a currency symbol. Each payment needs a different reference. Withdrawals and transfers check the balance before saving. For example, a withdrawal of `9000` from Ada's account on a fresh session is refused because her balance is NGN 8,000. Frozen accounts cannot make or receive payments. Refused payments leave the balances unchanged.

For history, choose `2`, enter an account, and supply dates as `YYYY-MM-DD`. Dates use UTC: the start is included and the end is excluded. For the original sample payments, use `2026-10-02` to `2026-10-03`. Press Enter at both date prompts to include the sample date through tomorrow's UTC midnight; this also includes payments just made in the menu. Only completed payments appear, with money leaving the chosen account shown as a negative amount.

Choose `0` or press Ctrl+C to exit. Changes last for the current menu session. Exiting removes the temporary database, and restarting restores the original mock data. The menu does not overwrite the saved portfolio evidence. MongoDB's Portfolio 4 documents remain a separate sample and do not automatically copy new menu payments.

The server uses local port `55330`. If that port is occupied, choose another one, for example `DEMO_PORT=55331 npm start` on macOS/Linux.

### Repeat the portfolio checks

After `npm run setup`, these commands also work from the project root:

```bash
npm run check:p1
npm run check:p2
npm run check:p3
npm run check:p4
```

These are the repeatable evidence checks, while `npm start` accepts your own payment inputs. Portfolio 3's check uses separate connections to demonstrate isolation and competing withdrawals; the menu uses one connection. Portfolio 4's check runs the three MongoDB queries. Portfolio 5 is assessed through its [written discussion](Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/Oladipo_Afolabi_301919753_distributed_discussion.md), so it has no check command.

The check commands regenerate their activity's saved evidence. Portfolio 2 repeats the timed index comparison, so timings can change; its performance notes need to match any newly saved measurements. Each activity README explains the checks and results in more detail.

The menu code is in [Oladipo_Afolabi_301919753_interactive.mjs](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/tools/Oladipo_Afolabi_301919753_interactive.mjs). [Oladipo_Afolabi_301919753_demo_database.mjs](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/tools/Oladipo_Afolabi_301919753_demo_database.mjs) opens and closes the temporary database. The menu calls the existing [payment functions](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/tools/Oladipo_Afolabi_301919753_payments.mjs) and a [parameterised history query](Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/sql/Oladipo_Afolabi_301919753_menu_history.sql); the fixed Portfolio 2 benchmark query stays the same.

The menu checks passed on 30 October 2026: a custom transfer, deposit and withdrawal with decimal amounts, refused payments, supplied and default history dates, session reset, and Ctrl+C cleanup.

## Documentation

Each activity’s README explains its implementation and testing. The [final documentation guide](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_README.md) links to the PDF report. The [reflection notes](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_reflection_notes.md) discuss design decisions and lessons supported by the results.

The [AI-use declaration](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_ai_use_declaration.md) records the assistance used. The [reference list](Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_references.md) records the documentation, libraries, versions, datasets, and tools.
