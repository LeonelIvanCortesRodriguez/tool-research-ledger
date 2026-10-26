import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const screenshotRoot = process.env.UPDATE_SCREENSHOTS === "1" ? path.join(root, "docs", "images") : path.join(root, "test-results", "browser");
fs.mkdirSync(screenshotRoot, { recursive: true });
const candidates = process.platform === "win32" ? [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
] : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
const executablePath = candidates.find(fs.existsSync);
if (!executablePath) throw new Error("No Chrome/Edge executable found for browser QA");
const browser = await chromium.launch({ executablePath, headless: true });
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
async function run(viewport, mobile, screenshot) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, "index.html")).href);
  await page.waitForSelector("#ledgerRows tr");
  await page.locator("#themeToggle").click();
  assert(await page.locator("html").getAttribute("data-theme") === "dark", `${mobile}: visible theme control did not switch theme`);
  if (mobile === "desktop") await page.screenshot({ path: path.join(screenshotRoot, "ledger-dark.png") });
  await page.locator("#themeToggle").click();
  assert(await page.locator("nav").isVisible(), `${mobile}: primary navigation is hidden`);
  await page.locator(mobile === "desktop" ? "#shareTop" : "#shareResults").click();
  await page.locator("#downloadJson").click();
  assert(await page.locator("#packetFallback").isVisible(), `${mobile}: direct-file JSON fallback is hidden`);
  const packet = await page.locator("#packetText").inputValue();
  assert(JSON.parse(packet).source === "Tool Research Ledger guided decision workspace", `${mobile}: direct-file JSON packet is invalid`);
  await page.locator('[data-close="shareDialog"]').click();
  assert(await page.locator("#ledgerRows tr").count() > 0, `${mobile}: ledger did not render`);
  const evidenceStates = await page.locator("#evidenceScale [data-evidence-level]").evaluateAll((nodes) => [...new Set(nodes.map((node) => node.dataset.evidenceLevel))]);
  assert(JSON.stringify(evidenceStates.sort()) === JSON.stringify(["E0", "E1", "E2", "E3", "E4", "E5"]), `${mobile}: six evidence states not rendered`);
  const decisions = await page.locator("#decisionFilter option").allTextContents();
  assert(["IMPLEMENT", "PILOT", "CONDITIONAL", "REFERENCE", "WATCH", "HOLD", "REJECT"].every((item) => decisions.includes(item)), `${mobile}: decision states incomplete`);
  await page.keyboard.press("/");
  assert(await page.locator("#jobSearch").evaluate((node) => node === document.activeElement), `${mobile}: slash shortcut did not focus search`);
  await page.locator("#jobSearch").fill("OCR scanned PDF");
  await page.locator("#jobSearchForm button").click();
  await page.waitForSelector(".recommendation-card");
  assert(await page.locator(".recommendation-card").count() >= 2, `${mobile}: search produced fewer than two recommendations`);
  const compare = page.locator("[data-compare-tool]");
  await compare.nth(0).click(); await compare.nth(1).click();
  assert(await page.locator("#compareSelected").isEnabled(), `${mobile}: comparison did not enable`);
  await page.locator("#compareSelected").click();
  assert(await page.locator("#compareDialog").evaluate((node) => node.open), `${mobile}: comparison dialog did not open`);
  await page.keyboard.press("Escape");
  await page.locator("#ledgerSearch").fill("PaddleOCR");
  assert(await page.locator("#ledgerRows tr").count() >= 1 && await page.locator("#ledgerRows").innerText().then((text) => text.includes("PaddleOCR")), `${mobile}: ledger search/filter failed`);
  await page.locator("#sortFilter").selectOption("decision");
  await page.locator("#ledgerRows [data-open-tool]").first().click();
  assert(await page.locator("#detailDialog").evaluate((node) => node.open), `${mobile}: evidence detail did not open`);
  const detail = await page.evaluate(() => ({
    runwayScroll: document.querySelector(".evidence-runway").scrollWidth,
    runwayClient: document.querySelector(".evidence-runway").clientWidth,
    falseRepoLink: !!document.querySelector('#detailBody a.repo-link[href=""]')
  }));
  assert(detail.runwayScroll <= detail.runwayClient + 1, `${mobile}: evidence runway clips or overflows (${detail.runwayScroll}/${detail.runwayClient})`);
  assert(!detail.falseRepoLink, `${mobile}: empty repository action rendered`);
  await page.keyboard.press("Escape");
  const a11y = await page.evaluate(() => ({
    motion: document.documentElement.dataset.motion,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    unlabeled: [...document.querySelectorAll("button")].filter((el) => !el.textContent.trim() && !el.getAttribute("aria-label")).length,
    short: [...document.querySelectorAll("button, input, select")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 40; }).length
  }));
  assert(a11y.motion === "reduced", `${mobile}: reduced motion not honored`);
  assert(!a11y.overflow, `${mobile}: horizontal overflow detected`);
  assert(a11y.unlabeled === 0, `${mobile}: unlabeled controls detected`);
  assert(a11y.short === 0, `${mobile}: controls below 40px detected`);
  assert(errors.length === 0, `${mobile}: console errors: ${errors.join(" | ")}`);
  await page.screenshot({ path: path.join(screenshotRoot, screenshot), fullPage: true });
  await context.close();
}
await run({ width: 1440, height: 1000 }, "desktop", "ledger-desktop.png");
await run({ width: 390, height: 844 }, "mobile", "ledger-mobile.png");
await browser.close();
if (failures.length) throw new Error(`BROWSER_QA_FAIL\n${failures.join("\n")}`);
console.log("BROWSER_QA_OK search filter compare evidence decisions focus responsive reduced-motion console");
