# Check: story video loudness, round 2

Date: 2026-10-28. Tool: FFmpeg's EBU R128 `loudnorm` filter, measuring only (`node video/loudness.mjs <file>`).

## Expected (written before the run)

Input: `docs/video/story-en.mp4` and `docs/video/story-es.mp4`. Each carries the voice with the music bed ducked under it, normalized by `video/assemble.mjs` with two-pass `loudnorm` (target -16 LUFS, true peak -1.5 dBTP), then encoded to AAC 160 kb/s by `video/finish.mjs`. HyperFrames renders the frames only.

- Both files: integrated loudness between -17.0 and -15.0 LUFS (target -16 within 1 LU).
- True peak at or below -1.0 dBTP.
- The command prints `PASS` for both files and exits 0.
- Length, from the same timing: about 2:50 to 3:00 in English and 3:00 to 3:15 in Spanish, close to Leonel's story video (2:54 and 3:08), since the lines are the same and only some numbers changed.

## Actual

`node video/loudness.mjs docs/video/story-en.mp4 docs/video/story-es.mp4`, exit 0:

```
PASS story-en.mp4 -16.5 LUFS (target -16 within 1 LU), true peak -1.28 dBTP
PASS story-es.mp4 -17.0 LUFS (target -16 within 1 LU), true peak -1.38 dBTP
```

- Both pass, and both true peaks are below -1.0 dBTP.
- Spanish sits on the lower edge of the range. `video/assemble.mjs` already measured the Spanish mix at -17.0 LUFS before the encode, so the gap comes from the linear loudnorm pass stopping at the -1.5 dBTP peak limit, not from the encode. Round 1 saw the same effect at -16.7.
- Length: 2:56 (175.87 s) in English and 3:09 (188.73 s) in Spanish, inside the expected ranges.
- The first full render of this round never ran: HyperFrames' check stopped it because the composition used Schibsted Grotesk without an `@font-face`. The fix added the declaration to `video/story-template.html`. A second render then showed the 21 working-tool names running past the bottom edge in two columns; they were moved to three columns, and both languages were rendered again. These numbers come from that third render.
