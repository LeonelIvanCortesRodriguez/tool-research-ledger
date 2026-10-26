import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", "node_modules", "release"]);
const binary = /\.(png|jpg|jpeg|gif|webp|ico|zip)$/i;
const rules = [
  [/[A-Za-z]:\\Users\\[^\\\s]+/g, "absolute Windows user path"],
  [/\b(?:sk|ghp|github_pat|xox[baprs])-[-A-Za-z0-9_]{16,}\b/g, "credential-like token"],
  [/(?:api[_-]?key|secret|password|access[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/gi, "assigned secret"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, "private key"]
];
const findings = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (!binary.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      for (const [pattern, label] of rules) if (pattern.test(text)) findings.push(`${path.relative(root, full)}: ${label}`);
    }
  }
}
walk(root);
if (fs.existsSync(path.join(root, ".git"))) {
  const { execFileSync } = await import("node:child_process");
  const identity = execFileSync("git", ["log", "-1", "--format=%an <%ae>"], { cwd: root, encoding: "utf8" }).trim();
  if (identity !== "Leonel <tool-research-ledger@users.noreply.github.com>") findings.push("Git commit identity is not the approved public first-name/noreply identity");
}
if (findings.length) throw new Error(`PRIVACY_SCAN_FAIL\n${findings.join("\n")}`);
console.log("PRIVACY_SCAN_OK no private paths, assigned secrets, credential-like tokens, or private keys detected");
