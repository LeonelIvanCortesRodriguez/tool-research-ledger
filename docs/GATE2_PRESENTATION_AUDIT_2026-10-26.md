# Gate 2 presentation audit

Date: 2026-10-26

Role: independent auditor. This report did not author or amend the three Gate 2 candidate commits.

## Subjects

The exact multi-repository subject is recorded in `docs/GATE2_CANDIDATE_INVENTORY_2026-10-26.txt`, SHA-256 `0b3b66732584f3cb6c9f8b68b5c252dee0ed901053e8e1dbf518a9b37ba0d084`.

- Tool Research Ledger: `ba31159537a2c795e925620342371c8a68080354`
- Local AI Workcell: `4e36b44806663af2f1143da22622728716b2c0fd`
- Finanzas Familiares Demo: `1c0761e05acc93dd3499fcd7e9c6bb9134275ebb`

The Tool Research Ledger subject is the checkout named `tool-research-ledger-catalog-20261026`. A second checkout named `tool-research-ledger` is not this subject and was dirty during the audit. Exact local roots belong in the private coder handoff, not in a publication candidate.

## Proofs executed

### Tool Research Ledger

Working directory: the `tool-research-ledger-catalog-20261026` subject checkout.

Command: `npm run verify`

Result: exit 0. Static validation reported 99 tools, 13 capability families, and six evidence levels. Mutation, prose, browser, privacy, and build checks passed. The build reported ZIP SHA-256 `c831de44e15fb5f3952d72c7d4fd2bb288be4de3c4f586dc668b37a1539b39e9` and inventory SHA-256 `510858b23771d2506056c74f0bd53bb14b337e40f003df7dea2920f0b6d54bd1`.

Independent catalog count: 99 unique repository URLs; 29 PILOT, 23 CONDITIONAL, 22 REFERENCE, 10 HOLD, 8 REJECT, 7 WATCH, 0 IMPLEMENT; all 99 entries at E0.

### Local AI Workcell

Working directory: the `local-ai-workcell` subject checkout.

Commands:

- `python -m unittest discover -s tests -v`
- `python tests/mutation_check.py`
- `python scripts/privacy_scan.py`

Result: exit 0. Thirteen tests passed, three Tesseract and loopback integration tests were skipped, the checksum mutation was detected, and the privacy scan found no findings in 30 text files. The retained v0.2 sample report was inspected but the v0.2 integration run was not reproduced in this audit.

### Finanzas Familiares Demo

Working directory: the `finanzas-familiares-demo` subject checkout.

Commands:

- `npm run verify`
- `npm run build`

Result: exit 0. Verification reported 52 rows, 49 accepted rows, five review items, and one of two statements reconciled. Eight tests, mutation checks, privacy scan, and build passed. The build reported ZIP SHA-256 `3d6a9c517de1d81d2a96ce3aa6d00f81c53fedf444586f94a55e25093e32c121`.

### Contrast recomputation

The documented OKLCH values were independently converted to linear sRGB and measured with the WCAG 2.x contrast formula. The Ledger and Finanzas named pairs met their documented minimums, allowing for small rounding differences. Workcell's dark-theme `--ink` against `--boundary` measured 1.41:1, not the documented 11.5:1.

## Requirement dispositions

| ID | Requirement | Disposition | Evidence |
| --- | --- | --- | --- |
| R1 | Exact Gate 2 commits exist, contain only the intended product and design context changes, and are clean | PROVEN | Git identities, commit diffs, and clean status for the three exact roots |
| R2 | Each repository has a distinct product story and visual direction | PROVEN | Three separate promises, physical scenes, palettes, type systems, marks, diagrams, and evidence boundaries |
| R3 | Counts and evidence claims are traceable to repository data or tests | PROVEN with limitation | Ledger and Finanzas counts reproduced; Workcell base tests reproduced; retained v0.2 report inspected but integration run skipped |
| R4 | Every documented text and non-text token pairing satisfies the stated WCAG threshold | VIOLATED | Workcell dark ink on boundary is 1.41:1 |
| R5 | Gate 3 is routed correctly for both recruiter-facing brand surfaces and product UI | VIOLATED | All three `PRODUCT.md` files use the product register and do not state the required brand override for README, social-preview, and portfolio landing surfaces |
| R6 | Public promises stay within implemented input and evidence boundaries | VIOLATED | Finanzas promises to turn a household bank export into reliable figures, while the public demo accepts only its bundled fictional sample |
| R7 | Skill evidence changes only when a bounded task, exact skill identity, outcome, checks, and limitations are retained | UNPROVEN | The response identifies Impeccable use and an update notice, but no exact v3.5.0 skill hash or invocation record was retained |
| R8 | No publication or mid-run skill upgrade occurred | PROVEN within local evidence | Candidate branches are ahead of existing `origin/main` refs and no remote ref contains the candidate commits; Impeccable was not updated. No network fetch was performed for this audit. |

