# Check: on-screen words after the render, round 2 (ledger-watch `frames`)

Date: 2026-10-28. Tool: Leonel's ledger-watch, run as a tool (`node <ledger>/scripts/watch/watch.mjs frames <video.mp4> <timing.json>`). It takes one frame 0.9 s after each sentence starts and reads it with PaddleOCR, offline.

## Expected (written before the run)

Input: `docs/video/story-en.mp4` with `video/build/en/timing.json`, and `docs/video/story-es.mp4` with `video/build/es/timing.json`. 32 headlines each.

- English: `ON SCREEN PASS: 32 of 32 headlines read`.
- Spanish: `ON SCREEN PASS: 32 of 32 headlines read`.
- The title card reads `LEONEL CORTÉS · EVIDENCE-LED TOOL RESEARCH` (English) or `LEONEL CORTÉS · INVESTIGACIÓN DE HERRAMIENTAS CON PRUEBAS` (Spanish), and the approval line in the loop scene names Leonel. Checked by eye on a frame from each scene, since OCR only compares the headlines.
- Weakest spots, if any fail: w1 and w2, where tool names flash under the headline during the montage; the grade codes (OCR may read a zero as the letter O); and w4, where the three question pills sit below the headline.

## Actual

`node <ledger>/scripts/watch/watch.mjs frames docs/video/story-<lang>.mp4 video/build/<lang>/timing.json`, on the final render:

- English: `ON SCREEN PASS: 32 of 32 headlines read`, exit 0. Matches.
- Spanish: `ON SCREEN PASS: 32 of 32 headlines read`, exit 0. Matches. None of the weak spots named above failed.
- By eye: the title card reads `LEONEL CORTÉS · EVIDENCE-LED TOOL RESEARCH` in English and `LEONEL CORTÉS · INVESTIGACIÓN DE HERRAMIENTAS CON PRUEBAS` in Spanish (this frame is also the poster). The loop scene shows `Approved by Leonel · 2026-10-28` and `Aprobada por Leonel · 2026-10-28`. Frames from every scene were also looked at: world, grade, scan (the planted trap file, the two BLOCKED cards), proof (the FFmpeg meter, 21 working tools), loop, fit and result. An earlier render had the 21 working-tool names running past the bottom edge in two columns. They now sit in three columns, and nothing is clipped.
