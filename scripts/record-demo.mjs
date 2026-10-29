import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = process.env.DEMO_URL || "http://127.0.0.1:4173";
const bundledFfmpeg = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages", "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe", "ffmpeg-9.0.2-full_build", "bin", "ffmpeg.exe") : null;
const ffmpeg = process.env.FFMPEG_PATH || (bundledFfmpeg && fs.existsSync(bundledFfmpeg) ? bundledFfmpeg : "ffmpeg");
const output = path.join(root, "docs", "brand", "demo.gif");
const frameRoot = path.join(root, "test-results", "demo-frames");
const candidates = process.platform === "win32" ? [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
] : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];

const executablePath = candidates.find(fs.existsSync);
if (!executablePath) throw new Error("No Chrome or Edge executable found");
if (path.isAbsolute(ffmpeg) && !fs.existsSync(ffmpeg)) throw new Error(`FFmpeg not found: ${ffmpeg}`);

try {
  const response = await fetch(siteUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch {
  throw new Error(`The local site is not running at ${siteUrl}. Start it with \`npm run start\`, then run \`npm run record:demo\`.`);
}

fs.rmSync(frameRoot, { recursive: true, force: true });
fs.mkdirSync(frameRoot, { recursive: true });

const frames = [];
let frameNumber = 0;
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(siteUrl, { waitUntil: "networkidle" });
  await page.locator("#ledgerRows tr").first().waitFor();

  await page.addStyleTag({ content: `
    #demo-caption {
      position: fixed;
      z-index: 10000;
      left: 50%;
      bottom: 26px;
      transform: translateX(-50%);
      max-width: calc(100vw - 48px);
      padding: 11px 18px;
      border: 1px solid rgba(255,255,255,.28);
      border-radius: 999px;
      background: rgba(28,22,25,.92);
      color: #fff;
      box-shadow: 0 12px 36px rgba(0,0,0,.28);
      font: 800 22px/1.25 system-ui, sans-serif;
      letter-spacing: .01em;
      text-align: center;
      pointer-events: none;
    }
  ` });
  await page.evaluate(() => {
    const caption = document.createElement("div");
    caption.id = "demo-caption";
    caption.setAttribute("role", "presentation");
    document.body.append(caption);
  });

  async function setCaption(text) {
    await page.locator("#demo-caption").evaluate((node, value) => { node.textContent = value; }, text);
  }

  async function capture(duration) {
    const name = `frame-${String(frameNumber).padStart(3, "0")}.png`;
    frameNumber += 1;
    await page.screenshot({ path: path.join(frameRoot, name) });
    frames.push({ name, duration });
  }

  await setCaption("1 · Describe the job in everyday words");
  await page.locator("#jobSearch").click();
  await capture(2.2);
  for (const text of ["read", "read text", "read text from", "read text from scanned", "read text from scanned receipts"]) {
    await page.locator("#jobSearch").fill(text);
    await capture(text.endsWith("receipts") ? 1.2 : 0.42);
  }

  await page.locator("#jobSearchForm button").click();
  await page.locator(".recommendation-card").first().waitFor();
  await page.locator("#workspace").evaluate((node) => node.scrollIntoView({ block: "start" }));
  await setCaption("2 · Review the three-tool shortlist");
  await capture(4.2);

  await setCaption("3 · Open the lead tool");
  await capture(1.8);
  await page.locator(".lead-brief [data-open-tool]").click();
  await page.locator("#detailDialog").waitFor({ state: "visible" });
  await page.locator("#detailDialog").evaluate((dialog) => dialog.append(document.querySelector("#demo-caption")));
  await setCaption("4 · Check its grade and “Is it safe?”");
  await capture(3.0);
  await page.locator("#detailBody .safety-section").scrollIntoViewIfNeeded();
  await capture(2.6);

  await page.locator("#detailBody .evidence-runway").scrollIntoViewIfNeeded();
  await setCaption("5 · Follow its path to the next grade");
  await capture(5.0);
  await context.close();
} finally {
  await browser.close();
}

const concatPath = path.join(frameRoot, "frames.txt");
const concatLines = frames.flatMap(({ name, duration }) => [
  `file '${path.join(frameRoot, name).replaceAll("\\", "/").replaceAll("'", "'\\''")}'`,
  `duration ${duration}`
]);
concatLines.push(`file '${path.join(frameRoot, frames.at(-1).name).replaceAll("\\", "/").replaceAll("'", "'\\''")}'`);
fs.writeFileSync(concatPath, `${concatLines.join("\n")}\n`);

const filter = "fps=8,scale=960:-2:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle";
const encoded = spawnSync(ffmpeg, [
  "-hide_banner", "-loglevel", "error", "-y",
  "-f", "concat", "-safe", "0", "-i", concatPath,
  "-filter_complex", filter,
  "-loop", "0", output
], { cwd: root, encoding: "utf8", windowsHide: true });
if (encoded.status !== 0) throw new Error(`FFmpeg failed (${encoded.status}): ${encoded.stderr || encoded.stdout}`);

const gif = fs.readFileSync(output);
const width = gif.readUInt16LE(6);
const limit = 5 * 1024 * 1024;
if (width !== 960) throw new Error(`Expected a 960 px GIF, got ${width} px`);
if (gif.length >= limit) throw new Error(`GIF is ${gif.length} bytes; it must be under ${limit}`);

const seconds = frames.reduce((sum, frame) => sum + frame.duration, 0);
console.log(`DEMO_OK width=${width} duration=${seconds.toFixed(2)}s bytes=${gif.length} frames=${frames.length}`);
