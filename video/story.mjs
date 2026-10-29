// Story video, step 1: facts and narration from the story block of data/ledger-export.json. Every number is read
// from the export, never typed. The scenes follow Leonel's story video: world, grade, scan, proof, loop, fit, result.
// Usage: node video/story.mjs [en|es]
// Writes video/build/facts.json and video/build/narration.<lang>.json (the input of say.py).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BUILD = path.join(ROOT, "video", "build");
export const SCENES = ["world", "grade", "scan", "proof", "loop", "fit", "result"];
export const VOICES = { en: { lang: "en-us", voice: "af_heart", speed: 1.0 }, es: { lang: "es", voice: "ef_dora", speed: 1.0 } };

const exp = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "ledger-export.json"), "utf8"));
const story = exp.story;
if (!story) throw new Error("data/ledger-export.json has no story block; import a newer export");
// The story block and the rest of the export must agree, or the video would contradict the page.
if (story.tools !== exp.tools.length) throw new Error(`story.tools ${story.tools} differs from the export's ${exp.tools.length} tools`);
if (story.totals.uses !== exp.uses.length) throw new Error(`story.totals.uses ${story.totals.uses} differs from the export's ${exp.uses.length} uses`);
for (const [level, ids] of Object.entries(story.levels)) {
  const count = exp.tools.filter((tool) => tool.evidenceLevel === level).length;
  if (ids.length !== count) throw new Error(`story.levels.${level} lists ${ids.length} tools, the export has ${count}`);
}
// The public video names Leonel; the export says "the owner".
const person = (by) => (by === "the owner" ? "Leonel" : by);
const approved = story.voice.approved && { ...story.voice.approved, by: person(story.voice.approved.by) };
const rejected = story.voice.rejected && { ...story.voice.rejected, by: person(story.voice.rejected.by) };

export const facts = {
  builtFrom: { ...story.builtFrom, exported: exp.exported, source: exp.schema },
  tools: story.tools, toolIds: story.toolIds, names: story.names, kinds: story.kinds, levels: story.levels, highest: story.highest,
  scans: story.scans, scanner: story.scanner, ffmpeg: story.ffmpeg, library: story.library, working: story.working,
  voice: { ...story.voice, approved, rejected }, fit: story.fit, totals: story.totals, learning: story.learning
};

// Numbers as words, so the voice reads "ninety-nine" the same way every time.
const EN_ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function enWords(n) {
  if (n < 20) return EN_ONES[n];
  if (n < 100) return EN_TENS[Math.floor(n / 10)] + (n % 10 ? `-${EN_ONES[n % 10]}` : "");
  if (n < 1000) return `${n >= 200 ? EN_ONES[Math.floor(n / 100)] : "a"} hundred${n % 100 ? ` and ${enWords(n % 100)}` : ""}`;
  throw new Error(`enWords: ${n} is out of range`);
}
const ES_ONES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const ES_TENS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const ES_HUNDREDS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
function esWords(n) {
  if (n < 30) return ES_ONES[n];
  if (n < 100) return ES_TENS[Math.floor(n / 10)] + (n % 10 ? ` y ${ES_ONES[n % 10]}` : "");
  if (n === 100) return "cien";
  if (n < 1000) return ES_HUNDREDS[Math.floor(n / 100)] + (n % 100 ? ` ${esWords(n % 100)}` : "");
  throw new Error(`esWords: ${n} is out of range`);
}
// Feminine nouns (herramientas, decisiones) take "una", "veintiuna"; escaneos, usos and problemas do not.
const fem = (n) => esWords(n).replace(/uno$/, "una");
const cap = (text) => text[0].toUpperCase() + text.slice(1);
const F = facts;

