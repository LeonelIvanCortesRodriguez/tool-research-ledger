// Story video, step 4: put the -16 LUFS voice under the rendered frames, then write the captions, the poster and
// data/story-script.js (captions and script for the page, WCAG 2.2 1.2.2).
// Usage: node video/finish.mjs [en|es]
// Reads video/build/<lang>/frames.mp4 and timing.json, and video/build/voice-<lang>.wav. Writes docs/video/story-<lang>.mp4,
// captions-<lang>.vtt and story-poster-<lang>.jpg.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { BUILD, ROOT } from "./story.mjs";
import { loudness } from "./loudness.mjs";

const lang = process.argv[2] || "en";
const dir = path.join(BUILD, lang);
const outDir = path.join(ROOT, "docs", "video");
fs.mkdirSync(outDir, { recursive: true });
const timing = JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8"));
const video = path.join(outDir, `story-${lang}.mp4`);
// Frames re-encoded small for the repository; the voice replaces any audio in the render.
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(dir, "frames.mp4"), "-i", path.join(BUILD, `voice-${lang}.wav`), "-map", "0:v:0", "-map", "1:a:0",
  "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-shortest", "-movflags", "+faststart", video]);
const poster = path.join(outDir, `story-poster-${lang}.jpg`);
execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(timing.lines.r2.start + 2), "-i", video, "-frames:v", "1", "-q:v", "4", poster]);
const measured = loudness(video);

const stamp = (seconds) => {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
};
const entries = Object.values(timing.lines);
const vtt = `WEBVTT\n\n${entries.map((line, index) => `${index + 1}\n${stamp(line.start)} --> ${stamp(Math.max(line.end + 0.3, Math.min(entries[index + 1]?.start ?? timing.total, line.end + 1)))}\n${line.text}\n`).join("\n")}`;
fs.writeFileSync(path.join(outDir, `captions-${lang}.vtt`), vtt);

// The page reads captions and the script from one data file, so they also work when opened from disk.
const scriptFile = path.join(ROOT, "data", "story-script.js");
const all = fs.existsSync(scriptFile) ? JSON.parse(fs.readFileSync(scriptFile, "utf8").replace(/^window\.STORY_SCRIPT = /, "").replace(/;\s*$/, "")) : {};
const minutes = `${Math.floor(timing.total / 60)}:${String(Math.round(timing.total % 60)).padStart(2, "0")}`;
all[lang] = {
  video: `docs/video/story-${lang}.mp4`, poster: `docs/video/story-poster-${lang}.jpg`, total: timing.total,
  caption: lang === "es" ? `${minutes} con subtítulos: cómo una herramienta gana E1 y E2 aquí, con cifras reales de los datos.` : `${minutes} with captions: how a tool earns E1 and E2 here, with real numbers from the data.`,
  lines: entries.map((line) => ({ start: line.start, text: line.text })), vtt
};
fs.writeFileSync(scriptFile, `window.STORY_SCRIPT = ${JSON.stringify(all, null, 2)};\n`);
const size = (fs.statSync(video).size / 1e6).toFixed(1);
console.log(`${lang}: docs/video/story-${lang}.mp4 ${size} MB, ${timing.total} s, loudness ${Number(measured.input_i).toFixed(1)} LUFS, true peak ${measured.input_tp} dBTP`);
