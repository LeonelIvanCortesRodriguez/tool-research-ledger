// Story video, step 2: time each line to the recorded voice, mix the music bed under it at -16 LUFS and write the
// HyperFrames composition from video/story-template.html.
// Usage: node video/assemble.mjs [en|es]
// Reads video/build/facts.json, narration.<lang>.json and voice-<lang>/manifest.json (from say.py).
// Writes video/build/<lang>/index.html, compositions/story.html and timing.json, and video/build/voice-<lang>.wav.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { BUILD, ROOT, SCENES } from "./story.mjs";
import { loudness } from "./loudness.mjs";
import { makeMusic, BEAT } from "./music.mjs";

const lang = process.argv[2] || "en";
// The pacing of Leonel's story video: a short pause after each sentence, a longer one between scenes.
const LEAD = 0.6, GAP_IN = 0.55, GAP_SCENE = 1.4, TAIL = 4.5, RATE = 48000;
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
const ffmpeg = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args]);

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
  scenes[name] = { start: name === SCENES[0] ? 0 : +(own[0].start - 0.9).toFixed(3) };
}
SCENES.forEach((name, index) => { scenes[name].end = index < SCENES.length - 1 ? scenes[SCENES[index + 1]].start : total; });

// Sound: the voice placed sentence by sentence, the music bed ducked under it, then a two-pass loudness
// normalization to -16 LUFS, true peak -1.5 dBTP. The voice is added after the render (video/finish.mjs).
const out = path.join(BUILD, lang);
fs.mkdirSync(path.join(out, "compositions"), { recursive: true });
const voice = new Int16Array(Math.ceil(total * rate));
for (const take of takes) voice.set(take.samples, Math.round(lines[take.id].start * rate));
const rawVoice = path.join(BUILD, `voice-${lang}.raw.wav`), rawMusic = path.join(BUILD, `music-${lang}.raw.wav`), rawMix = path.join(BUILD, `mix-${lang}.raw.wav`);
const wav = path.join(BUILD, `voice-${lang}.wav`);
writeWav(rawVoice, voice, rate);
writeWav(rawMusic, makeMusic({ total, rate: RATE, scenes }), RATE);
ffmpeg(["-i", rawVoice, "-i", rawMusic, "-filter_complex",
  "[0:a]aresample=48000,asplit=2[v][key];[1:a]volume=0.22[bed];[bed][key]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=350[duck];[v][duck]amix=inputs=2:duration=first:normalize=0[mix]",
  "-map", "[mix]", "-ac", "1", "-c:a", "pcm_s16le", rawMix]);
