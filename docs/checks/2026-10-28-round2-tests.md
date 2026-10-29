# Check: full test run, round 2 (`npm run verify`)

Date: 2026-10-28. Run after the last code, data, video and README change on branch `gate6-round2`.

## Expected (written before the run)

- `npm test`: `VERIFY_OK tools=125 graded=22 uses=85 groups=14 evidence=6` (the round 2 export adds 11 uses to the 74 of round 1).
- `npm run test:mutation`, `test:contrast` and `test:prose` pass as in round 1; the prose check also covers the rewritten READMEs and the new caption line.
- `npm run test:browser`: `BROWSER_QA_OK` at 1440 and 390 px. The story section shows the new video, one caption track and the script list, and the Spanish switch sets the script to `lang="es"`.
- `npm run scan:privacy` and `npm run build` pass.
- Exit 0 for the whole chain.

## Actual
