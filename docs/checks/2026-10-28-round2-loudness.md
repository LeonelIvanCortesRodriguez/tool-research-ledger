# Check: story video loudness, round 2

Date: 2026-10-28. Tool: FFmpeg's EBU R128 `loudnorm` filter, measuring only (`node video/loudness.mjs <file>`).

## Expected (written before the run)

Input: `docs/video/story-en.mp4` and `docs/video/story-es.mp4`. Each carries the voice with the music bed ducked under it, normalized by `video/assemble.mjs` with two-pass `loudnorm` (target -16 LUFS, true peak -1.5 dBTP), then encoded to AAC 160 kb/s by `video/finish.mjs`. HyperFrames renders the frames only.

- Both files: integrated loudness between -17.0 and -15.0 LUFS (target -16 within 1 LU).
- True peak at or below -1.0 dBTP.
- The command prints `PASS` for both files and exits 0.
- Length, from the same timing: about 2:50 to 3:00 in English and 3:00 to 3:15 in Spanish, close to Leonel's story video (2:54 and 3:08), since the lines are the same and only some numbers changed.

## Actual
