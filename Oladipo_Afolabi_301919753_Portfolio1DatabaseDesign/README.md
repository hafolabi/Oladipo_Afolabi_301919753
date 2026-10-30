# Portfolio 1: Database Design and Modelling

**Marks:** 7

**Case study:** AfolabiPay, a fictional fintech platform

**Progress:** Design complete; focused schema and sample-data checks passed on 30 October 2026.

This activity covers the case study, ER diagram, relational schema, keys, constraints, and normalisation required by the brief. If you are new to SQL, start with [the reading guide](start_here.md).

## Required work and evidence

| Requirement | Files |
| --- | --- |
| Case study description | [case_study.md](case_study.md) |
| ER diagram | [er_diagram.svg](er_diagram.svg), with [editable Mermaid source](er_diagram.mmd) |
| Relational schema | [relational_schema.md](relational_schema.md) and executable [schema.sql](schema.sql) |
| Keys and constraints | Explained in the relational schema, implemented in `schema.sql`, and recorded from PostgreSQL in [table_definitions.json](evidence/table_definitions.json) |
| Normalisation explanation | [normalisation.md](normalisation.md), covering 1NF to 3NF |

![AfolabiPay tables and relationships](er_diagram.svg)

The five tables store customers, accounts, payments, money entries, and audit events. A customer can own several accounts. Each completed payment has two equal-and-opposite entries. Clearing has no customer owner; ordinary customer accounts need one.

## Run the supporting checks

With Node.js 20 or later and npm, run these commands from the repository root:

```sh
cd Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/tools
npm ci
npm run verify
```

This uses PGlite to run PostgreSQL in a temporary database. It creates the tables, loads [seed.sql](seed.sql), checks the results, saves the evidence, and closes the database. No separate server is needed. The package version is pinned in the lockfile; installation needs npm access or a cached copy.

[verify.mjs](tools/verify.mjs) checks the row counts, balances, and payment entry pairs using [verify.sql](verify.sql). [check_constraints.mjs](tools/check_constraints.mjs) demonstrates six rule types: `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `CHECK`, and `ON DELETE RESTRICT`. It also confirms a valid customer and account can be inserted, then rolls them back. These are focused examples, not an exhaustive test of every business rule.

The [saved output](evidence/schema_validation.txt) records the passing checks and software versions. The run used PGlite 0.5.12 / PostgreSQL 18.6, Node.js 26.0.0, and macOS x64. The [table definitions](evidence/table_definitions.json) come from PostgreSQL's actual columns and constraints.

## Sample data

The sample has **4 customers, 5 accounts, 7 payments, 10 money entries, and 8 audit events**. Five payments completed; the failed and pending payments have no entries.

| Account | Purpose | Closing balance in NGN |
| --- | --- | ---: |
| `0000000000` | Clearing | -15,000.00 |
| `1000000001` | Ada's main account | 8,000.00 |
| `1000000002` | Bello's account | 7,000.00 |
| `1000000003` | Ada's spare account | 0.00 |
| `1000000004` | Chika's frozen account | 0.00 |

Ada deposits NGN 10,000 and sends Bello NGN 2,000. Bello also deposits NGN 5,000. His NGN 500 withdrawal is reversed, so those two movements cancel out. The spare account supports Portfolio 2's example of keeping accounts with no payments in a result.

## Scope

This activity designs and checks the tables. It does not implement a complete banking application. Some rules, such as checking available funds across payments, need more than a row-level constraint. [Portfolio 3](../Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/README.md) demonstrates payment checks and account locking.

The diagram helper supports the required ER diagram. From this activity's folder, `python3 tools/export_diagram.py` regenerates the SVG from the Mermaid attributes. It does not change the database.