const m = loudness(rawMix);
ffmpeg(["-i", rawMix, "-af", `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  "-ar", String(RATE), "-ac", "1", "-c:a", "pcm_s16le", wav]);
for (const file of [rawVoice, rawMusic, rawMix]) fs.rmSync(file);
const voiceLoudness = +Number(loudness(wav).input_i).toFixed(1);

// Scene 5's waveform is the real envelope of "Here is one tool, start to finish: the voice you are hearing."
const voiceLine = takes.find((take) => take.id === "k1");
const BARS = 64, chunk = Math.floor(voiceLine.samples.length / BARS);
const rms = Array.from({ length: BARS }, (_, bar) => {
  let sum = 0;
  for (let i = bar * chunk; i < (bar + 1) * chunk; i++) sum += voiceLine.samples[i] ** 2;
  return Math.sqrt(sum / chunk);
});
const loudest = Math.max(...rms);
const wave = rms.map((value) => +(0.12 + 0.88 * value / loudest).toFixed(3));

// The montage: real tool names, the ones doing real work first, cut on the beat until "we collected".
const others = facts.toolIds.filter((id) => !facts.working.ids.includes(id));
const pool = [...facts.working.ids, ...others.filter((_, i) => i % 3 === 0), ...others.filter((_, i) => i % 3 !== 0)];
const montage = pool.slice(0, 6 + Math.max(0, Math.ceil((lines.w3.start - 6 * BEAT) / (BEAT / 2))));

const levelOf = {};
for (const [level, ids] of Object.entries(facts.levels)) for (const id of ids) levelOf[id] = level;
const tileColor = facts.toolIds.map((id) => ({ E0: "#2a313d", E1: "#8a3a66" }[levelOf[id]] || "#e05aa0"));

const TEXT = {
  en: {
    asks: ["Works?", "Safe?", "Fits?"], proof: "proof",
    steps: ["read about it", "did real work", "checked against a written result", "many test cases", "a second reviewer", "time in production"],
    looksFor: ["stolen passwords", "hidden instructions", "code from the internet"], report: "Scan report", personChecks: "A person checks each line",
    readNeverRun: "Not installed without a person's review", trapNames: ["Trap 1", "Trap 2"], trapWhat: ["Sends your cloud passwords to a stranger", "Tells the agent to ignore its rules"],
    scannerSaid: "Scanner said", blocked: "BLOCKED", chain: ["A tool", "Used in a project", "Its grade moves"], useOf: "Use record:",
    fields: ["Task", "Result", "Fix", "Evidence"], normalizedTo: "Voice normalized to", tooQuietWord: "too quiet", evidenceKept: "Kept with the check written first",
    loudnessWord: "Loudness", onTarget: "on target", decisionApproved: "Decision: approved", target: "target", references: `${facts.library.count} without a successful use`,
    stations: ["Enters", "Scanned", "Used", "Reviewed", "Graded"], voiceMeta: "local voice · offline", noProof: "No proof yet: E0",
    scanChecks: ["No known problems", "Model fingerprints match"], usedIn: "Recorded the first narration", proposesWord: "Proposes",
    approvedBy: "Approved by", turnedDownBy: "Turned down by", waiting: "Waiting for review", nextNeeds: "E2 needs a result written down first",
    newProject: "New project", roles: { skillspector: "Scans it first", "playwright-core": "Tests it in a browser", hyperframes: "Renders the video", "kokoro-onnx": "Records the voice" },
    builtLine: `Built from the ledger's public export of ${facts.builtFrom.exported}`, card: "LEONEL CORTÉS · EVIDENCE-LED TOOL RESEARCH",
    unsafeChip: `${facts.scans.blocked} unsafe · ${facts.scans.count - facts.scans.blocked} cleared`,
    testWord: "Test:", plusUse: "+1 use", cycle: ["Use", "Check", "Fix", "New rule"], found: "problems found", fixedWord: "fixes",
    lesson: `Scanner underrated ${facts.scanner.missed} traps → a stricter rule was added`, tools: "tools", uses: "uses", decisions: "decisions", title: ["Tool", "Research", "Ledger"]
  },
  es: {
    asks: ["¿Funciona?", "¿Segura?", "¿Sirve?"], proof: "pruebas",
    steps: ["leída", "trabajo real", "comprobada", "muchos casos", "segundo revisor", "en producción"],
    looksFor: ["contraseñas robadas", "instrucciones ocultas", "código de internet"], report: "Informe del escaneo", personChecks: "Una persona revisa cada línea",
    readNeverRun: "No se instala sin revisión de una persona", trapNames: ["Trampa 1", "Trampa 2"], trapWhat: ["Envía tus contraseñas de la nube a un extraño", "Le dice al agente que ignore sus reglas"],
    scannerSaid: "El escáner dijo", blocked: "BLOQUEADA", chain: ["Una herramienta", "Usada en un proyecto", "Su nota se mueve"], useOf: "Registro de uso:",
    fields: ["Tarea", "Resultado", "Arreglo", "Evidencia"], normalizedTo: "Voz normalizada a", tooQuietWord: "muy bajo", evidenceKept: "Guardada con la comprobación escrita antes",
    loudnessWord: "Volumen", onTarget: "en el objetivo", decisionApproved: "Decisión: aprobada", target: "objetivo", references: `${facts.library.count} sin uso exitoso`,
    stations: ["Entra", "Escaneada", "Usada", "Revisada", "Calificada"], voiceMeta: "voz local · sin conexión", noProof: "Sin pruebas aún: E0",
    scanChecks: ["Sin problemas conocidos", "Huellas del modelo coinciden"], usedIn: "Grabó la primera narración", proposesWord: "Propone",
    approvedBy: "Aprobada por", turnedDownBy: "Rechazada por", waiting: "Esperando revisión", nextNeeds: "E2 necesita un resultado escrito antes",
    newProject: "Proyecto nuevo", roles: { skillspector: "Lo escanea primero", "playwright-core": "Lo prueba en un navegador", hyperframes: "Renderiza el video", "kokoro-onnx": "Graba la voz" },
    builtLine: `Hecho con la exportación pública del registro del ${facts.builtFrom.exported}`, card: "LEONEL CORTÉS · INVESTIGACIÓN DE HERRAMIENTAS CON PRUEBAS",
    unsafeChip: `${facts.scans.blocked} inseguras · ${facts.scans.count - facts.scans.blocked} aprobadas`,
    testWord: "Prueba:", plusUse: "+1 uso", cycle: ["Uso", "Comprobación", "Arreglo", "Regla nueva"], found: "problemas encontrados", fixedWord: "arreglos",
    lesson: `El escáner subestimó ${facts.scanner.missed} trampas → se añadió una regla más estricta`,
    tools: "herramientas", uses: "usos", decisions: "decisiones", title: ["Tool", "Research", "Ledger"]
  }
}[lang];

const story = { lang, total, beat: BEAT, lines, scenes, wave, montage, levelOf, tileColor, loudness: voiceLoudness, facts, text: TEXT };
fs.writeFileSync(path.join(out, "timing.json"), `${JSON.stringify({ lang, total, voiceLoudness, builtFrom: facts.builtFrom, lines, scenes }, null, 2)}\n`);
const template = fs.readFileSync(path.join(ROOT, "video", "story-template.html"), "utf8");
if (!template.includes("/*__STORY__*/null")) throw new Error("story-template.html has no STORY slot");
// JSON inside a script: keep "</" from closing the tag.
fs.writeFileSync(path.join(out, "compositions", "story.html"), template.replace("/*__STORY__*/null", () => JSON.stringify(story).replace(/<\//g, "<\\/")).replace(/__TOTAL__/g, String(total)));
fs.mkdirSync(path.join(out, "assets"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "assets", "fonts", "SchibstedGrotesk.woff2"), path.join(out, "assets", "SchibstedGrotesk.woff2"));
if (!process.env.LEDGER_GSAP || !fs.existsSync(process.env.LEDGER_GSAP)) throw new Error("Set LEDGER_GSAP to gsap.min.js (HyperFrames ships one)");
fs.copyFileSync(process.env.LEDGER_GSAP, path.join(out, "assets", "gsap.min.js"));
fs.writeFileSync(path.join(out, "index.html"), `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <title>Tool Research Ledger · ${lang === "es" ? "la historia" : "the story"}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Schibsted Grotesk"; src: url("assets/SchibstedGrotesk.woff2") format("woff2"); font-weight: 400 900; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #14181f; }
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
console.log(`${lang}: ${total} s, ${Object.keys(lines).length} lines, sound ${voiceLoudness} LUFS, montage ${montage.length} names`);
for (const [name, scene] of Object.entries(scenes)) console.log(`  ${name.padEnd(7)} ${scene.start.toFixed(1).padStart(6)} to ${scene.end.toFixed(1).padStart(6)} s`);
