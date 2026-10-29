import { validateCatalog } from "./lib/validation.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = JSON.parse(await readFile(path.join(root, "data", "catalog.json"), "utf8"));
if (validateCatalog(baseline).length) throw new Error("Baseline catalog must validate before mutation");
const invalidScale = structuredClone(baseline);
invalidScale.evidenceLevels[5].id = "E4";
if (!validateCatalog(invalidScale).some((error) => error.includes("Evidence scale"))) throw new Error("Evidence-scale mutation escaped validation");

const missingSource = structuredClone(baseline);
missingSource.tools.find((tool) => tool.origin === "external" && tool.repoUrl).repoUrl = "";
if (!validateCatalog(missingSource).some((error) => error.includes("needs a public repository URL"))) throw new Error("Missing-source mutation escaped validation");

// A grade above E0 without its recorded basis must be rejected.
const unbackedGrade = structuredClone(baseline);
Object.assign(unbackedGrade.tools.find((tool) => tool.evidenceLevel === "E0"), { evidenceLevel: "E2", gradeBasis: "" });
if (!validateCatalog(unbackedGrade).some((error) => error.includes("needs a recorded grade basis"))) throw new Error("Unbacked-grade mutation escaped validation");

const unknownUse = structuredClone(baseline);
unknownUse.uses[0].toolId = "not-a-tool";
if (!validateCatalog(unknownUse).some((error) => error.includes("unknown tool not-a-tool"))) throw new Error("Unknown-use mutation escaped validation");
console.log("MUTATION_OK invalid evidence scale, missing source, unbacked grade and unknown use were rejected");
