import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Builds data/catalog.json and data/catalog.js from the owner's ledger export.
// Usage: node scripts/import-export.mjs [path/to/ledger-export.json]
// With a path, the export is first copied to data/ledger-export.json; without one, the kept copy is used.
// Grades, decisions, safety, uses, packs and lessons come only from the export. From the previous catalog the
// script keeps public search structure: tags, project fit, pinned source revisions and the job families.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kept = path.join(root, "data", "ledger-export.json");
const source = process.argv[2];
if (source) fs.copyFileSync(source, kept);
const exp = JSON.parse(fs.readFileSync(kept, "utf8"));
if (exp.schema !== "tool-research-ledger-export/1") throw new Error(`Unexpected export schema ${exp.schema}`);
const previous = JSON.parse(fs.readFileSync(path.join(root, "data", "catalog.json"), "utf8"));
const before = new Map(previous.tools.map((tool) => [tool.id, tool]));
const oldLevels = new Map(previous.evidenceLevels.map((level) => [level.id, level]));

// Families for tools that were not in the previous catalog. Every tool lands in one family.
const familyOf = {
  "field-fusion": "audit-finance", tesseract: "document-intelligence", khoj: "knowledge-research", "last30days-skill": "knowledge-research",
  "playwright-core": "development-control", "owasp-error-handling": "development-control", scrapling: "office-data", cindy: "agent-platforms",
  "transitions-dev": "design-quality", "error-handling-ux": "design-quality", "microinteractions-skill": "design-quality", "awesome-design-tools": "design-quality",
  "animate-css": "design-quality", "design-to-code-guide": "design-quality", "awesome-frontend-system-design": "design-quality",
  "ledger-intake": "skill-governance", "ledger-patterns": "skill-governance",
  hyperframes: "video-voice", ffmpeg: "video-voice", "kokoro-onnx": "video-voice", manim: "video-voice", voicestudio: "video-voice",
  "remotion-skills": "video-voice", "claude-video": "video-voice", moneyprinterturbo: "video-voice", "ledger-watch": "video-voice"
};
// On a re-run the family already exists; its members are kept so the import can be repeated.
const videoVoice = { id: "video-voice", label: "Video and voice", purpose: "Render, narrate, caption and check short videos", toolIds: [...(previous.capabilityGroups.find((group) => group.id === "video-voice")?.toolIds || [])], lead: "HyperFrames to render; FFmpeg to mix and measure", useWhen: "A short explainer video needs a voice, captions and a check before it ships.", leadToolId: "hyperframes" };
const groups = previous.capabilityGroups.filter((group) => group.id !== "video-voice").map((group) => ({ ...group, toolIds: [...group.toolIds] }));
groups.push(videoVoice);
const groupById = new Map(groups.map((group) => [group.id, group]));

const tools = exp.tools.map((tool) => {
  const old = before.get(tool.id) || {};
  if (!old.id) {
    const family = groupById.get(familyOf[tool.id]);
    if (!family) throw new Error(`${tool.id}: new tool has no job family`);
    if (!family.toolIds.includes(tool.id)) family.toolIds.push(tool.id);
  }
  const record = { ...tool, tags: old.tags || [], projectFit: old.projectFit || {} };
  if (old.sourceRevision) record.sourceRevision = old.sourceRevision;
  return record;
});
// Leads stay the previous choice unless a family member now has more proof.
const order = { E0: 0, E1: 1, E2: 2, E3: 3, E4: 4, E5: 5 };
const toolById = new Map(tools.map((tool) => [tool.id, tool]));
for (const group of groups) {
  const best = [...group.toolIds].sort((a, b) => order[toolById.get(b).evidenceLevel] - order[toolById.get(a).evidenceLevel])[0];
  if (order[toolById.get(best).evidenceLevel] > order[toolById.get(group.leadToolId)?.evidenceLevel ?? "E0"]) group.leadToolId = best;
}

const categories = exp.categories.map((category) => previous.categories.find((item) => item.id === category.id) || category);
const catalog = {
  schemaVersion: "3.0.0",
  meta: {
    title: "Tool Research Ledger",
    updated: exp.exported,
    source: exp.schema,
    gradeSource: "Grades come from the owner's recorded use of each tool in named projects. A person approves every grade change before it is exported.",
    belowE1: "E0 means the tool was only read about: its documentation and license, with no recorded use here yet.",
    privacy: "Exported from a private ledger and cleaned before publication. Private documents, credentials, raw OCR text and transaction rows are excluded.",
    reports: previous.meta.reports
  },
  grading: { ...previous.grading, decisionScale: exp.decisionScale },
  categories,
  evidenceLevels: exp.evidenceLevels.map((level) => ({ ...level, verb: oldLevels.get(level.id)?.verb, description: oldLevels.get(level.id)?.description })),
  capabilityGroups: groups,
  tools,
  uses: exp.uses,
  packs: exp.packs,
  lessons: exp.lessons
};
const json = `${JSON.stringify(catalog, null, 2)}\n`;
fs.writeFileSync(path.join(root, "data", "catalog.json"), json);
fs.writeFileSync(path.join(root, "data", "catalog.js"), `window.CATALOG = ${json.trimEnd()};\n`);
const above = tools.filter((tool) => tool.evidenceLevel !== "E0").length;
console.log(`IMPORT_OK tools=${tools.length} aboveE0=${above} uses=${catalog.uses.length} packs=${catalog.packs.length} lessons=${catalog.lessons.length} groups=${groups.length}`);
