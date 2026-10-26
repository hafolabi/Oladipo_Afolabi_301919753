# Portfolio 5: Distributed and Cloud Database Exercise

**Marks:** 6  
**Case study:** AfolabiPay  
**Progress:** The discussion is outlined. No cluster or cloud database has been deployed.

This section considers what would change if AfolabiPay ran across several database servers. The main questions are how payments would continue during a failure, which data needs to be current, and how the system could handle a larger payment history.

The brief allows a discussion **or** a setup based on the case study. A paid cloud deployment is not listed as a requirement in the pages supplied.

## Topics to cover

| Topic | What it means for AfolabiPay | What the discussion needs to explain |
| --- | --- | --- |
| Replication | Keep copies of the data on other database servers | How the copies are maintained and what happens when a server fails |
| Availability | Keep the service usable, or explain why it must pause, during a database failure | Failure detection, failover, client reconnection, and remaining limits |
| Consistency | Check current financial data before allowing a payment; allow reporting delays only where acceptable | Where reads go and how stale data could affect each operation |
| Sharding | Divide account or event data as the history grows | Possible shard keys, uneven traffic, and transfers between accounts on different shards |
| Cloud hosting | Run the same database design on a managed service | Architecture, access, backups, and costs if a specific service is selected |
| Recovery | Restore data after corruption or an accidental deletion | How restoring a backup differs from switching to a replica, and how a restore could be checked |

## Starting point for the architecture

The current design puts the main financial record in PostgreSQL and uses MongoDB for the separate profile and event exercise. The discussion will explain why a delayed replica view can be a problem when deciding whether a customer has enough money for a payment. It will also consider a MongoDB replica set for the document data and whether sharding would be useful at the scale of this project.

MongoDB's [replication guide](https://www.mongodb.com/docs/manual/replication/) describes how replica sets maintain copies of the same dataset for redundancy and availability. An architecture diagram will show the proposed arrangement. If a setup is carried out, its configuration and observed behaviour will be recorded alongside the diagram.

## Work to complete

- [ ] Write the architecture discussion around AfolabiPay's payment and reporting needs, with sources.
- [ ] Add a diagram showing where reads and writes go and what happens when a server fails.
- [ ] Explain the tradeoffs between replication, consistency, and availability.
- [ ] Consider sharding against the expected data size and queries.
- [ ] Save the configuration, commands, versions, and outputs if a setup is performed.
- [ ] Label proposals, simulations, and deployed work clearly.
- [ ] Explain how the proposed design addresses AfolabiPay's needs and which claims are supported by sources or observed results.
- [ ] If a setup or simulation is performed, add its prerequisites, software versions, run commands, and checks to this README.
