// Integrated loudness and true peak of a file, measured by FFmpeg's EBU R128 loudnorm filter.
// Usage as a check: node video/loudness.mjs <file>...
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function loudness(file) {
  const run = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(`ffmpeg loudness measurement failed: ${run.stderr.slice(-400)}`);
  return JSON.parse(run.stderr.slice(run.stderr.lastIndexOf("{"), run.stderr.lastIndexOf("}") + 1));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let failed = false;
  for (const file of process.argv.slice(2)) {
    const m = loudness(file);
    const ok = Math.abs(Number(m.input_i) + 16) <= 1;
    failed ||= !ok;
    console.log(`${ok ? "PASS" : "FAIL"} ${path.basename(file)} ${Number(m.input_i).toFixed(1)} LUFS (target -16 within 1 LU), true peak ${m.input_tp} dBTP`);
  }
  process.exit(failed ? 1 : 0);
}
