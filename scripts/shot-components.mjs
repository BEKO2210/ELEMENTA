/**
 * Rendert jede Komponente exakt mit der echten sandbox.html (direkt als Top-Frame
 * geladen; die Render-Nachricht wird an window selbst gepostet → e.source ===
 * window.parent) und speichert einen Screenshot zum visuellen Prüfen.
 *
 * Start: node scripts/shot-components.mjs <components.mjs> [outDir]
 */
import puppeteer from "puppeteer-core";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const inFile = process.argv[2];
const outDir = process.argv[3] || "scratchpad-gen/shots";
if (!inFile) { console.error("Usage: node scripts/shot-components.mjs <file.mjs> [outDir]"); process.exit(1); }

const mod = await import(pathToFileURL(resolve(inFile)).href);
const components = mod.default;
const BG = "#0b0b13";

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

let ok = 0, fail = 0;
for (const c of components) {
  const page = await browser.newPage();
  await page.setViewport({ width: 520, height: 340, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("http://localhost:3000/sandbox.html", { waitUntil: "networkidle2", timeout: 60000 });
  // Stage zentrieren + Website-Hintergrund fürs Foto
  await page.evaluate((bg) => {
    document.body.style.background = bg;
    const s = document.getElementById("stage");
    if (s) { s.style.minHeight = "100vh"; s.style.display = "flex"; s.style.alignItems = "center"; s.style.justifyContent = "center"; s.style.padding = "24px"; }
  }, BG);
  await page.evaluate((p) => window.postMessage(Object.assign({ type: "elementa:render" }, p), "*"), {
    framework: c.framework, html: c.html || "", css: c.css || "", js: c.js || "", bg: BG, fit: false,
  });

  await new Promise((r) => setTimeout(r, c.framework === "svelte" || c.framework === "react" ? 3800 : 2200));

  // Fehlerbanner der Sandbox erkennen
  const errText = await page.evaluate(() => {
    const e = document.querySelector(".err, #err, [data-error]");
    return e && e.offsetParent ? (e.textContent || "").slice(0, 100) : "";
  }).catch(() => "");

  await page.screenshot({ path: `${outDir}/${c.slug}.png` });
  await page.close();
  if (errText || errors.length) { console.log(`  ✗ ${c.slug} (${c.framework}) — ${(errText || errors[0] || "").slice(0, 90)}`); fail++; }
  else { console.log(`  ✓ ${c.slug} (${c.framework})`); ok++; }
}
await browser.close();
console.log(`\nFertig: ${ok} ok, ${fail} mit Fehler → ${outDir}/`);
