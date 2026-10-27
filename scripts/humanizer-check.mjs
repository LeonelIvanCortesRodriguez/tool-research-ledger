import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proseFiles = ["README.md", "PRODUCT.md", "SECURITY.md", "THIRD_PARTY_NOTICES.md", "docs/EVIDENCE_MODEL.md", "docs/METHODOLOGY.md", "docs/SAMPLE_DECISION.md", "docs/LICENSE_REVIEW.md", "docs/BATCH_2026-10-26-I.md", "index.html", "app.js"];
const patterns = [
  [/\bnot (?:just|only|merely)\b/gi, "staged not-X-but-Y contrast"],
  [/\b(?:at its core|what really matters|here(?:'|’)s the thing|let(?:'|’)s (?:dive|explore|break)|let that sink in)\b/gi, "staged AI phrase"],
  [/\b(?:stands as a testament|pivotal|tapestry|showcas(?:e|es|ing)|delve)\b/gi, "inflated AI phrase"],
  [/[—–]/g, "dash used as prose punctuation"]
];
const findings = [];
for (const relative of proseFiles) {
  const text = fs.readFileSync(path.join(root, relative), "utf8");
  for (const [pattern, label] of patterns) if (pattern.test(text)) findings.push(`${relative}: ${label}`);
}
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "catalog.json"), "utf8"));
for (const tool of catalog.tools) {
  const publicRecord = JSON.stringify(tool);
  if (/\b(installed|validated|proven|proved|passed|deployed)\b/i.test(publicRecord)) findings.push(`${tool.id}: public record claims excluded operational proof`);
}
if (findings.length) throw new Error(`HUMANIZER_CHECK_FAIL\n${findings.join("\n")}`);
console.log(`HUMANIZER_CHECK_OK files=${proseFiles.length} tools=${catalog.tools.length}`);
