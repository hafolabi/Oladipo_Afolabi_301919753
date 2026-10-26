# Portfolio 4: NoSQL and Advanced Data Models

**Marks:** 7  
**Chosen model:** MongoDB document database  
**Case study:** AfolabiPay, the same simulated fintech used in the SQL activities  
**Progress:** The collections are outlined. The MongoDB scripts have not been built or run yet.

This activity represents part of AfolabiPay's data as documents. Customer profiles and payment events provide a useful comparison with the SQL design: some details are easier to read together in one document, while others need to remain separate as the payment history grows.

## Planned collections

| Collection | What it stores | How related data is handled |
| --- | --- | --- |
| `customer_profiles` | Customer ID, name, contact details, and verification details | Keep the small contact and verification subdocuments inside the profile because they are often read together |
| `account_snapshots` | Account ID, customer ID where applicable, kind, status, and the time the snapshot was taken | Link to the customer and make the snapshot time clear; the snapshot does not supply a live account balance |
| `transaction_events` | Transaction ID, reference, type, status, timestamps, original transaction ID for a reversal, and two entries for a posted payment | Keep the two entries inside the event and link them to their accounts, so an account document does not need to hold its entire payment history |

The sample documents will use fictional customers and payments from the same scenario as the SQL activities. A script will recreate the sample data, and the notes will explain how the SQL and MongoDB IDs match. The two exercises will be loaded separately; automatic synchronisation has not been implemented.

## Work to complete

- [ ] Write a `mongosh` script to create the collections and validation rules.
- [ ] Add fictional profiles, account snapshots, deposits, withdrawals, transfers, and a reversal.
- [ ] Store money as exact whole kobo using a suitable BSON integer type, such as `NumberLong`.
- [ ] Add unique indexes for IDs and indexes that support the planned history queries.
- [ ] Find an account's events by date, status, and event type.
- [ ] Use an aggregation pipeline to calculate daily completed transfer totals, counting each transfer once.
- [ ] Try an invalid document to show the validation rule working, and save the query outputs.
- [ ] Explain the choices about embedding, references, validation, and which queries the design suits.
- [ ] Add setup instructions, software versions, and the commands for loading and querying the documents to this README.
- [ ] Explain how the results were checked, with links to outputs and any corrections or limits found.

## Why use this document model?

The main use is looking up customer profiles and inspecting payment events. An event contains a fixed pair of entries, so keeping those entries together makes it easy to read the complete movement of money. Account history can keep growing, so it is stored as separate events linked to the account.

An atomic write to one event keeps that document's changes together. Updating two separate account documents safely, or preventing an overdraft across concurrent payments, would need additional transaction and concurrency controls if MongoDB were used as the main financial record.

MongoDB's [data modelling guidance](https://www.mongodb.com/docs/manual/data-modeling/best-practices/) explains how query patterns influence embedding and references, as well as what single-document atomicity covers. The implementation will check how well the planned structure supports the example queries.
