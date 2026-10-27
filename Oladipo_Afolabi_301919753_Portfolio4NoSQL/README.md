# Portfolio 4: NoSQL and Advanced Data Models

**Marks:** 7  
**Chosen model:** MongoDB document database  
**Case study:** AfolabiPay, the same simulated fintech used in the SQL activities  
**Progress:** Collections outlined; scripts and database runs still to complete.

In this activity I’ll represent AfolabiPay’s customer profiles and payment events as MongoDB documents. It gives me a way to compare the relational design with a model where related details can sit together inside one document.

Section 4 asks for one NoSQL model, implementation evidence, and an explanation of its suitability. A document model meets that choice; the brief does not require separate document, key-value, column, and graph implementations.

## Planned collections

| Collection | What it stores | How related data is handled |
| --- | --- | --- |
| `customer_profiles` | Customer ID, name, contact details, and verification details | Keep the small contact and verification subdocuments inside the profile because they are often read together |
| `transaction_events` | Transaction ID, reference, type, status, timestamps, original transaction ID for a reversal, and two entries for a posted payment | Keep the two entries inside the event and link them to their accounts, so an account document does not need to hold its entire payment history |

I’ll use fictional customers and payments from the SQL scenario and explain how their IDs match across the two models. A script will recreate the documents. Each database will be loaded separately; there is no automatic synchronisation between them.

## Work to complete

- [ ] Write a `mongosh` script to create the planned collections and insert sample documents.
- [ ] Use fictional customers and at least one payment example from the SQL case study. The sample count is a project choice.
- [ ] Store money as exact whole kobo using a suitable BSON integer type, such as `NumberLong`.
- [ ] Query the documents, including a lookup of payments affecting an account, and save the outputs.
- [ ] Explain embedding, references, and why this model suits the chosen queries.
- [ ] Record the software versions and commands for setting up, loading, and querying the data.
- [ ] Explain the checks, link to their outputs, and note any fixes or limits.

## Reasons for the document structure

A customer profile keeps contact and verification details together for lookup. A posted payment has a fixed pair of entries, which can be read together inside its event document. Account history keeps growing, so the model links separate events to the account instead of keeping the whole history in one array.

An atomic write keeps changes to one event together. If MongoDB were used as the main financial record, updating two separate accounts safely and preventing concurrent overdrafts would need additional transaction and concurrency controls.

MongoDB’s [data modelling guidance](https://www.mongodb.com/docs/manual/data-modeling/best-practices/) explains embedding, references, and single-document atomicity. I’ll compare that guidance with how the example queries work on this model.

## Optional extensions

An `account_snapshots` collection, a validation rule, or a simple aggregation can be added if it helps the explanation. Advanced validation, additional indexes, a second optimisation exercise, other NoSQL model types, and live SQL-to-MongoDB synchronisation are outside the core plan.
