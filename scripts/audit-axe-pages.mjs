// Audit: axe-core auf SEITEN-Ebene (nicht nur Komponenten-Sandbox).
import puppeteer from "puppeteer-core";
import { readFileSync } from "fs";

const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const PAGES = ["/", "/explore", "/c/magnetic-button", "/guides",
  "/guides/glassmorphism-css", "/stats", "/login", "/about", "/impressum", "/datenschutz"];

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 900 });

let total = 0;
for (const p of PAGES) {
  await page.goto("http://localhost:3000" + p, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(axeSource);
  const res = await page.evaluate(async () =>
    await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      // Sandbox-iframes separat geprüft (88/88 pass) — hier nur die Seite selbst
      exclude: [["iframe"]],
    }),
  );
  if (res.violations.length === 0) {
    console.log(`✓ ${p}`);
  } else {
    total += res.violations.length;
    console.log(`✗ ${p}`);
    for (const v of res.violations) {
      console.log(`   [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length}×)`);
      for (const n of v.nodes.slice(0, 2)) console.log(`      → ${n.target[0]}`);
    }
  }
}
console.log(`\n=== ${total} Seiten-Verstöße gesamt ===`);
await browser.close();
