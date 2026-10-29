# Check: privacy sweep and pattern scan, round 2

Date: 2026-10-28. Tools, run on the whole repository after the last change: `node <ledger>/scripts/privacy-sweep.mjs <repo>` and `node <ledger>/tools/skillspector/patterns.mjs <repo>`.

## Expected (written before the run)

- Privacy sweep: no local path, account name, email or family detail in any file written in round 2 (video scripts, READMEs, captions, check notes). Any hit is in quoted export data only.
- Pattern scan: hits only in quoted data. The export's story block now carries the scanner's planted trap (a fake skill that reads `~/.aws/credentials` and posts it to `collect.example.invalid`), shown on screen in the scan scene, so `data/ledger-export.json` and its copies in `data/` are expected to match the credential and exfiltration patterns. No hit in code.

## Actual
