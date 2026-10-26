import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const release = path.join(root, "release");
fs.mkdirSync(release, { recursive: true });
const excluded = new Set([".git", "node_modules", "release", "test-results"]);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full); else files.push(path.relative(root, full).replaceAll("\\", "/"));
  }
}
walk(root);
const inventory = files.map((name) => `${crypto.createHash("sha256").update(fs.readFileSync(path.join(root, name))).digest("hex")}  ${name}`).join("\n") + "\n";
const inventoryPath = path.join(release, "CONTENT_INVENTORY.sha256");
fs.writeFileSync(inventoryPath, inventory);

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buffer) => { let c = 0xffffffff; for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };
const local = [], central = []; let offset = 0;
for (const name of files) {
  const nameBuffer = Buffer.from(name); const data = fs.readFileSync(path.join(root, name)); const crc = crc32(data);
  const header = Buffer.concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(33), u32(crc), u32(data.length), u32(data.length), u16(nameBuffer.length), u16(0), nameBuffer]);
  local.push(header, data);
  central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(33), u32(crc), u32(data.length), u32(data.length), u16(nameBuffer.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBuffer]));
  offset += header.length + data.length;
}
const centralBuffer = Buffer.concat(central);
const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralBuffer.length), u32(offset), u16(0)]);
const zipPath = path.join(release, "tool-research-ledger-public.zip");
fs.writeFileSync(zipPath, Buffer.concat([...local, centralBuffer, end]));
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
console.log(`BUILD_OK files=${files.length}`);
console.log(`ZIP_SHA256=${sha(zipPath)}`);
console.log(`INVENTORY_SHA256=${sha(inventoryPath)}`);