// Each line: what the voice says ("text") and the one to five words on screen ("show").
// "text" spells names the way the voice should say them; "show" keeps the real spelling.
function linesEn() {
  const w = enWords;
  const allProven = F.working.atE1 === F.working.count;
  const approval = F.voice.approved ? ["A person reviewed the proposal and approved it.", `Approved: ${F.voice.approved.to}`]
    : F.voice.rejected ? ["A person reviewed the proposal and turned it down.", "Turned down"]
      : ["Now the proposal waits for a person to decide.", "A person decides"];
  const ffmpegMove = F.ffmpeg.raisedTo
    ? [`F F mpeg measured the first draft of this video and found its sound too quiet. We fixed it, and F F mpeg moved up to E ${w(Number(F.ffmpeg.raisedTo.slice(1)))}.`, `FFmpeg: up to ${F.ffmpeg.raisedTo}`]
    : ["F F mpeg measured this video's sound and found it too quiet. We fixed it before the final render.", "FFmpeg: too quiet, fixed"];
  return [
    ["world", "w1", "Every week, new A.I. tools appear.", "New tools, every week"],
    ["world", "w2", "Skills, models, scanners, agents. Each one promises better work.", "Each one promises"],
    ["world", "w3", `We collected ${w(F.tools)} of them.`, `${F.tools} tools`],
    ["world", "w4", "So which ones actually work? Which are safe? And which fit the project in front of you?", "Works? Safe? Fits?"],
    ["grade", "g1", "Our answer is a grade, and only proof can raise it.", "A grade, raised by proof"],
    ["grade", "g2", "There are six steps, from E zero to E five.", "Six steps: E0 to E5"],
    ["grade", "g3", "E zero: we have only read about it.", "E0 · read about it"],
    ["grade", "g4", "E one: it did real work in a project.", "E1 · did real work"],
    ["grade", "g5", "E two: it was checked against a result we wrote down first.", "E2 · checked"],
    ["grade", "g6", "The higher steps need many test cases, a second reviewer, and time in production.", "E3 to E5 · more proof"],
    ["scan", "c1", "Before anything is installed, it is scanned.", "Scan before install"],
    ["scan", "c2", "The scanner reads the files, looking for stolen passwords, hidden instructions, or code pulled from the internet.", "What a scan looks for"],
    ["scan", "c3", "Each finding comes with a severity and a line number, so a person can check it.", "Every finding, with its line"],
    ["scan", "c4", `In ${w(F.scans.blocked)} of ${w(F.scans.count)} scans, at least one part was not safe. Those parts are not installed unless a person reads the report and decides.`, `${F.scans.blocked} of ${F.scans.count} had an unsafe part`],
    ["scan", "c5", `We tested the scanner too, with traps we planted. It rated ${w(F.scanner.missed)} of ${w(F.scanner.cases)} as only a caution, so the ledger now blocks any high-risk finding until a person reads it.`, "The scanner, tested"],
    ["proof", "p1", "A grade only moves when a tool is used in a real project.", "Used, then graded"],
    ["proof", "p2", "Each use is written down: the task, what broke, what was fixed, and the evidence.", "Every use, on record"],
    ["proof", "p3", ...ffmpegMove],
    ["proof", "p4", `${cap(w(F.library.count))} tools have no successful use in the ledger yet. They stay on file, as candidates and references.`, `${F.library.count} without a successful use`],
    ["proof", "p5", allProven ? `Of the ${w(F.working.count)} that have, every one is at E one or higher.` : `Of the ${w(F.working.count)} that have, ${w(F.working.atE1)} are at E one or higher.`, `${F.working.count} working · ${F.working.atE1} at E1 or up`],
    ["loop", "k1", "Here is one tool, start to finish: the voice you are hearing.", "One tool: this voice"],
    ["loop", "k2", "It entered the ledger with no proof, at E zero.", "Enters at E0"],
    ["loop", "k3", "The scan found no known problems, and its model files matched their published fingerprints.", "Scanned: safe"],
    ["loop", "k4", "Then it recorded the first narration for this video. That real use proposed E one.", "Used: proposes E1"],
    ["loop", "k5", ...approval],
    ["loop", "k6", "To reach E two, it needs a check against a result written down first.", "Next: E2"],
    ["fit", "n1", "When a new project starts, the ledger suggests the tools that fit it, and how each one will be tested there.", "A new project"],
    ["fit", "n2", "Every new use adds proof, so the next project starts from what was learned.", "Each use adds proof"],
    ["fit", "n3", "The ledger also learns as it goes.", "It learns as it goes"],
    ["fit", "n4", `Every problem is written down with its fix: ${w(F.learning.problems)} found, ${w(F.learning.fixes)} fixed. And a failed check can become a new rule, like the stricter scan rule.`, `${F.learning.problems} found · ${F.learning.fixes} fixed`],
    ["result", "r1", `${cap(w(F.tools))} tools, ${w(F.totals.uses)} uses, ${w(F.totals.decisions)} decisions. All on record.`, "All on record"],
    ["result", "r2", "This is the Tool Research Ledger.", "Picked by proof"]
  ];
}

