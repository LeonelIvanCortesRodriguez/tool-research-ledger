import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proseFiles = ["README.md", "PRODUCT.md", "SECURITY.md", "THIRD_PARTY_NOTICES.md", "docs/EVIDENCE_MODEL.md", "docs/METHODOLOGY.md", "docs/SAMPLE_DECISION.md", "docs/LICENSE_REVIEW.md", "docs/BATCH_2026-10-26-I.md", "README.es.md", "index.html", "app.js"];
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
// An E0 tool was only read about, so its claims must not sound like recorded use. Grade bases and safety notes
// may say "not installed"; the summary and strengths may not claim it.
for (const tool of catalog.tools.filter((item) => item.evidenceLevel === "E0")) {
  const claims = JSON.stringify([tool.summary, ...(tool.bestFor || [])]);
  if (/\b(installed|validated|proven|proved|passed|deployed)\b/i.test(claims)) findings.push(`${tool.id}: E0 record claims proof it does not have`);
}
if (findings.length) throw new Error(`HUMANIZER_CHECK_FAIL\n${findings.join("\n")}`);
console.log(`HUMANIZER_CHECK_OK files=${proseFiles.length} tools=${catalog.tools.length}`);
