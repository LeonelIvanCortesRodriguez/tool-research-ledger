import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertCatalog, loadCatalog, validatePublicPaths } from "./lib/validation.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv.includes("--root") ? process.argv[process.argv.indexOf("--root") + 1] : path.join(here, ".."));
const required = ["index.html", "styles.css", "app.js", "motion.js", "data/catalog.js", "data/catalog.json", "data/repository-intake.json", "data/ledger-export.json", "README.md", "README.es.md", "LICENSE", "SECURITY.md", "THIRD_PARTY_NOTICES.md", "docs/EVIDENCE_MODEL.md", "docs/METHODOLOGY.md", "docs/SAMPLE_DECISION.md", "docs/BATCH_2026-10-26-I.md", "docs/images/ledger-desktop.png", "docs/images/ledger-mobile.png", "docs/images/ledger-dark.png"];
for (const file of required) if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);

const catalog = loadCatalog(root);
assertCatalog(catalog);
// The catalog is built from Leonel's export (scripts/import-export.mjs); grades and decisions must match it exactly.
const exported = JSON.parse(fs.readFileSync(path.join(root, "data", "ledger-export.json"), "utf8"));
if (catalog.tools.length !== exported.tools.length) throw new Error(`Expected ${exported.tools.length} tools from the export, found ${catalog.tools.length}`);
const fromExport = new Map(exported.tools.map((tool) => [tool.id, tool]));
for (const tool of catalog.tools) {
  const source = fromExport.get(tool.id);
  if (!source) throw new Error(`${tool.id}: not in the export`);
  for (const field of ["evidenceLevel", "decision", "riskLevel", "gradeBasis"]) if (tool[field] !== source[field]) throw new Error(`${tool.id}: ${field} differs from the export`);
  if (JSON.stringify(tool.safety) !== JSON.stringify(source.safety)) throw new Error(`${tool.id}: safety differs from the export`);
}
if (JSON.stringify(catalog.uses) !== JSON.stringify(exported.uses)) throw new Error("Recorded uses differ from the export");
const aboveE0 = catalog.tools.filter((tool) => tool.evidenceLevel !== "E0").length;
if (aboveE0 !== exported.tools.filter((tool) => tool.evidenceLevel !== "E0").length) throw new Error("Graded tool count differs from the export");
const normalizeRepo = (url) => url.toLowerCase().replace(/\/$/, "");
const intake = JSON.parse(fs.readFileSync(path.join(root, "data", "repository-intake.json"), "utf8"));
const expectedRepos = new Set(intake.repositories.map(normalizeRepo));
const catalogRepos = new Set(catalog.tools.filter((tool) => tool.repoUrl).map((tool) => normalizeRepo(tool.repoUrl)));
if (expectedRepos.size !== 99 || intake.repositories.length !== 99) throw new Error("Conversation intake must contain exactly 99 unique repositories");
const missingRepos = [...expectedRepos].filter((url) => !catalogRepos.has(url));
if (missingRepos.length) throw new Error(`Intake repositories missing from the catalog: ${missingRepos.join(", ")}`);
for (const [id, decision, revision] of [
  ["berth", "PILOT", "97f918afa9ba437cf6efbfb7ca492ef6a5786247"],
  ["swe-af", "REFERENCE", "4d3dfe719e5ce9e2e8cd454722295bbe6512542f"]
]) {
  const record = catalog.tools.find(tool => tool.id === id);
  if (!record || record.decision !== decision || record.evidenceLevel !== "E0" || record.sourceRevision !== revision) {
    throw new Error(`${id}: pinned E0 intake record is missing or altered`);
  }
}
const pathErrors = validatePublicPaths(catalog, root);
if (pathErrors.length) throw new Error(pathErrors.join("\n"));
const json = JSON.parse(fs.readFileSync(path.join(root, "data", "catalog.json"), "utf8"));
if (JSON.stringify(catalog) !== JSON.stringify(json)) throw new Error("catalog.js and catalog.json differ");

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const ref of ["styles.css", "data/catalog.js", "motion.js", "app.js", "docs/METHODOLOGY.md"]) {
  if (!html.includes(ref) || !fs.existsSync(path.join(root, ref))) throw new Error(`Broken app reference: ${ref}`);
}
if (/final\.(css|js)|\.\.\/vendor|\.\.\/data/.test(html)) throw new Error("Prototype-relative dependency remains in index.html");
if (!fs.readFileSync(path.join(root, "README.md"), "utf8").includes("Leonel defined the product goal")) throw new Error("Creator role statement missing");
if (fs.existsSync(path.join(root, "control")) || fs.existsSync(path.join(root, "beta"))) throw new Error("Control or beta tree leaked into candidate");
for (const phrase of ["meta.gradeSource", "meta.belowE1"]) if (!fs.readFileSync(path.join(root, "app.js"), "utf8").includes(phrase)) throw new Error(`The page must show ${phrase}`);
console.log(`VERIFY_OK tools=${catalog.tools.length} graded=${aboveE0} uses=${catalog.uses.length} groups=${catalog.capabilityGroups.length} evidence=${catalog.evidenceLevels.length}`);