## Findings

### G2-ID-001: ambiguous Ledger checkout

Disposition: BLOCKER

The response named Ledger commits but omitted the absolute checkout root. Two similarly named Ledger checkouts exist, and the non-subject checkout was dirty. Gate 3 could otherwise modify or audit the wrong tree.

Correction: carry the three exact roots and commits from the candidate inventory into the coder handoff before Gate 3.

### G2-REG-002: presentation surfaces have no brand-register route

Disposition: BLOCKER

The final objective is a recruiter-facing presentation, but every `PRODUCT.md` declares only `product`. The application UI is a product surface; the README hero, social preview, and portfolio landing page are brand surfaces.

Correction: keep the application route explicit and add a surface rule stating that README, social-preview, and portfolio work must load the brand register, while app and dashboard work must load the product register.

### G2-A11Y-003: Workcell dark boundary contrast is incorrect

Disposition: BLOCKER

`local-ai-workcell/DESIGN.md` claims 11.5:1 for dark-theme text on the yellow boundary. The documented dark `--ink` and `--boundary` values produce 1.41:1. The same document says the boundary is fill-only but later places text on the boundary, so implementation intent is ambiguous.

Correction: define a dedicated dark-on-yellow `--boundary-ink` token or keep text outside the yellow fill. Retain the contrast script in the repository and make it test every named foreground/background pair.

### G2-CLAIM-004: Finanzas promise exceeds the public input surface

Disposition: BLOCKER

The promise says the demo turns a household bank export into reliable figures. The repository documents a bundled fixed-seed fictional sample and no arbitrary import surface.

Correction: make the promise explicitly describe the fictional demonstration, or implement and test the broader import before claiming it.

### G2-SKILL-005: Impeccable evidence is promising but incomplete

Disposition: DEBT

The three pairs of `PRODUCT.md` and `DESIGN.md` show practical value from structured product context: the projects now have distinct stories, evidence boundaries, anti-references, media plans, and implementation rules. The false contrast claim also shows that generated design specifications still need independent calculation and browser validation.

The response reports Impeccable v3.5.0 and an available v4.8.0 update. The exact v3.5.0 instruction bytes were not retained in the candidate evidence, and the currently visible local skill metadata does not establish that version. Do not update the skill during this candidate cycle. Freeze the version used for Gate 2, finish the trial, then assess v4.8.0 as a separate controlled change.

Evidence recommendation: treat Impeccable as an E1 candidate after the exact skill identity is recorded, the four blockers are corrected, and the final visual result is independently audited. The public catalog remains E0 in this audit.

### G2-SKILL-006: no evidence change for the other named skills

Disposition: DEBT

- The Ledger's `humanizer-check.mjs` passed, but that proves the project prose gate, not execution of the external Humanizer skill.
- No retained Spec Kit plan or generated task artifact was supplied.
- No new SkillSpector scan artifact was supplied.
- Similarity between the design documents and other design references does not prove those skills ran.

Humanizer, GitHub Spec Kit, NVIDIA SkillSpector, Emil Kowalski Skills, Taste Skill, GSAP Skills, and Awesome DESIGN.md therefore remain at their current public evidence levels.

### G2-FONT-007: font licensing remains a Gate 3 admission check

Disposition: DEBT

No font binaries or license files are present in the Gate 2 commits. Before vendoring fonts, record the exact source revision, include the applicable OFL text and attribution, subset only when the license permits it, and verify that no runtime request leaves the site.

## Skill value conclusion

Impeccable added material value at the planning layer. It forced a product promise, audience, anti-references, accessibility targets, and a distinct visual grammar for each repository. It did not prove implementation quality, and one of its quantitative claims failed independent review. Its decision should remain CONDITIONAL for this workflow until the corrected Gate 3 build passes a fresh visual audit.

The available update should not be installed mid-run. A version change would mix two instruction sets inside one trial and make the result hard to attribute.

## Decision

REJECTED for Gate 3 entry in the current form. Gate 2 is close, but R4, R5, and R6 are violated and the exact checkout ambiguity must be removed from the handoff. Apply one consolidated documentation correction, rerun the contrast check and repository proofs, then request the single correction review. No final 90-point visual grade is possible before Gate 3 assets and app changes exist.

`MAP Gate 2 product and design context → ACCEPTED INVENTORY GATE2_CANDIDATE_INVENTORY_2026-10-26.txt sha256:0b3b66732584f3cb6c9f8b68b5c252dee0ed901053e8e1dbf518a9b37ba0d084 + R1,R2,R3,R8 → DELTA docs/GATE2_PRESENTATION_AUDIT_2026-10-26.md → BLOCKERS G2-ID-001,G2-REG-002,G2-A11Y-003,G2-CLAIM-004 → UNLOCK one consolidated documentation correction plus retained contrast proof → NEXT coder correct Gate 2 subjects`
