# Check: spoken words before recording, round 2 (ledger-watch `words`)

Date: 2026-10-28. Tool: Leonel's ledger-watch, run as a tool (`node <ledger>/scripts/watch/watch.mjs words <narration.json>`).

## Expected (written before the run)

Input: `video/build/narration.es.json` and `video/build/narration.en.json`, written by `video/story.mjs` from the story block of `data/ledger-export.json`. 32 lines each, in seven scenes: world, grade, scan, proof, loop, fit, result.

- Spanish: `SPOKEN WORDS PASS` with no flagged word. Numbers are Spanish number words, FFmpeg is spelled for the voice as "Efe efe eme peg" (final g is allowed), and the last line says "nuestro registro de herramientas" instead of the English name. Tool names stay on screen only.
- English: `SPOKEN WORDS PASS (Only Spanish narration is checked (got en-us))`, since the check reads Spanish only.

## Actual

`node <ledger>/scripts/watch/watch.mjs words video/build/narration.es.json` and `... narration.en.json`, run before recording:

- Spanish: `SPOKEN WORDS PASS`, exit 0, no flagged word. Matches.
- English: `SPOKEN WORDS PASS (Only Spanish narration is checked (got en-us))`, exit 0. Matches.
