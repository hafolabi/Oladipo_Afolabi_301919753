# Sources and resources

The original planning references are from the official PostgreSQL and MongoDB documentation and were checked on **26 October 2026**. PostgreSQL design references and PGlite documentation were consulted for Portfolio 1 on **27 October 2026**. PostgreSQL query and indexing references were consulted for Portfolio 2 on **29 October 2026**. Each entry shows where it informed the portfolio.

The assignment requirements came from the lecturer’s screenshots. The AfolabiPay scenario, table design, and normalisation explanation were developed for this project with Codex support. The wording revisions were edits to the project documents, with no additional websites consulted for those changes.

## Websites and pages consulted

| Website | Reference page | How it informed the work |
| --- | --- | --- |
| PostgreSQL — `postgresql.org` | [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html), PostgreSQL Documentation | Planning the commit, rollback, and transfer examples in [Portfolio 3](../Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/README.md) |
| PostgreSQL — `postgresql.org` | [Using EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html), PostgreSQL 18 Documentation | Reading the actual scan, join, row-count, buffer, and timing output in [Portfolio 2](../Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/README.md); consulted 29 October 2026 |
| PostgreSQL — `postgresql.org` | [Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html), PostgreSQL Documentation | Preparing the two-session visibility and concurrency experiments in [Portfolio 3](../Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/README.md) |
| MongoDB — `mongodb.com` | [Best Practices for Data Modeling in MongoDB](https://www.mongodb.com/docs/manual/data-modeling/best-practices/), MongoDB Manual | Planning embedding, references, and document boundaries in [Portfolio 4](../Oladipo_Afolabi_301919753_Portfolio4NoSQL/README.md) |
| MongoDB — `mongodb.com` | [Replication](https://www.mongodb.com/docs/manual/replication/), MongoDB Manual | Outlining replica sets and availability for [Portfolio 5](../Oladipo_Afolabi_301919753_Portfolio5DistributedCloud/README.md) |
| PostgreSQL — `postgresql.org` | [Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html), PostgreSQL 18 Documentation | Portfolio 1 primary/foreign/unique/check constraints, NULL behaviour, and limits of cross-row checks; consulted 27 October 2026 |
| PostgreSQL — `postgresql.org` | [Identity Columns](https://www.postgresql.org/docs/18/ddl-identity-columns.html), PostgreSQL 18 Documentation | Generated identifiers with explicit primary keys; consulted 27 October 2026 |
| PostgreSQL — `postgresql.org` | [Numeric Types](https://www.postgresql.org/docs/18/datatype-numeric.html), [Aggregate Functions](https://www.postgresql.org/docs/18/functions-aggregate.html), PostgreSQL 18 Documentation | Exact integer kobo and the `numeric` result of summing `bigint`; consulted 27 October 2026 |
| PostgreSQL — `postgresql.org` | [PostgreSQL Error Codes](https://www.postgresql.org/docs/18/errcodes-appendix.html), PostgreSQL 18 Documentation | Expected constraint errors, including `23001` for the observed restricted deletion; consulted 27 October 2026 |
| Electric / PGlite — `pglite.dev` | [What is PGlite](https://pglite.dev/docs/about), [Getting started](https://pglite.dev/docs/), [API](https://pglite.dev/docs/api), [PGlite Socket](https://pglite.dev/docs/pglite-socket) | Running PostgreSQL from Node.js, reading the query results, and explaining the single-connection limit; consulted 27 October 2026 |
| PostgreSQL — `postgresql.org` | [Multicolumn Indexes](https://www.postgresql.org/docs/18/indexes-multicolumn.html), PostgreSQL 18 Documentation | Choosing `account_id` as the first column of the history-query index; consulted 29 October 2026 |
| PostgreSQL — `postgresql.org` | [ANALYZE](https://www.postgresql.org/docs/18/sql-analyze.html), PostgreSQL 18 Documentation | Collecting planner statistics before measuring the larger dataset; consulted 29 October 2026 |
| PostgreSQL — `postgresql.org` | [Set Returning Functions](https://www.postgresql.org/docs/18/functions-srf.html), PostgreSQL 18 Documentation | Using `generate_series` to create the repeatable fictional performance dataset; consulted 29 October 2026 |

The original PostgreSQL links pointed to version 18 when checked. The implementation references explicitly select version 18. Both activities' embedded engine reported PostgreSQL 18.6 through PGlite 0.5.12; the full strings are in the [Portfolio 1 output](../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/evidence/schema_validation.txt) and [Portfolio 2 measurements](../Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/evidence/measurements.json). Standalone PostgreSQL and MongoDB versions remain to be recorded when those services are set up.

## Other project resources

| Resource | Current record |
| --- | --- |
| Assignment brief | Instructions supplied as screenshots in chat. Formal brief and course details can be added when available. |
| Datasets | No external dataset used. Portfolio 1's [seed.sql](../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/seed.sql) contains fictional people and payments. Portfolio 2's [performance_seed.sql](../Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/performance_seed.sql) uses deterministic counters for 199 extra customers/accounts, 200 funding deposits, and 20,000 transfers. No live customer data is used. |
| Third-party code | No copied application code snippets. The verification helper uses the PGlite library, whose npm package declares Apache-2.0; its version and integrity are pinned in the tools lockfile. |
| Software and libraries | Portfolios 1 and 2: PGlite 0.5.12, PostgreSQL 18.6 (WebAssembly), Node.js 26.0.0, macOS x64. The JavaScript helpers use built-in Node.js modules and PGlite, pinned in each tools lockfile. Diagram export uses Python's standard library. Standalone PostgreSQL and MongoDB remain planned. |
| AI assistance | OpenAI Codex assisted with explanations, design suggestions, SQL and script drafts, automated checks, and wording. The [AI-use declaration](ai_use_declaration.md) records that support and the student's decisions and review status. |