function linesEs() {
  const w = esWords;
  const allProven = F.working.atE1 === F.working.count;
  const approval = F.voice.approved ? ["Una persona revisó la propuesta y la aprobó.", `Aprobada: ${F.voice.approved.to}`]
    : F.voice.rejected ? ["Una persona revisó la propuesta y la rechazó.", "Rechazada"]
      : ["Ahora la propuesta espera a que una persona decida.", "Una persona decide"];
  const ffmpegMove = F.ffmpeg.raisedTo
    ? [`Efe efe eme peg midió el primer borrador de este video y encontró el sonido demasiado bajo. Lo corregimos, y efe efe eme peg subió a E ${w(Number(F.ffmpeg.raisedTo.slice(1)))}.`, `FFmpeg: sube a ${F.ffmpeg.raisedTo}`]
    : ["Efe efe eme peg midió el primer borrador de este video y encontró el sonido demasiado bajo. Lo corregimos antes de la versión final.", "FFmpeg: muy bajo, corregido"];
  return [
    ["world", "w1", "Cada semana aparecen nuevas herramientas de inteligencia artificial.", "Nuevas herramientas, cada semana"],
    ["world", "w2", "Habilidades, modelos, escáneres, agentes. Cada una promete un mejor trabajo.", "Todas prometen"],
    ["world", "w3", `Reunimos ${fem(F.tools)}.`, `${F.tools} herramientas`],
    ["world", "w4", "¿Cuáles funcionan de verdad? ¿Cuáles son seguras? ¿Y cuáles le sirven al proyecto que tienes enfrente?", "¿Funciona? ¿Segura? ¿Sirve?"],
    ["grade", "g1", "Nuestra respuesta es una nota, y solo las pruebas pueden subirla.", "Una nota que suben las pruebas"],
    ["grade", "g2", "Hay seis niveles, de E cero a E cinco.", "Seis niveles: E0 a E5"],
    ["grade", "g3", "E cero: solo hemos leído sobre ella.", "E0 · leída"],
    ["grade", "g4", "E uno: hizo trabajo real en un proyecto.", "E1 · trabajo real"],
    ["grade", "g5", "E dos: se comprobó contra un resultado escrito de antemano.", "E2 · comprobada"],
    ["grade", "g6", "Los niveles más altos piden muchos casos de prueba, un segundo revisor y tiempo en producción.", "E3 a E5 · más pruebas"],
    ["scan", "c1", "Antes de instalar cualquier cosa, se escanea.", "Escanear antes de instalar"],
    ["scan", "c2", "El escáner lee los archivos buscando contraseñas robadas, instrucciones ocultas o código descargado de internet.", "Qué busca un escaneo"],
    ["scan", "c3", "Cada hallazgo trae su gravedad y su número de línea, para que una persona lo revise.", "Cada hallazgo, con su línea"],
    ["scan", "c4", `En ${w(F.scans.blocked)} de ${w(F.scans.count)} escaneos, al menos una parte no era segura. Esas partes no se instalan hasta que una persona lee el informe y decide.`, `${F.scans.blocked} de ${F.scans.count} con una parte insegura`],
    ["scan", "c5", `También probamos el escáner, con trampas que pusimos nosotros. Calificó ${fem(F.scanner.missed)} de ${fem(F.scanner.cases)} solo como precaución, así que ahora el registro bloquea cualquier hallazgo de alto riesgo hasta que una persona lo lea.`, "El escáner, a prueba"],
    ["proof", "p1", "Una nota solo cambia cuando la herramienta se usa en un proyecto real.", "Se usa, luego se califica"],
    ["proof", "p2", "Cada uso queda escrito: la tarea, lo que falló, lo que se arregló y la evidencia.", "Cada uso, registrado"],
    ["proof", "p3", ...ffmpegMove],
    ["proof", "p4", `${cap(fem(F.library.count))} herramientas aún no tienen un uso exitoso en el registro. Se quedan como candidatas y referencias.`, `${F.library.count} sin uso exitoso`],
    ["proof", "p5", allProven ? `De las ${fem(F.working.count)} que sí, todas están en E uno o más.` : `De las ${fem(F.working.count)} que sí, ${fem(F.working.atE1)} están en E uno o más.`, `${F.working.count} en uso · ${F.working.atE1} en E1 o más`],
    ["loop", "k1", "Aquí hay una herramienta, de principio a fin: la voz que estás escuchando.", "Una herramienta: esta voz"],
    ["loop", "k2", "Entró al registro sin pruebas, en E cero.", "Entra en E0"],
    ["loop", "k3", "El escaneo no encontró problemas conocidos, y sus archivos de modelo coincidieron con sus huellas publicadas.", "Escaneada: segura"],
    ["loop", "k4", "Luego grabó la primera narración de este video. Ese uso real propuso E uno.", "Usada: propone E1"],
    ["loop", "k5", ...approval],
    ["loop", "k6", "Para llegar a E dos, necesita una comprobación contra un resultado escrito de antemano.", "Siguiente: E2"],
    ["fit", "n1", "Cuando empieza un proyecto nuevo, el registro sugiere las herramientas que encajan, y cómo se probará cada una.", "Un proyecto nuevo"],
    ["fit", "n2", "Cada uso nuevo suma pruebas, así el siguiente proyecto parte de lo aprendido.", "Cada uso suma pruebas"],
    ["fit", "n3", "El registro también aprende sobre la marcha.", "Aprende sobre la marcha"],
    ["fit", "n4", `Cada problema queda escrito con su arreglo: ${w(F.learning.problems)} encontrados, ${w(F.learning.fixes)} arreglados. Y una comprobación fallida puede volverse una regla nueva, como la regla de escaneo más estricta.`, `${F.learning.problems} encontrados · ${F.learning.fixes} arreglados`],
    ["result", "r1", `${cap(fem(F.tools))} herramientas, ${w(F.totals.uses)} usos, ${fem(F.totals.decisions)} decisiones. Todo registrado.`, "Todo registrado"],
    // Spoken in Spanish only: the Spanish voice mispronounces English names. The English name stays on screen.
    ["result", "r2", "Este es nuestro registro de herramientas.", "Elegidas con pruebas"]
  ];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const lang = process.argv[2] || "en";
  if (!VOICES[lang]) throw new Error(`Unknown language ${lang}; use en or es`);
  const lines = (lang === "es" ? linesEs : linesEn)().map(([scene, id, text, show]) => ({ id, scene, text, show }));
  fs.mkdirSync(BUILD, { recursive: true });
  fs.writeFileSync(path.join(BUILD, "facts.json"), `${JSON.stringify(facts, null, 2)}\n`);
  fs.writeFileSync(path.join(BUILD, `narration.${lang}.json`), `${JSON.stringify({ ...VOICES[lang], lines }, null, 2)}\n`);
  console.log(`${lang}: ${lines.length} lines; ${F.tools} tools, ${F.scans.blocked}/${F.scans.count} scans with an unsafe part, scanner missed ${F.scanner.missed}/${F.scanner.cases}, ${F.working.atE1}/${F.working.count} working at E1+, ${F.library.count} without a use, voice ${F.voice.level}`);
}
