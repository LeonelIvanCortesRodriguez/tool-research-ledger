// Story video: rebuild everything from data/ledger-export.json in one go.
// Usage: node video/build.mjs [en|es] [--render]
//   1. story.mjs writes the facts and the narration
//   2. say.py records the narration with the local Kokoro voice (offline)
//   3. assemble.mjs times the scenes to the voice and writes the composition
//   4. with --render: HyperFrames renders the frames and finish.mjs adds the voice, captions and poster
// The tools live outside this repository; point at them with environment variables:
//   LEDGER_VOICE_PYTHON  Python with kokoro-onnx     LEDGER_SAY  say.py
//   LEDGER_HYPERFRAMES   hyperframes.mjs             LEDGER_GSAP gsap.min.js (HyperFrames ships one)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BUILD, ROOT } from "./story.mjs";

const lang = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "en";
const render = process.argv.includes("--render");
const need = (name) => { const value = process.env[name]; if (!value || !fs.existsSync(value)) throw new Error(`Set ${name} (see video/build.mjs)`); return value; };
// Telemetry off; cloud credentials are not passed to the render.
const env = { ...process.env, DO_NOT_TRACK: "1", HYPERFRAMES_NO_TELEMETRY: "1" };
for (const key of Object.keys(env)) if (/^(AWS_|HEYGEN)/i.test(key)) delete env[key];
const run = (file, args, cwd = ROOT) => execFileSync(file, args, { cwd, env, stdio: "inherit" });

run(process.execPath, ["video/story.mjs", lang]);
const say = need("LEDGER_SAY");
run(need("LEDGER_VOICE_PYTHON"), ["-I", say, path.join(BUILD, `narration.${lang}.json`), path.join(BUILD, `voice-${lang}`)], path.resolve(path.dirname(say), "..", ".."));
run(process.execPath, ["video/assemble.mjs", lang]);
const hyperframes = need("LEDGER_HYPERFRAMES");
run(process.execPath, [hyperframes, "check"], path.join(BUILD, lang));
if (render) {
  run(process.execPath, [hyperframes, "render", "-o", "frames.mp4"], path.join(BUILD, lang));
  run(process.execPath, ["video/finish.mjs", lang]);
}
