import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

export function loadCatalog(root) {
  const source = fs.readFileSync(path.join(root, "data", "catalog.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: "catalog.js" });
  return sandbox.window.CATALOG;
}

export function validateCatalog(catalog) {
  const errors = [];
  const evidence = ["E0", "E1", "E2", "E3", "E4", "E5"];
  const decisions = ["IMPLEMENT", "PILOT", "CONDITIONAL", "REFERENCE", "WATCH", "HOLD", "REJECT"];
  if (!catalog || typeof catalog !== "object") return ["Catalog is not an object"];
  if (!Array.isArray(catalog.tools) || catalog.tools.length === 0) errors.push("Catalog needs at least one tool");
  if (!Array.isArray(catalog.capabilityGroups) || catalog.capabilityGroups.length === 0) errors.push("Catalog needs at least one capability family");
  const evidenceIds = (catalog.evidenceLevels || []).map((item) => item.id);
  if (JSON.stringify(evidenceIds) !== JSON.stringify(evidence)) errors.push(`Evidence scale must be exactly ${evidence.join(", ")}`);
  const decisionIds = Object.keys(catalog.grading?.decisionScale || {});
  for (const id of decisions) if (!decisionIds.includes(id)) errors.push(`Missing decision state ${id}`);
  const groupIds = new Set((catalog.capabilityGroups || []).map((item) => item.id));
  if (groupIds.size !== catalog.capabilityGroups?.length) errors.push("Capability family IDs must be unique");
  const categoryIds = new Set((catalog.categories || []).map((item) => item.id));
  if (categoryIds.size !== catalog.categories?.length) errors.push("Category IDs must be unique");
  const toolIds = new Set();
  for (const tool of catalog.tools || []) {
    if (!tool.id || toolIds.has(tool.id)) errors.push(`Missing or duplicate tool id: ${tool.id}`);
    toolIds.add(tool.id);
    if (!categoryIds.has(tool.primaryCategory)) errors.push(`${tool.id}: unknown primary category ${tool.primaryCategory}`);
    if (!evidence.includes(tool.evidenceLevel)) errors.push(`${tool.id}: invalid evidence ${tool.evidenceLevel}`);
    if (!decisions.includes(tool.decision)) errors.push(`${tool.id}: invalid decision ${tool.decision}`);
    if (tool.evidenceLevel !== "E0") errors.push(`${tool.id}: public catalog evidence must remain E0 without included proof`);
    if (tool.decision === "IMPLEMENT") errors.push(`${tool.id}: E0 public record cannot authorize implementation`);
    if (tool.assurance || tool.validation) errors.push(`${tool.id}: internal assurance or validation payload leaked into public catalog`);
    if (typeof tool.observedGrade === "number") errors.push(`${tool.id}: unsupported observed grade leaked into public catalog`);
    for (const group of Object.keys(tool.projectFit || {})) if (!groupIds.has(group) && !(catalog.categories || []).some((item) => item.id === group)) errors.push(`${tool.id}: unknown group ${group}`);
    if (tool.findingStatus !== "SOURCE_REVIEWED") errors.push(`${tool.id}: E0 requires source-reviewed status`);
    if (!tool.repoUrl) errors.push(`${tool.id}: E0 requires a public repository URL`);
    else if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(tool.repoUrl)) errors.push(`${tool.id}: invalid GitHub URL`);
  }
  for (const group of catalog.capabilityGroups || []) {
    if (!group.toolIds?.length) errors.push(`${group.id}: family has no options`);
    if (group.leadToolId && !group.toolIds.includes(group.leadToolId)) errors.push(`${group.id}: lead is not a family member`);
    if (new Set(group.toolIds).size !== group.toolIds.length) errors.push(`${group.id}: duplicate family member`);
    for (const id of group.toolIds || []) if (!toolIds.has(id)) errors.push(`${group.id}: unknown member ${id}`);
  }
  return errors;
}

export function validatePublicPaths(catalog, root) {
  const errors = [];
  function walk(value, trail = []) {
    if (Array.isArray(value)) return value.forEach((item, index) => walk(item, trail.concat(index)));
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      const next = trail.concat(key);
      if (typeof item === "string") {
        const normalized = item.replaceAll("\\", "/");
        if (normalized.startsWith("research/")) errors.push(`${next.join(".")}: internal research path is not public`);
        if (/^(docs|scripts)\//.test(normalized) && !fs.existsSync(path.join(root, normalized))) errors.push(`${next.join(".")}: missing public path ${normalized}`);
      }
      walk(item, next);
    }
  }
  walk(catalog);
  return errors;
}

export function assertCatalog(catalog) {
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join("\n"));
}
