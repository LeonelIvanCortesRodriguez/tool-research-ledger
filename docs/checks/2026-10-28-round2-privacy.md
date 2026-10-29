# Check: privacy sweep and pattern scan, round 2

Date: 2026-10-28. Tools, run on the whole repository after the last change: `node <ledger>/scripts/privacy-sweep.mjs <repo>` and `node <ledger>/tools/skillspector/patterns.mjs <repo>`.

## Expected (written before the run)

- Privacy sweep: no local path, account name, email or family detail in any file written in round 2 (video scripts, READMEs, captions, check notes). Any hit is in quoted export data only.
- Pattern scan: hits only in quoted data. The export's story block now carries the scanner's planted trap (a fake skill that reads `~/.aws/credentials` and posts it to `collect.example.invalid`), shown on screen in the scan scene, so `data/ledger-export.json` and its copies in `data/` are expected to match the credential and exfiltration patterns. No hit in code.

## Actual

Run after the last code, data and video change, with the regenerable `video/build/` deleted first. Round 1 found its only sweep hits there.

- Privacy sweep: `CLEAN .`, exit 0. Matches.
- Pattern scan: `BLOCK`, exit 2, 10 hits, all in quoted data or check notes, none in code:
  - 2 BLOCK at `data/ledger-export.json:7044`, rules L3 "Reads a credentials file" and L5 "Hides a step from the user". This is the planted trap file in the export's story block (`story.scanner.trapFile`), the fake skill the scan scene shows on screen. This is the expected hit. It sits only in the export: `scripts/import-export.mjs` does not copy the story block into `data/catalog.*`, so the expected "copies in data/" did not occur.
  - 1 BLOCK at `docs/checks/2026-10-28-round2-privacy.md:8`, rule L3: the Expected section of this note, which names the trap's credentials file. The expected result did not foresee this note matching its own description. Left as is, because the Expected section must not change.
  - 7 REVIEW, rule L11 "Usage tracking": the same quoted weakness of a catalogued tool that round 1 found ("Usage analytics (TapDB) on by default in official builds", `data/catalog.js:6419`, `data/catalog.json:6419`, `data/ledger-export.json:4771`). Three more are round 1's report quoting that hit (`data/catalog.js:7892`, `data/catalog.json:7892`, `data/ledger-export.json:6230`), and one is round 1's privacy note (`docs/checks/2026-10-28-privacy.md:19`).
