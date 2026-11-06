# Portfolio 4: NoSQL and Advanced Data Models

**Marks:** 7

**Chosen model:** MongoDB documents for AfolabiPay

**Progress:** The document example and three query checks passed on 30 October 2026 using MongoDB 8.0.16.

This activity uses the document option in the brief. It stores two customer profiles and three completed payment events from the SQL case study. Start with [the document model](Oladipo_Afolabi_301919753_document_model.md), then [the queries](tools/Oladipo_Afolabi_301919753_queries.mjs).

## Required work and evidence

| Requirement | Implementation or evidence |
| --- | --- |
| NoSQL model based on the same case study | [Oladipo_Afolabi_301919753_document_model.md](Oladipo_Afolabi_301919753_document_model.md) explains the two collections and how IDs match the SQL data |
| Document example | [Oladipo_Afolabi_301919753_sample_data.mjs](tools/Oladipo_Afolabi_301919753_sample_data.mjs) inserts Ada, Bello, two deposits, and their transfer |
| Implementation evidence | [Oladipo_Afolabi_301919753_validation.txt](evidence/Oladipo_Afolabi_301919753_validation.txt), the query results below, and [Oladipo_Afolabi_301919753_environment.json](evidence/Oladipo_Afolabi_301919753_environment.json) |
| Explanation of suitability | The model explains embedding, references, the queries they support, and the limits of this design |

## Run the example

You need Node.js **20.19 or later** and npm. From the repository root:

```sh
cd Oladipo_Afolabi_301919753_Portfolio4NoSQL/tools
npm ci
npm run verify
```

`npm ci` installs the pinned packages. The first verification run downloads MongoDB 8.0.16 from MongoDB's distribution site, so it needs internet access and may take a little longer. The binary is cached under `tools/node_modules/.cache` and is ignored by Git.

The helper starts a real `mongod` process on a free local port, bound to `127.0.0.1`. It uses a fresh temporary database called `afolabipay_portfolio4`, inserts the sample, runs the queries and checks, and saves the results. It then closes the connection, stops MongoDB, and removes the temporary data. It does not use an existing database service.

A successful run ends with:

```text
ALL PORTFOLIO 4 CHECKS PASSED.
Stopped MongoDB and removed its temporary data.
```

The recorded run used MongoDB **8.0.16**, the MongoDB Node.js driver **6.20.0**, mongodb-memory-server-core **11.3.0**, and Node.js **26.0.0** on **macOS x64**. Only that platform has been tested for this project. Rerunning replaces the generated evidence.

## Collections and queries

| Collection | What it contains |
| --- | --- |
| `customer_profiles` | Two profiles, with embedded name and contact objects |
| `transaction_events` | Three completed payments, each containing its two money entries |

| Query | Checked result | Saved output |
| --- | --- | --- |
| Find a customer by email | Ada Okafor, customer ID 1 | [Oladipo_Afolabi_301919753_query_01_profile.json](evidence/Oladipo_Afolabi_301919753_query_01_profile.json) |
| Find completed payments affecting account `1000000001` | `DEP-001` and `TRF-001`, in posting-time order | [Oladipo_Afolabi_301919753_query_02_history.json](evidence/Oladipo_Afolabi_301919753_query_02_history.json) |
| Find completed transfers | `TRF-001`, moving 200000 kobo, or NGN 2,000 | [Oladipo_Afolabi_301919753_query_03_transfers.json](evidence/Oladipo_Afolabi_301919753_query_03_transfers.json) |

The history query returns the whole payment document, including both entries. It matches an account inside the entries array using `'entries.account_number'`.

The results use MongoDB Extended JSON to preserve BSON types. `$numberLong` identifies an exact 64-bit integer, `$numberInt` a smaller integer such as an ID, and `$date` a date. For example, `{ "$numberLong": "200000" }` means 200000 whole kobo. The [Extended JSON documentation](https://www.mongodb.com/docs/drivers/node/v6.x/data-formats/extended-json/) explains these wrappers.

## Files and checks

| File | Purpose |
| --- | --- |
| [Oladipo_Afolabi_301919753_sample_data.mjs](tools/Oladipo_Afolabi_301919753_sample_data.mjs) | Insert the small set of fictional documents |
| [Oladipo_Afolabi_301919753_queries.mjs](tools/Oladipo_Afolabi_301919753_queries.mjs) | The three MongoDB find queries |
| [Oladipo_Afolabi_301919753_run_queries.mjs](tools/Oladipo_Afolabi_301919753_run_queries.mjs) | Start MongoDB, load the data, check answers, save output, and close the server |

The checks confirm collection counts, the expected customer and payment results, and that every sample event has two BSON Long amounts adding up to zero. They check this document example; they are not a separate payment-validation suite.

PostgreSQL remains the main financial record. This MongoDB example is loaded separately and demonstrates profile and payment-history reads. The [terminal menu](../Oladipo_Afolabi_301919753_README.md#run-the-terminal-menu) lets you try the SQL payment operations; its new payments are not copied into these MongoDB documents.
