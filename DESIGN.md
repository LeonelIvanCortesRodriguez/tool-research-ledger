# Design system: Tool Research Ledger

## Visual theme

A research instrument with a card-catalog memory. One tool record is the unit: a slip with four fields that never merge (fit, evidence, decision, risk). The interface is cool and quiet so the berry accent can mean "you chose this" and the evidence ladder can say, unmistakably, how high the proof goes.

Color strategy: **restrained** in the product (cool neutrals, berry for action and selection), **committed** in the social preview (berry field covering about half the canvas). The berry accent and cool neutral base are the existing identity and are kept.

## Mark and wordmark

- **Mark:** the existing berry square, redrawn as a ledger slip: three horizontal rules of decreasing length, the bottom rule ending in a small step. The step is the evidence ladder in miniature. Corner radius 22% of the side. At 16px the rules become two.
- **Wordmark:** "Tool Research Ledger" in Schibsted Grotesk 700, tracking -0.01em, set on one line where width allows and stacked "Tool Research / Ledger" in a narrow format.

## Color tokens

OKLCH. The light and dark tables were tuned separately. Measured contrast in brackets.

| Role | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `--bg` | `0.982 0.003 258` | `0.155 0.009 258` | Page |
| `--surface` | `1 0 0` | `0.19 0.011 258` | Record slip |
| `--ink` | `0.19 0.016 258` [17.5:1] | `0.95 0.006 258` [16.9:1] | Text, filled evidence steps |
| `--ink-2` | `0.36 0.018 258` | `0.80 0.010 258` | Secondary text |
| `--muted` | `0.48 0.014 258` [6.2:1] | `0.69 0.012 258` [6.7:1] | Metadata only |
| `--line` | `0.86 0.008 258` | `0.32 0.015 258` | Hairline dividers (decorative) |
| `--line-strong` | `0.64 0.013 258` [3.4:1] | `0.52 0.018 258` [3.4:1] | Input borders, empty ladder steps, glyph outlines |
| `--accent` | `0.42 0.115 343` [9.0:1] | `0.72 0.12 343` [7.0:1] | Primary action, current selection, focus |
| `--stop` | `0.43 0.105 28` [8.5:1] | `0.74 0.13 28` [7.6:1] | Anything that can stop adoption: HOLD, REJECT, HIGH, CRITICAL |

`--line-strong` changes from `0.69` to `0.64` (light) and from `0.45` to `0.52` (dark) so that glyph outlines and empty ladder steps reach the 3:1 non-text minimum.

**Retired:** the six evidence hues (`--evidence-e0` to `--evidence-e5`) and the separate pilot, reference, and watch hues. They made a rainbow without adding meaning. Evidence becomes ink on a ladder; decisions become shapes. Only two hues remain meaningful: berry (your action) and stop red (a blocker).

## The four channels

Each channel has its own visual grammar so that a reader never confuses a recommendation with proof.

**Evidence: a six-step ladder.** Six ascending steps, E0 shortest. Steps up to the reached level are filled ink; the rest are `--line-strong` outlines. The E-code sits beside it in tabular figures, then the plain label ("Source reviewed"). In detail views, the next empty step carries "Next proof: a bounded task and its outcome". E0 on every record is shown honestly: one filled step and five empty ones.

**Decision: a shape plus a verb.**

| Decision | Glyph | Label in UI |
| --- | --- | --- |
| IMPLEMENT | Filled circle | Ready for bounded use |
| PILOT | Half-filled circle | Run a controlled pilot |
| CONDITIONAL | Circle with a horizontal bar | Use only with named controls |
| REFERENCE | Open ring | Study the patterns, don't install |
| WATCH | Dashed ring | Track until a trigger |
| HOLD | Filled square in `--stop` | Do not use yet |
| REJECT | Cross in `--stop` | Not suitable |

Glyphs are 14px inline SVG with `aria-hidden="true"`; the label carries the meaning for assistive technology.

**Risk: severity bars.** Four bars of rising height; LOW fills one, MEDIUM two, HIGH three, CRITICAL four. HIGH and CRITICAL fill in `--stop`, the others in ink. The word always appears beside the bars.

**Fit:** plain text, the editorial sentence. No graphic, so it can't pass for a measurement.

Weight follows importance: decision is the heaviest element on a record (16px semibold with glyph), evidence second, risk third, fit as body text.

## Typography

- **Schibsted Grotesk** (OFL, variable 400 to 900) for headings, interface, and presentation assets. Body 16px, line-height 1.55; controls 15px; metadata 14px; 12px nowhere essential.
- **Cascadia Code / system mono** only for E-codes, revisions, and identifiers.
- Scale 14 / 16 / 20 / 25 / 32 / 40 / 52px (1.25 ratio). Hero clamp(2.5rem, 5.5vw, 3.75rem), letter-spacing -0.02em, `text-wrap: balance`.
- Prose capped at 70ch. Uppercase appears only in decision and risk values, which are literal catalog values.
- The live page self-hosts a Latin woff2 subset with `font-display: swap`; Aptos and Segoe UI remain the fallback.

## Layout

- First fold, in order: wordmark and promise, the search box with one example query, the decision path figure (`need → candidates → evidence → decision`), and the honest ceiling ("99 tools · 13 families · every entry source-reviewed (E0)").
- One record anatomy figure explains the four channels once. After that the interface uses them without re-explaining.
- The current "How this helps" side card with three equal steps is removed. Its job moves into the path figure.
- Common jobs stay as buttons, but in a two-column list with unequal emphasis (job name 16px semibold, hint 14px), not an icon-card grid.
- Gutters 24px desktop, 16px mobile; shell up to 1480px; detail panels never narrower than 360px.

## Diagram language

- **Decision path:** four stations left to right. The candidate set narrows visibly (99 → matching → compared) and the last station is a decision glyph with its verb. Under it a thin rail shows the ladder E0 to E5, with E0 filled and the text "Project trials move an entry up. None has moved yet."
- **Promotion path:** E0 → E1 needs "task, version, input, result, checks, limitations" listed as the six things a trial must preserve.
- SVG with `<title>` and `<desc>`; a text equivalent sits directly under every figure in the README.
- Counts in figures are generated from `data/catalog.json` by the asset script, never typed.

## Media treatment

- **README hero:** light and dark PNGs through `<picture>`: wordmark, promise, and the record anatomy figure built from a real catalog entry. No interface screenshot in the hero.
- **Social preview:** 1280 × 640. Berry field on the left half carrying the mark and wordmark in white; right half shows the ladder and the three decision glyphs with labels on the light surface.
- **Demonstration:** 15 to 20 second recording of one complete job: type "turn scanned PDFs into reliable data", see the shortlist, compare two tools, open evidence, read the decision basis and next test. GIF for README (under 3MB, 960px), MP4 for Pages.
- **Product views:** four annotated captures (search result, comparison, evidence detail, capability map). Annotations sit outside the capture and name the point ("same job, two tools, different permission").

## Motion

- Existing Web Animations only: filter changes reorder with a 180ms ease-out-quart; the evidence ladder fills step by step once on open (40ms stagger).
- `prefers-reduced-motion` removes movement; all states are drawn immediately.
- Nothing is hidden waiting for an animation to run.

## Do

- Show E0 as a ceiling in every summary.
- Pair each glyph with its word.
- Derive every count at build time from the catalog.

## Don't

- Rainbow badges, star counts, ranking numbers, or medals.
- Equal KPI tiles or icon-card grids.
- Gradient text, glass, or radii above 12px.
- A recommendation and its evidence in the same color or shape.
