// Story video, step 2: time each line to the recorded voice, write the narration track at -16 LUFS and the
// HyperFrames composition from video/story-template.html.
// Usage: node video/assemble.mjs [en|es]
// Reads video/build/facts.json, narration.<lang>.json and voice-<lang>/manifest.json (from say.py).
// Writes video/build/<lang>/index.html, compositions/story.html and timing.json, and video/build/voice-<lang>.wav.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { BUILD, ROOT, SCENES } from "./story.mjs";
import { loudness } from "./loudness.mjs";

const lang = process.argv[2] || "en";
const LEAD = 0.8, GAP_IN = 0.6, GAP_SCENE = 1.4, TAIL = 3.5, RATE = 48000;
const read = (file) => JSON.parse(fs.readFileSync(path.join(BUILD, file), "utf8"));
const facts = read("facts.json");
const narration = read(`narration.${lang}.json`);
const voiceDir = path.join(BUILD, `voice-${lang}`);
const manifest = JSON.parse(fs.readFileSync(path.join(voiceDir, "manifest.json"), "utf8"));
const spoken = new Map(manifest.lines.map((line) => [line.id, line]));
for (const line of narration.lines) if (spoken.get(line.id)?.text !== line.text) throw new Error(`${line.id}: the recording does not match the narration; run say.py again`);

// 16-bit PCM WAV, read chunk by chunk so a longer header does not shift the samples.
function readWav(file) {
  const buf = fs.readFileSync(file);
  let offset = 12, format = null, data = null;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4), size = buf.readUInt32LE(offset + 4);
    if (id === "fmt ") format = { channels: buf.readUInt16LE(offset + 10), rate: buf.readUInt32LE(offset + 12), bits: buf.readUInt16LE(offset + 22) };
    if (id === "data") data = buf.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  if (!format || !data || format.bits !== 16 || format.channels !== 1) throw new Error(`${file}: expected 16-bit mono PCM`);
  return { rate: format.rate, samples: new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length)) };
}
function writeWav(file, samples, rate) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + samples.length * 2, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(samples.length * 2, 40);
  fs.writeFileSync(file, Buffer.concat([header, Buffer.from(samples.buffer, samples.byteOffset, samples.length * 2)]));
}

// Timing: a short pause after each sentence, a longer one between scenes.
const takes = narration.lines.map((line) => ({ ...line, ...readWav(path.join(voiceDir, spoken.get(line.id).file)) }));
const rate = takes[0].rate;
let at = LEAD;
const lines = {};
takes.forEach((take, index) => {
  const seconds = take.samples.length / rate;
  lines[take.id] = { scene: take.scene, start: +at.toFixed(3), end: +(at + seconds).toFixed(3), show: take.show, text: take.text };
  const next = takes[index + 1];
  at += seconds + (next ? (next.scene === take.scene ? GAP_IN : GAP_SCENE) : 0);
});
const total = +(at + TAIL).toFixed(2);
const scenes = {};
for (const name of SCENES) {
  const own = Object.values(lines).filter((line) => line.scene === name);
  if (!own.length) throw new Error(`Scene ${name} has no narration`);
  scenes[name] = { start: name === SCENES[0] ? 0 : +(own[0].start - 0.7).toFixed(3) };
}
SCENES.forEach((name, index) => { scenes[name].end = index < SCENES.length - 1 ? scenes[SCENES[index + 1]].start : total; });

// Sound: the voice placed sentence by sentence, then a two-pass loudness normalization to -16 LUFS.
const out = path.join(BUILD, lang);
fs.mkdirSync(path.join(out, "compositions"), { recursive: true });
const voice = new Int16Array(Math.ceil(total * rate));
for (const take of takes) voice.set(take.samples, Math.round(lines[take.id].start * rate));
// The mixed voice sits beside the project, not in it: the voice is added after the render (video/finish.mjs).
const raw = path.join(BUILD, `voice-${lang}.raw.wav`), wav = path.join(BUILD, `voice-${lang}.wav`);
writeWav(raw, voice, rate);
const m = loudness(raw);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, "-ar", String(RATE), "-ac", "1", "-c:a", "pcm_s16le", wav]);
fs.rmSync(raw);
const voiceLoudness = +Number(loudness(wav).input_i).toFixed(1);

