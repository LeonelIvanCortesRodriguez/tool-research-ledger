# Methodology

1. Define the job in plain language and select a capability family.
2. Review public repository documentation, maintenance signals, license, deployment model, and dependencies.
3. Record strengths, weaknesses, risks, constraints, and project fit separately.
4. Assign the highest evidence level whose required proof is retained.
5. Assign a decision label based on fit, evidence, risk, reversibility, and control requirements.
6. State the next proof needed for promotion.

The interface deliberately avoids a single composite score. Composite scores hide why an option is strong and can make weak evidence look precise. Sorting helps discovery; the detail view preserves the decision basis.

Catalog data is validated against the six-level evidence scale, seven decision states, unique identifiers, valid capability references, and matching JSON/JavaScript representations. A mutation test proves that a broken evidence definition is rejected.

The capability map uses each family's canonical member list and named lead. Elevated risk is the number of member records marked HIGH or CRITICAL, not a calculated incident rate. A family with two or fewer options is labeled thin coverage. These are research coverage signals, not performance or security test results. The next priority comes from the lead's recorded reentry trigger or evidence requirement.
