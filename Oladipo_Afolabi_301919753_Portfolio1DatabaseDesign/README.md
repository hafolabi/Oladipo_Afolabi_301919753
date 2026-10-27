# Portfolio 1: Database Design and Modelling

**Marks:** 7  
**Case study:** AfolabiPay — simulated Bank / Fintech Platform  
**Progress:** Design drafted; database still to build.

This part of the portfolio explains the data AfolabiPay needs and how the tables connect. I’m using a pair of entries for each completed payment so there is a clear record of where the money came from and where it went.

Section 4 asks for the case study, ER diagram, relational schema, keys, constraints, and normalisation explanation. The PostgreSQL tables and sample data will also support the SQL and transaction activities, so they will be built once and reused.

## The design

- [Case study](case_study.md): the organisation, users, and day-to-day operations.
- [Relational schema](relational_schema.md): tables, keys, relationships, and payment rules.
- [ER diagram](er_diagram.mmd): the table relationships, written in Mermaid.
- [Normalisation](normalisation.md): the reasons for separating the data and how the design meets the intended normal forms.

## Progress checklist

- [x] Describe the organisation and decide what the project will cover.
- [x] Draft the tables and ER diagram.
- [x] Explain the keys, planned constraints, and normalisation choices.
- [ ] Build the tables in PostgreSQL and check them against the design.
- [ ] Save the schema as an SQL script that can be run again.
- [ ] Add fictional sample data, including deposits that fund the opening balances.
- [ ] Save table definitions and a small example of an accepted and rejected insert.
- [ ] Export a readable ER diagram for the final report.
- [ ] Add the software versions and commands needed to build and check the tables.
- [ ] Explain what the checks showed, link to the outputs, and note any fixes or limits.

A transfer’s entries must add up to zero, and a withdrawal must leave enough money in the account. These checks involve more than one row, so they will need payment routines and testing alongside the table constraints.

## Optional extensions

A full login system, database-wide permission design, real customer-verification process, and elaborate trigger framework are outside the core plan. The user roles and verification field describe the case study; implementing those wider services is not needed for this activity.
