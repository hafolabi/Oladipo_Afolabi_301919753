# Portfolio 5: Distributed and Cloud Database Exercise

**Marks:** 6  
**Case study:** AfolabiPay  
**Progress:** Discussion outlined; no cluster or cloud database deployed.

Here I’ll consider how AfolabiPay could run across several database servers. A payment service needs to deal with failures, keep financial decisions based on current data, and handle a payment history that grows over time.

Section 4 allows a discussion **or** a setup using the case study. This portfolio will take the discussion route, focusing on replication, availability, and consistency, with a brief assessment of sharding. No deployment is planned as a required task.

## Topics to cover

| Topic | What it means for AfolabiPay | What the discussion needs to explain |
| --- | --- | --- |
| Replication | Keep copies of the data on other database servers | How the copies are maintained and what happens when a server fails |
| Availability | Explain what happens to payments when a database server fails | How replication can help, when service may pause, and the limits of the proposed arrangement |
| Consistency | Check current financial data before allowing a payment; allow reporting delays only where acceptable | Where reads go and how stale data could affect each operation |
| Sharding | Divide account or event data as the history grows | Possible shard keys, uneven traffic, and transfers between accounts on different shards |

## Proposed approach

The discussion will keep PostgreSQL as the proposed main financial record and use a MongoDB replica set as a concrete example for the document workload. I’ll explain how replication helps availability and why a stale read could be a problem when authorising a payment. A short paragraph will assess whether this small dataset needs sharding. These are proposed arrangements to discuss, not systems already deployed.

MongoDB’s [replication guide](https://www.mongodb.com/docs/manual/replication/) will support the explanation. A small architecture diagram can be added if it makes the discussion clearer. The cloud context can be explained without opening an account or selecting a paid service.

## Work to complete

- [ ] Write a short distributed/cloud discussion tied to AfolabiPay, with sources.
- [ ] Explain the tradeoffs between replication, consistency, and availability.
- [ ] Briefly assess sharding against the expected data size and queries.
- [ ] Make clear which parts are proposed and connect the explanation to the case study.

## Optional extensions

A local replica-set demonstration or cloud setup can be added later if there is a clear reason. Actual failover experiments, sharded clusters, backup/restore drills, provider comparisons, and cost studies are outside the core plan. If a setup is carried out, its configuration, commands, versions, and observed results will need to be saved as evidence.
