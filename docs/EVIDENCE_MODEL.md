# Evidence model

Evidence sets the limit on what the ledger may claim. It does not rate how impressive a tool appears.

Every catalog entry in this edition is currently E0. Each has a public repository link and source-review status. The release excludes private trials and internal scan reports, so those records cannot raise a tool's public evidence level. The checks shown in the interface validate the ledger application. They do not validate the third-party tools.

| Level | Meaning | Minimum retained proof |
|---|---|---|
| E0 | Source reviewed | Public documentation, repository metadata, and license notes |
| E1 | Smoke task observed | A bounded task and its outcome |
| E2 | Controlled benchmark | Repeatable input, expected result, and checks |
| E3 | Representative corpus | Multiple realistic cases and known failure modes |
| E4 | Independent validation | Review by a separate operator or process |
| E5 | Monitored production | Sustained outcomes, incidents, and rollback evidence |

Influence on a design does not move a tool beyond E0. Installation alone does not create evidence. A level changes only when its minimum proof is retained and linked to the observation.

Decision labels answer a separate question: what action is permitted now? A tool can fit well and still be `REFERENCE` or `HOLD` because its proof or controls are insufficient.
