// Render README, social, and demo assets from the canonical catalog and the live interface.
// Needs Chrome or Edge, FFmpeg on PATH, and the playwright-core devDependency (`npm ci`).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const build = path.join(root, "design", "build");
const frames = path.join(build, "frames");
const out = path.join(root, "docs", "brand");
for (const dir of [build, out]) fs.mkdirSync(dir, { recursive: true });
fs.rmSync(frames, { recursive: true, force: true });
fs.mkdirSync(frames, { recursive: true });

const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "catalog.json"), "utf8"));
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plainFrom = (name, key) => appSource.match(new RegExp(`const ${name} = \\{[\\s\\S]*?${key}: "([^"]+)"`))[1];
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const group = catalog.capabilityGroups.find((item) => item.id === "document-intelligence");
const lead = catalog.tools.find((tool) => tool.id === group.leadToolId);
const e0 = catalog.tools.filter((tool) => tool.evidenceLevel === "E0").length;
const count = (decision) => catalog.tools.filter((tool) => tool.decision === decision).length;

const glyphs = {
  PILOT: '<circle cx="8" cy="8" r="6" class="g-line"/><path d="M8 2a6 6 0 0 0 0 12z" class="g-fill"/>',
  CONDITIONAL: '<circle cx="8" cy="8" r="6" class="g-line"/><path d="M3.5 8h9" class="g-line"/>',
  REFERENCE: '<circle cx="8" cy="8" r="6" class="g-line"/>',
  WATCH: '<circle cx="8" cy="8" r="6" class="g-line g-dash"/>',
  HOLD: '<rect x="2.5" y="2.5" width="11" height="11" class="g-stop-fill"/>',
  REJECT: '<path d="M3 3l10 10M13 3L3 13" class="g-stop-line"/>'
};
const glyph = (decision, size = 22) => `<svg class="glyph" width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true">${glyphs[decision]}</svg>`;
const ladder = (level, big) => `<span class="ladder${big ? " big" : ""}" aria-hidden="true">${catalog.evidenceLevels.map((item, index) => `<i class="${index <= Number(level.slice(1)) ? "filled" : ""}"></i>`).join("")}</span>`;
const riskBars = (level) => { const steps = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[level]; return `<span class="bars" aria-hidden="true">${[1, 2, 3, 4].map((step) => `<i class="${step <= steps ? "filled" : ""}"></i>`).join("")}</span>`; };
const mark = (size) => `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="11"/><path d="M12 15h24M12 24h18M12 33h8v-5h6"/></svg>`;

