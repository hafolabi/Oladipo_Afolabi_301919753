# Portfolio 5: Distributed and Cloud Database Exercise

**Marks:** 6

**Case study:** AfolabiPay

**Progress:** The sourced discussion was completed on 30 October 2026. The architecture is proposed; no cluster or cloud service was deployed.

The brief permits a distributed/cloud database **discussion or setup**. This activity takes the discussion route. Read [distributed_discussion.md](distributed_discussion.md) for the completed work and its source links.

## How the work meets the brief

| Topic | Coverage in the discussion |
| --- | --- |
| Same case study | PostgreSQL remains AfolabiPay's financial record, with MongoDB profiles and events from Portfolio 4 |
| Replication | [Copies and acknowledgements](distributed_discussion.md#replication) for a PostgreSQL standby and a three-member MongoDB replica set |
| Availability | [Server failures, elections, and pauses](distributed_discussion.md#availability-and-failures), including the limits of synchronous replication |
| Consistency | [Where reads go](distributed_discussion.md#consistency-and-payment-decisions), using the competing withdrawals from Portfolio 3 |
| Sharding | [Why the sample stays unsharded](distributed_discussion.md#sharding-assessment), with possible keys and their tradeoffs |
| Cloud context | A small [proposed architecture diagram](distributed_discussion.md#proposed-cloud-arrangement) and placement across availability zones |

The written analysis is the evidence for this route. It distinguishes the proposed arrangement from the local database checks already performed. There are no deployment commands or runtime results for Portfolio 5.

For review, be able to explain why a delayed copy must not authorise a withdrawal, why a replica set can pause writes during failure, and why adding shards would complicate this small example. The [project references](../Oladipo_Afolabi_301919753_FinalDocumentation/references.md) record the official documentation used.
