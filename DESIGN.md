# Design system

## Direction

An evidence ledger with a job-first entry and a compact capability map. The map is a reading aid, while the search and tool details remain the working controls. Preserve the existing cool neutral and berry accent identity.

## Typography and density

Use the existing Aptos/Segoe system stack and Cascadia/Consolas for short identifiers. Body copy is normally at least 16px; support text at least 14px; 12px is reserved for nonessential metadata. Cap prose at roughly 70 characters per line. Use fixed, calm type steps for controls and avoid extreme negative tracking.

## Tokens

`styles.css` defines independent light and dark OKLCH tokens for background, surface, ink, line, accent, semantic states, and evidence levels. Both themes must retain AA contrast. Recommendation states use labeled shape and action wording; evidence uses the E-code and segmented meter; risk uses explicit text and a separate severity cue. The berry accent is for primary action and selection, not a category rainbow.

## Spacing and layout

Use the existing shell up to 1480px, with 24px minimum desktop gutters and 16px minimum mobile gutters. Major sections use deliberate spacing; tables may be dense, but the opening view must not bury the decision. Avoid nested cards and repeated equal-weight KPI panels.

## Information graphic

The primary capability map comes from the canonical catalog at runtime. Rows name each family, show option count, the leading current decision/evidence, risk concentration, and the next research action. It must have an accessible name and readable row text. It is a navigational summary, not a benchmark chart. Counts, search, filters, and share state all derive from the same catalog.

## Motion and interaction

Use existing Web Animations only where state change benefits from feedback. Do not animate content into visibility. Respect `prefers-reduced-motion`. Keyboard focus must be visible; controls have 44px minimum height where practical. Shared URLs restore the job, query, and selected tool.

## Responsive behavior

At 1440x900 and 1366x768, the job and portfolio state must be comprehensible without hunting through the full ledger. At 1024x768, the map may scroll vertically but must not overflow horizontally. At 390x844, rows stack with preserved labels and actions, and navigation remains reachable.

## Rejected patterns

No decorative metrics, rainbow status colors, identical tool cards, miniature diagram text, hover-only facts, fake proof, or copying the owner-supplied diagram's mascot style.
