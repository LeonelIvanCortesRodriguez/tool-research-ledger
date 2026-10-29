# Evidence model

Evidence sets the limit on what the ledger may claim. It does not rate how impressive a tool appears.

Grades come from the owner's recorded use of each tool in named projects: the task, the result, the errors and the fixes. A person approves every grade change before it is exported, and `npm test` fails if the catalog differs from the export (`data/ledger-export.json`). In this edition 22 of 125 tools are above E0: 16 at E1 and 6 at E2. E0 means the tool was only read about. The checks shown in the interface test the ledger page and its data; they do not raise any grade.

| Level | Meaning | Minimum retained proof |
|---|---|---|
| E0 | Only read about | Public documentation, repository metadata, and license notes |
| E1 | Did real work in a named project | A bounded task and its outcome |
| E2 | Checked against a known answer written down first | Repeatable input, expected result, and checks |
| E3 | Representative corpus | Multiple realistic cases and known failure modes |
| E4 | Independent validation | Review by a separate operator or process |
| E5 | Monitored production | Sustained outcomes, incidents, and rollback evidence |

Influence on a design does not move a tool beyond E0, and a clean scan does not either. Installation alone does not create evidence. A level changes only when its minimum proof is retained and linked to the observation.

Decision labels answer a separate question: what action is permitted now? A tool can fit well and still be `REFERENCE` or `HOLD` because its proof or controls are insufficient.
