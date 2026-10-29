// Story video, step 1: facts and narration from data/catalog.json. Every number is computed here, never typed.
// Usage: node video/story.mjs [en|es]
// Writes video/build/facts.json and video/build/narration.<lang>.json (the input of say.py).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BUILD = path.join(ROOT, "video", "build");
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "catalog.json"), "utf8"));
const byId = new Map(catalog.tools.map((tool) => [tool.id, tool]));
const usesOf = (id) => catalog.uses.filter((use) => use.toolId === id);
const level = (id) => catalog.tools.filter((tool) => tool.evidenceLevel === id).length;
const ofPattern = /(\d+) of (\d+)/;

// E1: the voice that narrates this video, and the record that raised it.
const voice = byId.get("kokoro-onnx");
const voiceUses = usesOf(voice.id);
const voiceRaise = voice.changes.find((change) => change.field === "evidenceLevel");
const voiceSpoken = voiceUses.find((use) => use.outcome === "PASS");
const voiceProblem = voiceUses.find((use) => use.outcome !== "PASS");
// E2: the OCR check whose expected result was written first.
const ocr = byId.get("paddleocr");
const ocrUse = usesOf(ocr.id).find((use) => use.baseline && ofPattern.test(use.checkedResult || "") && /Tesseract/.test(use.checkedResult));
const [, ocrGot, ocrOf] = ocrUse.checkedResult.match(ofPattern);
const [, otherGot] = ocrUse.checkedResult.split("Tesseract")[1].match(ofPattern);
// A failed check that is kept: the scanner measured against verdicts written beforehand.
const scanner = byId.get("skillspector");
const scannerUse = usesOf(scanner.id).find((use) => use.outcome === "FAIL" && use.baseline && ofPattern.test(use.checkedResult || ""));
const [, scanGot, scanOf] = scannerUse.checkedResult.match(ofPattern);
const secondScanner = catalog.lessons.find((lesson) => lesson.from.includes(scanner.id) && lesson.ours);

export const facts = {
  builtFrom: { updated: catalog.meta.updated, source: catalog.meta.source },
  tools: catalog.tools.length,
  levels: Object.fromEntries(catalog.evidenceLevels.map((item) => [item.id, level(item.id)])),
  graded: catalog.tools.filter((tool) => tool.evidenceLevel !== "E0").length,
  uses: catalog.uses.length,
  projects: new Set(catalog.uses.map((use) => use.project)).size,
  approvedMoves: catalog.tools.reduce((sum, tool) => sum + tool.changes.filter((change) => change.field === "evidenceLevel").length, 0),
  voice: { name: voice.name.replace(/\s*\(.*\)$/, ""), level: voice.evidenceLevel, uses: voiceUses.length, worked: voiceUses.filter((use) => use.outcome === "PASS").length,
    from: voiceRaise.from, to: voiceRaise.to, date: voiceRaise.date, project: voiceSpoken.project, problem: voiceProblem?.outcome || null },
  ocr: { name: ocr.name, level: ocr.evidenceLevel, got: +ocrGot, of: +ocrOf, other: byId.get("tesseract").name, otherGot: +otherGot },
  scanner: { name: scanner.name, level: scanner.evidenceLevel, got: +scanGot, of: +scanOf, second: byId.get(secondScanner.ours).name },
  blocked: catalog.tools.filter((tool) => tool.safety?.status === "BLOCK").length
};

// Spanish number words, so the Spanish voice never reads digits in English.
function spanishNumber(n) {
  const units = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
    "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
  const tens = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
  if (n < 30) return units[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` y ${units[n % 10]}` : "");
  if (n === 100) return "cien";
  if (n < 1000) return hundreds[Math.floor(n / 100)] + (n % 100 ? ` ${spanishNumber(n % 100)}` : "");
  throw new Error(`No Spanish words for ${n}`);
}
// "uno" before a feminine noun is "una"; "veintiuno" is "veintiuna".
const es = (n, feminine = false) => { const words = spanishNumber(n); return feminine ? words.replace(/uno$/, "una").replace(/veintiún?$/, "veintiuna") : words; };
const enLevel = (id) => `E ${["zero", "one", "two", "three", "four", "five"][Number(id.slice(1))]}`;
const esLevel = (id) => `E ${spanishNumber(Number(id.slice(1)))}`;
const F = facts;

