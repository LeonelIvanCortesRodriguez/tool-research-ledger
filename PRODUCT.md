# Product

## Register

product

## Surface registers

The default register above governs the ledger application (`index.html`, `app.js`, `styles.css`). Work on that surface loads Impeccable's product reference (`reference/product.md`).

The README hero, GitHub social preview, demonstration recordings, and any portfolio landing page are brand surfaces. Work on those loads the brand reference (`reference/brand.md`), and brand permissions (committed or drenched color, display type, art direction) apply only there. Brand surfaces still keep every claim and evidence boundary in this file.

## Product promise

Describe a job and see which open-source tools fit it, what has been checked about each one, and what you are allowed to do with it next.

## Users

Technical directors and project owners choosing an open-source tool for a defined job, and hiring managers judging how Leonel makes evidence-based decisions. Both are short on time. The director wants a shortlist with its weak points showing; the hiring manager wants to see the reasoning, not a list of stars.

## Problem

Repository lists rank tools by popularity. They do not say whether a tool fits a particular job, what anyone has actually checked, or what could still stop adoption. Teams then install on the strength of a README and discover the risk later.

## The decision path

`project need → filtered candidates → evidence → decision`

1. **Project need.** Plain-language search or one of eight common jobs.
2. **Filtered candidates.** Matching tools from the 13 capability families, with comparison between similar options.
3. **Evidence.** The level reached (E0 to E5), what produced it, and what proof the next level needs.
4. **Decision.** The permitted next action, its basis, its controls, and the next test.

## Decision vocabulary

Fit, evidence, decision, and risk answer four separate questions and must never merge into one score.

| Channel | Question it answers | Values |
| --- | --- | --- |
| Fit | How closely does the tool map to the job? | Editorial assessment |
| Evidence | What has been checked? | E0 source reviewed · E1 smoke task · E2 controlled benchmark · E3 representative corpus · E4 independent validation · E5 monitored production |
| Decision | What may we do now? | IMPLEMENT · PILOT · CONDITIONAL · REFERENCE · WATCH · HOLD · REJECT |
| Risk | What can still stop adoption? | LOW · MEDIUM · HIGH · CRITICAL |

## Evidence status

- **Implemented and tested:** search, guided jobs, capability map, filters and sorting, comparison, evidence detail, shareable URL state, and catalog validation (unique IDs and URLs, 99-repository reconciliation, matching JSON and JS). `npm run verify` covers static checks, mutation, prose, browser QA, privacy, and build.
- **Graded from recorded use:** 22 of 125 tools are above E0 (16 at E1, 6 at E2); the other 103 are E0, only read about. Grades come from the owner's export and a person approves every change.
- **Planned:** project trials that preserve task, version, input, result, checks, and limitations. Only a retained trial can move an entry to E1 or above. No public entry has been promoted yet, and the presentation must show promotion as a path, not an achievement.
- **Unsupported, never claim:** benchmark scores, safety certification, operational benefit of any listed tool.

## Leonel's contribution

Leonel defined the product goal, set the research and acceptance criteria, curated the repository summaries, and made the final decisions on each record. Coding agents helped implement the interface, tests, evidence rules, and release package.

## Five-second test

A reader should leave the first screen knowing: "It is a searchable decision ledger for open-source tools. It separates what fits from what is proven. Everything in it is source-reviewed only, and I can try it live."

## Brand personality

Precise, candid, decision-oriented. A research instrument with a librarian's honesty: it tells you what it knows, how it knows it, and what it does not know yet.

## Anti-references

- "Awesome list" pages: badge walls, star counts, emoji category headers.
- Rankings or leaderboards that imply a measured winner.
- Rainbow category colors and equal KPI cards.
- Diagrams in which a recommendation and its evidence look interchangeable.
- A dashboard screenshot as the hero. The interactive ledger is the proof; stills only support it.

## Design principles

1. **Start with the job.** Breadth appears only where it changes a decision.
2. **Four channels, four visual languages.** Decision, evidence, and risk differ in shape, label, and weight, never in color alone.
3. **Show where grades come from.** Recorded use in named projects, approved by a person, is stated on the first screen, and so is what E0 means.
4. **Count from the catalog.** Every number on every surface derives from `data/catalog.json`.
5. **Name the next proof.** Each decision ends with what would change it.

## Accessibility & inclusion

WCAG 2.2 AA for text and controls in both themes, full keyboard use, visible focus, 44px targets where practical, named diagrams with text equivalents, reduced motion, and usable widths from 390px to 1440px. No status depends on color alone.
