import { validateCatalog } from "./lib/validation.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = JSON.parse(await readFile(path.join(root, "data", "catalog.json"), "utf8"));
const invalidScale = structuredClone(baseline);
invalidScale.evidenceLevels[5].id = "E4";
if (!validateCatalog(invalidScale).some((error) => error.includes("Evidence scale"))) throw new Error("Evidence-scale mutation escaped validation");

const missingSource = structuredClone(baseline);
missingSource.tools[0].repoUrl = "";
if (!validateCatalog(missingSource).some((error) => error.includes("E0 requires a public repository URL"))) throw new Error("Missing-source mutation escaped validation");
console.log("MUTATION_OK invalid evidence scale and missing E0 source were rejected");