const base = `
body { margin: 0; }
.canvas { position: relative; overflow: hidden; background: var(--bg); color: var(--ink); font-family: var(--font); }
.id { display: flex; align-items: center; gap: 14px; }
.mark rect { fill: var(--accent); } .mark path { fill: none; stroke: var(--on-accent); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.wordmark { font-weight: 750; letter-spacing: -0.01em; }
.glyph .g-fill { fill: currentColor; } .glyph .g-line { fill: none; stroke: currentColor; stroke-width: 1.8; } .glyph .g-dash { stroke-dasharray: 2.6 2.2; }
.glyph .g-stop-fill { fill: var(--stop); } .glyph .g-stop-line { fill: none; stroke: var(--stop); stroke-width: 2.4; stroke-linecap: round; }
.ladder { display: inline-flex; align-items: end; gap: 4px; }
.ladder i { display: block; width: 16px; box-shadow: inset 0 0 0 1.5px var(--line-strong); }
.ladder i:nth-child(1) { height: 9px; } .ladder i:nth-child(2) { height: 14px; } .ladder i:nth-child(3) { height: 19px; } .ladder i:nth-child(4) { height: 24px; } .ladder i:nth-child(5) { height: 29px; } .ladder i:nth-child(6) { height: 34px; }
.ladder i.filled { background: var(--ink); box-shadow: none; }
.bars { display: inline-flex; align-items: end; gap: 3px; }
.bars i { display: block; width: 7px; box-shadow: inset 0 0 0 1.3px currentColor; }
.bars i:nth-child(1) { height: 7px; } .bars i:nth-child(2) { height: 12px; } .bars i:nth-child(3) { height: 17px; } .bars i:nth-child(4) { height: 22px; }
.bars i.filled { background: currentColor; }
`;
const page = (title, css, body, theme = "light") => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><title>${escape(title)}</title>
<link rel="stylesheet" href="../../styles.css"><style>${base}${css}</style></head><body>${body}</body></html>`;

function record() {
  return `<div class="slip">
  <div class="slip-head"><div><span class="slip-kicker">${escape(group.label)} · lead option</span><h2>${escape(lead.name)}</h2></div><span class="slip-code">${escape(lead.license || "")}</span></div>
  <div class="channel"><span class="ch-name">Decision</span><div class="ch-body ch-decision">${glyph(lead.decision)}<b>${escape(lead.decision)}</b><span>${escape(plainFrom("decisionPlain", lead.decision))}</span></div></div>
  <div class="channel"><span class="ch-name">Evidence</span><div class="ch-body">${ladder(lead.evidenceLevel, true)}<b>${escape(lead.evidenceLevel)}</b><span>${escape(plainFrom("evidencePlain", lead.evidenceLevel))}</span></div></div>
  <div class="channel"><span class="ch-name">Risk</span><div class="ch-body ch-risk">${riskBars(lead.riskLevel)}<b>${escape(lead.riskLevel)}</b><span>${escape(lead.risks[0])}</span></div></div>
  <div class="channel"><span class="ch-name">Fit</span><div class="ch-body"><span class="fit">Best for: ${escape(lead.bestFor[0])}</span></div></div>
  <p class="next"><b>Next proof:</b> ${escape(plainFrom("nextEvidencePlain", lead.evidenceLevel))}</p></div>`;
}
const slipCss = `
.slip { border: 1.5px solid var(--line-strong); border-radius: 12px; background: var(--surface); padding: 22px 26px 20px; }
.slip-head { display: flex; justify-content: space-between; align-items: start; padding-bottom: 12px; border-bottom: 2px solid var(--ink); }
.slip-kicker { font-size: 15px; font-weight: 700; color: var(--muted); }
.slip h2 { margin: 2px 0 0; font-size: 34px; letter-spacing: -0.01em; }
.slip-code { font: 600 15px/1 var(--mono); color: var(--muted); margin-top: 6px; }
.channel { display: grid; grid-template-columns: 112px 1fr; gap: 16px; align-items: center; min-height: 62px; border-bottom: 1px solid var(--line); }
.ch-name { font-size: 15px; font-weight: 800; color: var(--muted); }
.ch-body { display: flex; align-items: center; gap: 12px; font-size: 18px; }
.ch-body b { font: 700 18px/1 var(--mono); }
.ch-body span { color: var(--ink-2); }
.ch-decision b { font-size: 20px; }
.ch-risk { color: var(--ink); }
.fit { color: var(--ink) !important; }
.next { margin: 14px 0 0; padding: 12px 14px; border-radius: 8px; background: var(--accent-soft); font-size: 17px; }
`;

const hero = (theme) => page("Tool Research Ledger hero", `${slipCss}
.canvas { width: 1280px; height: 700px; padding: 40px 48px; display: grid; grid-template-columns: 1fr 640px; gap: 18px 56px; align-content: start; align-items: center; }
.id { grid-column: 1 / -1; }
.id .wordmark { font-size: 27px; }
h1 { margin: 26px 0 18px; font-size: 52px; line-height: 1.04; letter-spacing: -0.02em; }
.lede { margin: 0 0 24px; font-size: 21px; line-height: 1.45; color: var(--ink-2); }
.path { display: flex; flex-wrap: wrap; gap: 8px 10px; align-items: center; margin: 0 0 22px; font-size: 18px; font-weight: 700; }
.path span { color: var(--muted); font-weight: 600; }
.ceiling { margin: 0; padding: 14px 16px; border: 1.5px solid var(--line-strong); border-radius: 8px; font-size: 17px; color: var(--ink-2); }
.ceiling b { color: var(--ink); }
.slip { margin-top: 18px; }
`, `<div class="canvas"><div class="id">${mark(46)}<span class="wordmark">Tool Research Ledger</span></div>
<div><h1>Find a tool for the job, and see how much proof stands behind it.</h1>
<p class="lede">For technical leads choosing open-source tools: ${catalog.tools.length} tools across ${catalog.capabilityGroups.length} job families. Fit, evidence, decision, and risk stay in separate channels.</p>
<p class="path">Project need <span>→</span> candidates <span>→</span> evidence <span>→</span> decision</p>
<p class="ceiling"><b>Every entry is E0, source reviewed.</b> All ${e0} of ${catalog.tools.length}. A retained project trial is the only way up; none has moved yet.</p></div>
${record()}</div>`, theme);

const social = page("Tool Research Ledger social preview", `${slipCss}
.canvas { width: 1280px; height: 640px; display: grid; grid-template-columns: 600px 1fr; }
.left { background: var(--accent); color: var(--on-accent); padding: 72px 64px; display: flex; flex-direction: column; justify-content: space-between; }
.left .mark rect { fill: var(--on-accent); } .left .mark path { stroke: var(--accent); }
.left .wordmark { font-size: 32px; }
.left h1 { margin: 0; font-size: 50px; line-height: 1.06; letter-spacing: -0.02em; }
.left p { margin: 0; font-size: 20px; opacity: .92; }
.right { padding: 72px 64px; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
.row { display: grid; grid-template-columns: 150px 1fr; align-items: center; gap: 18px; }
.row > span { font-size: 17px; font-weight: 800; color: var(--muted); }
.decisions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 22px; font: 700 17px/1 var(--mono); }
.decisions div { display: flex; align-items: center; gap: 8px; }
.hold { color: var(--stop); }
.ev { display: flex; align-items: end; gap: 16px; font: 700 18px/1 var(--mono); }
.ceil { margin-top: 6px; padding: 14px 16px; border-radius: 8px; background: var(--surface-2); font-size: 18px; }
`, `<div class="canvas"><div class="left"><div class="id">${mark(56)}<span class="wordmark">Tool Research Ledger</span></div>
<h1>Choose the tool. See the proof.</h1><p>${catalog.tools.length} open-source tools · ${catalog.capabilityGroups.length} job families</p></div>
<div class="right"><div class="row"><span>Evidence</span><div class="ev">${ladder("E0", true)}<span>E0 → E5</span></div></div>
<div class="row"><span>Decision</span><div class="decisions"><div>${glyph("PILOT", 18)}PILOT ${count("PILOT")}</div><div>${glyph("CONDITIONAL", 18)}CONDITIONAL ${count("CONDITIONAL")}</div><div>${glyph("REFERENCE", 18)}REFERENCE ${count("REFERENCE")}</div><div>${glyph("WATCH", 18)}WATCH ${count("WATCH")}</div><div class="hold">${glyph("HOLD", 18)}HOLD ${count("HOLD")}</div><div class="hold">${glyph("REJECT", 18)}REJECT ${count("REJECT")}</div></div></div>
<p class="ceil">Every entry is source reviewed (E0). Shape and label carry each decision.</p></div></div>`);

const views = [
  ["view-shortlist", "cap-shortlist.png", 900, "A job becomes a short, explained list",
    ["The lead carries its permitted action, decision basis, what still blocks confidence, and the proof needed next.",
      "Alternatives say why they are not the lead and what would move them forward.",
      "Any two can be selected for side-by-side comparison."]],
  ["view-compare", "cap-compare.png", 900, "Two similar tools, compared on the same channels",
    ["Decision, evidence, and risk line up so a difference in permission is visible at once.",
      "Evidence is the same E0 ladder for both: neither has been run in a project trial.",
      "The comparison never merges the channels into a score."]],
  ["view-evidence", "cap-evidence.png", 900, "What produced the evidence, and what comes next",
    ["The evidence runway shows the level reached and every level still open.",
      "Next promotion names the exact proof a trial must keep: task, output, checks, limits, rollback.",
      "Source links go to the third-party repository; nothing is redistributed."]],
  ["view-map", "cap-map.png", 900, "Where the portfolio can act, and where proof is thin",
    [`${catalog.capabilityGroups.length} families, each with its option count, leading option, decision, evidence, and elevated-risk concentration.`,
      "Elevated risk is counted per family and marked in stop red, so concentration is visible before a choice.",
      "The next research move comes from the lead's recorded trigger or evidence requirement."]]
];
const viewPage = ([, capture, width, title, notes]) => page(title, `
.canvas { width: ${width + 540}px; display: grid; grid-template-columns: ${width}px 1fr; gap: 56px; padding: 48px; align-items: start; }
.shot { display: block; width: ${width}px; border: 1.5px solid var(--line-strong); border-radius: 8px; }
.id .wordmark { font-size: 21px; }
h2 { margin: 28px 0 22px; font-size: 32px; line-height: 1.12; }
ol { margin: 0; padding: 0; list-style: none; counter-reset: n; }
li { counter-increment: n; display: grid; grid-template-columns: 34px 1fr; gap: 12px; margin: 0 0 18px; font-size: 20px; line-height: 1.45; color: var(--ink-2); }
li::before { content: counter(n); display: grid; place-items: center; width: 30px; height: 30px; border-radius: 7px; background: var(--accent); color: var(--on-accent); font: 700 15px/1 var(--mono); }
.foot { margin-top: 24px; font-size: 15px; color: var(--muted); }
`, `<div class="canvas"><img class="shot" src="${capture}" alt=""><div><div class="id">${mark(36)}<span class="wordmark">Tool Research Ledger</span></div>
<h2>${escape(title)}</h2><ol>${notes.map((note) => `<li>${escape(note)}</li>`).join("")}</ol><p class="foot">Captured from the live ledger · ${catalog.tools.length} source-reviewed entries</p></div></div>`);

for (const theme of ["light", "dark"]) fs.writeFileSync(path.join(build, `hero-${theme}.html`), hero(theme));
fs.writeFileSync(path.join(build, "social.html"), social);
for (const view of views) fs.writeFileSync(path.join(build, `${view[0]}.html`), viewPage(view));

const executablePath = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((candidate) => fs.existsSync(candidate));
const browser = await chromium.launch({ executablePath });
const app = pathToFileURL(path.join(root, "index.html")).href;
async function open(target, { width, height, scale = 1 }) {
  const tab = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: "reduce" });
  await tab.goto(target.startsWith("file:") ? target : pathToFileURL(target).href, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  return tab;
}
const query = "turn scanned PDFs into reliable data";

// Captures of the live ledger at the width they are displayed.
let tab = await open(app, { width: 900, height: 1100, scale: 2 });
await tab.fill("#jobSearch", query); await tab.click("#jobSearchForm button");
await tab.waitForSelector(".recommendation-card");
await tab.locator("#recommendationGrid").screenshot({ path: path.join(build, "cap-shortlist.png") });
const compare = tab.locator("[data-compare-tool]");
await compare.nth(0).click(); await compare.nth(1).click(); await tab.click("#compareSelected");
await tab.locator("#compareDialog .dialog-shell").screenshot({ path: path.join(build, "cap-compare.png") });
await tab.keyboard.press("Escape");
await tab.locator(".recommendation-card [data-open-tool]").first().click();
const clipTo = async (selector, file, maxHeight) => {
  const box = await tab.locator(selector).boundingBox();
  await tab.screenshot({ path: path.join(build, file), clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, maxHeight) } });
};
await clipTo("#detailDialog .dialog-shell", "cap-evidence.png", 860);
await tab.keyboard.press("Escape");
await tab.evaluate(() => document.getElementById("capability-map").scrollIntoView({ block: "start" }));
await clipTo("#capability-map", "cap-map.png", 1000);
await tab.close();

for (const theme of ["light", "dark"]) {
  tab = await open(path.join(build, `hero-${theme}.html`), { width: 1280, height: 700, scale: 1.5 });
  await tab.screenshot({ path: path.join(out, `hero-${theme}.png`) });
  await tab.close();
}
tab = await open(path.join(build, "social.html"), { width: 1280, height: 640 });
await tab.screenshot({ path: path.join(out, "social-preview.png") });
await tab.close();
for (const [name] of views) {
  tab = await open(path.join(build, `${name}.html`), { width: 1440, height: 600, scale: 1.5 });
  await tab.locator(".canvas").screenshot({ path: path.join(out, `${name}.png`) });
  await tab.close();
}

// Demo: one complete job in the live interface, with a caption bar added for the recording only.
tab = await open(app, { width: 1280, height: 800 });
const caption = (text) => tab.evaluate((value) => {
  let bar = document.getElementById("rec-caption");
  if (!bar) {
    bar = document.createElement("div"); bar.id = "rec-caption";
    bar.style.cssText = "position:fixed;left:24px;right:24px;bottom:20px;z-index:2147483647;padding:14px 18px;border-radius:8px;background:var(--ink);color:var(--bg);font:700 19px/1.35 var(--font)";
    document.body.append(bar);
  }
  const top = document.querySelector("dialog[open]");
  (top || document.body).append(bar);
  bar.textContent = value;
}, text);
const list = [];
let frame = 0;
const shoot = async (seconds) => {
  const file = `f${String(frame++).padStart(2, "0")}.png`;
  await tab.screenshot({ path: path.join(frames, file) });
  list.push(`file '${file}'`, `duration ${seconds}`);
};
await caption("1 · Start with the job, in plain words."); await shoot(1.6);
for (const length of [10, 22, query.length]) { await tab.fill("#jobSearch", query.slice(0, length)); await shoot(0.45); }
await tab.click("#jobSearchForm button"); await tab.waitForSelector(".recommendation-card");
await tab.evaluate(() => document.getElementById("workspace").scrollIntoView({ block: "start" }));
await caption(`2 · A short list: ${lead.name} leads, with its permitted action and the proof it still needs.`); await shoot(3);
await tab.locator("[data-compare-tool]").nth(0).click(); await tab.locator("[data-compare-tool]").nth(1).click();
await tab.click("#compareSelected");
await caption("3 · Compare two candidates on decision, evidence, and risk, side by side."); await shoot(3);
await tab.keyboard.press("Escape");
await tab.locator(".recommendation-card [data-open-tool]").first().click();
await caption("4 · Open the evidence: E0 source review, every level still open, and the exact next test."); await shoot(3.4);
list.push(`file 'f${String(frame - 1).padStart(2, "0")}.png'`);
fs.copyFileSync(path.join(frames, "f00.png"), path.join(out, "demo-poster.png"));
await tab.close();
await browser.close();

fs.writeFileSync(path.join(frames, "list.txt"), `${list.join("\n")}\n`);
const ffmpeg = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit", cwd: frames });
ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-vf",
  "fps=6,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none",
  "-loop", "0", path.join(out, "demo.gif")]);
ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-movflags", "+faststart", "-an", path.join(out, "demo.mp4")]);
for (const file of fs.readdirSync(out).sort()) console.log(`${file} ${(fs.statSync(path.join(out, file)).size / 1024).toFixed(0)}KB`);
console.log(`RENDER_OK frames=${frame}`);
