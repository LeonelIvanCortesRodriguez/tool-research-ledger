# Check: on-screen words after the render, round 2 (ledger-watch `frames`)

Date: 2026-10-28. Tool: Leonel's ledger-watch, run as a tool (`node <ledger>/scripts/watch/watch.mjs frames <video.mp4> <timing.json>`). It takes one frame 0.9 s after each sentence starts and reads it with PaddleOCR, offline.

## Expected (written before the run)

Input: `docs/video/story-en.mp4` with `video/build/en/timing.json`, and `docs/video/story-es.mp4` with `video/build/es/timing.json`. 32 headlines each.

- English: `ON SCREEN PASS: 32 of 32 headlines read`.
- Spanish: `ON SCREEN PASS: 32 of 32 headlines read`.
- The title card reads `LEONEL CORTÉS · EVIDENCE-LED TOOL RESEARCH` (English) or `LEONEL CORTÉS · INVESTIGACIÓN DE HERRAMIENTAS CON PRUEBAS` (Spanish), and the approval line in the loop scene names Leonel. Checked by eye on a frame from each scene, since OCR only compares the headlines.
- Weakest spots, if any fail: w1 and w2, where tool names flash under the headline during the montage; the grade codes (OCR may read a zero as the letter O); and w4, where the three question pills sit below the headline.

## Actual
