# Check: spoken words before the render (ledger-watch `words`)

Date: 2026-10-28. Tool: Leonel's ledger-watch, run as a tool (`node <ledger>/scripts/watch/watch.mjs words <narration.json>`).

## Expected (written before the run)

Input: `video/build/narration.es.json` and `video/build/narration.en.json`, written by `video/story.mjs` from `data/catalog.json`. 16 lines each.

- Spanish: `SPOKEN WORDS PASS` with no flagged word. The Spanish lines name no tool and use Spanish number words, so no English spelling should reach the voice. Tool names (Kokoro TTS, PaddleOCR, Tesseract OCR, NVIDIA SkillSpector, Tool Research Ledger) appear only in the on-screen text.
- English: `SPOKEN WORDS PASS (Only Spanish narration is checked (got en-us))`, since the check reads Spanish only.

## Actual

- Spanish: `SPOKEN WORDS PASS`, exit 0, no flagged word. Matches.
- English: `SPOKEN WORDS PASS (Only Spanish narration is checked (got en-us))`, exit 0. Matches.