const LINES = {
  en: [
    ["intro", "i1", `This ledger keeps ${F.tools} open-source AI tools.`, `${F.tools} tools`],
    ["intro", "i2", "Each one has a grade, from E zero to E five. The grade counts proof, not popularity.", "A grade counts proof"],
    ["ladder", "l1", `E zero means we only read about it. ${F.levels.E0} tools are there.`, `E0 · only read about · ${F.levels.E0}`],
    ["ladder", "l2", "To move up, a tool has to do real work in a named project.", "Real work, in a named project"],
    ["e1", "e1", "Take the voice you are hearing. It recorded the narration of this ledger's story video.", `${F.voice.name} · did real work`],
    ["e1", "e2", "That use was written down: the task, the result, and what went wrong.", "Task · result · errors"],
    ["e1", "e3", `A person read the record and approved the move to ${enLevel(F.voice.to)}. ${F.levels.E1} tools are at E one.`, `${F.voice.to} · approved · ${F.levels.E1} tools`],
    ["e2", "f1", "E two asks for more. The expected result is written down before the tool runs.", "Expected result first"],
    ["e2", "f2", `A text reader was asked to read ${F.ocr.of} headlines from a video. It read ${F.ocr.got} of ${F.ocr.of}.`, `${F.ocr.name} · ${F.ocr.got} of ${F.ocr.of}`],
    ["e2", "f3", `A second reader, on the same images, read ${F.ocr.otherGot}.`, `${F.ocr.other} · ${F.ocr.otherGot} of ${F.ocr.of}`],
    ["e2", "f4", `${F.levels.E2} tools have reached E two. None is higher yet.`, `E2 · ${F.levels.E2} tools`],
    ["fail", "s1", `A check can also fail. A skill scanner was expected to give ${F.scanner.of} known verdicts. It got ${F.scanner.got} of ${F.scanner.of}.`, `${F.scanner.name} · ${F.scanner.got} of ${F.scanner.of}`],
    ["fail", "s2", `That result is kept. The scanner stays at ${enLevel(F.scanner.level)}, and a second scanner was built here.`, "Failures are kept too"],
    ["end", "r1", "Only recorded use and a person's approval move a grade.", "Use + approval"],
    ["end", "r2", `${F.tools} tools. ${F.graded} did real work. ${F.uses} uses on record.`, `${F.graded} did real work · ${F.uses} uses`],
    ["end", "r3", "This is the Tool Research Ledger.", "Tool Research Ledger"]
  ],
  es: [
    ["intro", "i1", `Este registro guarda ${es(F.tools, true)} herramientas de inteligencia artificial de código abierto.`, `${F.tools} herramientas`],
    ["intro", "i2", "Cada una tiene una nota, de E cero a E cinco. La nota cuenta pruebas, no popularidad.", "Una nota cuenta pruebas"],
    ["ladder", "l1", `E cero significa que solo leímos sobre ella. Hay ${es(F.levels.E0, true)} herramientas ahí.`, `E0 · solo leída · ${F.levels.E0}`],
    ["ladder", "l2", "Para subir, una herramienta tiene que hacer trabajo real en un proyecto con nombre.", "Trabajo real, en un proyecto con nombre"],
    ["e1", "e1", "Escucha esta voz. Grabó la narración del video de este registro.", `${F.voice.name} · hizo trabajo real`],
    ["e1", "e2", "Ese uso quedó escrito: la tarea, el resultado y lo que salió mal.", "Tarea · resultado · errores"],
    ["e1", "e3", `Una persona leyó el registro y aprobó la subida a ${esLevel(F.voice.to)}. Hay ${es(F.levels.E1, true)} herramientas en E uno.`, `${F.voice.to} · aprobada · ${F.levels.E1} herramientas`],
    ["e2", "f1", "E dos pide más. El resultado esperado se escribe antes de usar la herramienta.", "Primero el resultado esperado"],
    ["e2", "f2", `Un lector de texto tuvo que leer ${es(F.ocr.of)} titulares de un video. Leyó ${es(F.ocr.got)} de ${es(F.ocr.of)}.`, `${F.ocr.name} · ${F.ocr.got} de ${F.ocr.of}`],
    ["e2", "f3", `Otro lector, con las mismas imágenes, leyó ${es(F.ocr.otherGot)}.`, `${F.ocr.other} · ${F.ocr.otherGot} de ${F.ocr.of}`],
    ["e2", "f4", `${es(F.levels.E2, true).replace(/^./, (c) => c.toUpperCase())} herramientas llegaron a E dos. Ninguna está más arriba todavía.`, `E2 · ${F.levels.E2} herramientas`],
    ["fail", "s1", `Una comprobación también puede fallar. Un escáner de habilidades debía dar ${es(F.scanner.of)} veredictos conocidos. Acertó ${es(F.scanner.got)} de ${es(F.scanner.of)}.`, `${F.scanner.name} · ${F.scanner.got} de ${F.scanner.of}`],
    ["fail", "s2", `Ese resultado se guarda. El escáner sigue en ${esLevel(F.scanner.level)}, y aquí se construyó un segundo escáner.`, "Los fallos también se guardan"],
    ["end", "r1", "Solo el uso registrado y la aprobación de una persona mueven una nota.", "Uso + aprobación"],
    ["end", "r2", `${es(F.tools, true).replace(/^./, (c) => c.toUpperCase())} herramientas. ${es(F.graded, true).replace(/^./, (c) => c.toUpperCase())} hicieron trabajo real. ${es(F.uses).replace(/^./, (c) => c.toUpperCase())} usos registrados.`, `${F.graded} hicieron trabajo real · ${F.uses} usos`],
    ["end", "r3", "Este es el registro de investigación de herramientas.", "Tool Research Ledger"]
  ]
};
export const SCENES = ["intro", "ladder", "e1", "e2", "fail", "end"];

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const lang = process.argv[2] || "en";
  if (!LINES[lang]) throw new Error(`Unknown language ${lang}`);
  fs.mkdirSync(BUILD, { recursive: true });
  fs.writeFileSync(path.join(BUILD, "facts.json"), `${JSON.stringify(facts, null, 2)}\n`);
  const narration = {
    lang: lang === "es" ? "es" : "en-us", voice: lang === "es" ? "ef_dora" : "af_heart", speed: 1.0,
    lines: LINES[lang].map(([scene, id, text, show]) => ({ id, scene, text, show }))
  };
  fs.writeFileSync(path.join(BUILD, `narration.${lang}.json`), `${JSON.stringify(narration, null, 2)}\n`);
  const words = narration.lines.reduce((sum, line) => sum + line.text.split(/\s+/).length, 0);
  console.log(`${lang}: ${narration.lines.length} lines, ${words} words, facts from ${facts.builtFrom.source} ${facts.builtFrom.updated}`);
}
