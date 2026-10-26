# Portfolio 1: Database Design and Modelling

**Marks:** 7  
**Case study:** AfolabiPay — simulated Bank / Fintech Platform  
**Progress:** First design draft. The database has not been built yet.

This section sets out what AfolabiPay needs to store and how the tables fit together. The main concern is keeping the payment history clear: money leaving one account should have a matching entry showing where it went.

## Design documents

- [Case study](case_study.md): what AfolabiPay does, who uses it, and which operations the database supports.
- [Relational schema](relational_schema.md): the proposed tables, keys, relationships, and rules.
- [ER diagram](er_diagram.mmd): Mermaid source showing how the tables connect.
- [Normalisation](normalisation.md): why the data is split into these tables and how the design works towards third normal form.

## Work completed and still to do

- [x] Describe the organisation and decide what the project will cover.
- [x] Draft the tables and ER diagram.
- [x] Explain the keys, planned constraints, and normalisation choices.
- [ ] Build the tables in PostgreSQL and check them against the design.
- [ ] Save the schema as an SQL script that can be run again.
- [ ] Add fictional sample data, including deposits that fund the opening balances.
- [ ] Save table definitions and examples of accepted and rejected inserts.
- [ ] Export a readable ER diagram for the final report.
- [ ] Add setup instructions, software versions, and the exact commands for building and checking the tables to this README.
- [ ] Explain the checks performed, link to their results, and note any corrections or limits.

Some rules involve several rows, such as checking that a transfer's two entries balance. Those rules still need to be built and tested alongside the table constraints.