const TEXT = {
  en: {
    kicker: { intro: "The ledger", ladder: "The grade", e1: "E1 · Did real work", e2: "E2 · Checked against a known answer", fail: "When a check fails", end: "In total" },
    level: { E0: "Only read about", E1: "Did real work", E2: "Checked against a known answer", E3: "Checked on many cases", E4: "Checked by a second reviewer", E5: "Watched in daily use" },
    tools: "tools", useRecord: "Use record", uses: "Uses on record", worked: "Worked", partly: "Partly worked", fields: ["Task", "Result", "What went wrong"],
    approved: "Approved by a person", expected: "Expected, written first", headlines: "headlines", verdicts: "known verdicts", matched: "Matched",
    kept: "Failed · kept on record", stays: "Stays", second: "Second scanner built here", graded: "did real work", usesWord: "uses", projects: "projects",
    source: `Built from the ledger's data, ${facts.builtFrom.updated}`
  },
  es: {
    kicker: { intro: "El registro", ladder: "La nota", e1: "E1 · Hizo trabajo real", e2: "E2 · Comprobada con una respuesta conocida", fail: "Cuando una comprobación falla", end: "En total" },
    level: { E0: "Solo leída", E1: "Hizo trabajo real", E2: "Comprobada con una respuesta conocida", E3: "Comprobada en muchos casos", E4: "Revisada por otra persona", E5: "Vigilada en uso diario" },
    tools: "herramientas", useRecord: "Registro de uso", uses: "Usos registrados", worked: "Funcionó", partly: "Funcionó en parte", fields: ["Tarea", "Resultado", "Qué salió mal"],
    approved: "Aprobada por una persona", expected: "Esperado, escrito antes", headlines: "titulares", verdicts: "veredictos conocidos", matched: "Acertó",
    kept: "Falló · queda registrado", stays: "Sigue en", second: "Segundo escáner construido aquí", graded: "hicieron trabajo real", usesWord: "usos", projects: "proyectos",
    source: `Hecho con los datos del registro, ${facts.builtFrom.updated}`
  }
}[lang];

const story = { lang, total, lines, scenes, facts, text: TEXT };
fs.writeFileSync(path.join(out, "timing.json"), `${JSON.stringify({ lang, total, voiceLoudness, builtFrom: facts.builtFrom, lines, scenes }, null, 2)}\n`);
const template = fs.readFileSync(path.join(ROOT, "video", "story-template.html"), "utf8");
if (!template.includes("/*__STORY__*/null")) throw new Error("story-template.html has no STORY slot");
fs.writeFileSync(path.join(out, "compositions", "story.html"), template.replace("/*__STORY__*/null", () => JSON.stringify(story).replace(/<\//g, "<\\/")).replace(/__TOTAL__/g, String(total)));
fs.mkdirSync(path.join(out, "assets"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "assets", "fonts", "SchibstedGrotesk.woff2"), path.join(out, "assets", "SchibstedGrotesk.woff2"));
if (!process.env.LEDGER_GSAP || !fs.existsSync(process.env.LEDGER_GSAP)) throw new Error("Set LEDGER_GSAP to gsap.min.js (HyperFrames ships one)");
fs.copyFileSync(process.env.LEDGER_GSAP, path.join(out, "assets", "gsap.min.js"));
fs.writeFileSync(path.join(out, "index.html"), `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <title>Tool Research Ledger · ${lang === "es" ? "cómo se gana una nota" : "how a grade is earned"}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Schibsted Grotesk"; src: url("assets/SchibstedGrotesk.woff2") format("woff2"); font-weight: 400 900; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #14171d; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
      <div id="story" data-composition-id="story" data-composition-src="compositions/story.html" data-start="0" data-duration="${total}"
        data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
console.log(`${lang}: ${total} s, ${Object.keys(lines).length} lines, voice ${voiceLoudness} LUFS`);
for (const [name, scene] of Object.entries(scenes)) console.log(`  ${name.padEnd(7)} ${scene.start.toFixed(1).padStart(6)} to ${scene.end.toFixed(1).padStart(6)} s`);
