# Portfolio 5: Distributed and Cloud Database Exercise

**Marks:** 6

**Case study:** AfolabiPay

**Progress:** The sourced discussion was completed on 31 October 2026. The architecture is proposed; no cluster or cloud service was deployed.

This activity analyses a proposed distributed/cloud database arrangement. [Oladipo_Afolabi_301919753_distributed_discussion.md](Oladipo_Afolabi_301919753_distributed_discussion.md) contains the analysis and its source links.

## Topics covered

| Topic | Coverage in the discussion |
| --- | --- |
| Same case study | PostgreSQL remains AfolabiPay's financial record, with MongoDB profiles and events from Portfolio 4 |
| Replication | [Copies and acknowledgements](Oladipo_Afolabi_301919753_distributed_discussion.md#replication) for a PostgreSQL standby and a three-member MongoDB replica set |
| Availability | [Server failures, elections, and pauses](Oladipo_Afolabi_301919753_distributed_discussion.md#availability-and-failures), including the limits of synchronous replication |
| Consistency | [Where reads go](Oladipo_Afolabi_301919753_distributed_discussion.md#consistency-and-payment-decisions), using the competing withdrawals from Portfolio 3 |
| Sharding | [Why the sample stays unsharded](Oladipo_Afolabi_301919753_distributed_discussion.md#sharding-assessment), with possible keys and their tradeoffs |
| Cloud context | A small [proposed architecture diagram](Oladipo_Afolabi_301919753_distributed_discussion.md#proposed-cloud-arrangement) and placement across availability zones |

The written analysis and architecture diagram describe the proposed arrangement. Portfolios 3 and 4 contain the local database checks; Portfolio 5 has no deployment commands or runtime results.

The [project references](../Oladipo_Afolabi_301919753_FinalDocumentation/Oladipo_Afolabi_301919753_references.md) record the official documentation used.
