/**
 * Echter A11y-Audit: rendert jede Komponente in der Sandbox und lässt axe-core
 * (WCAG 2.x) dagegen laufen. Ergebnis wird ins a11y-Feld der DB geschrieben:
 *   pass = keine Verstöße · warn = mindestens ein Verstoß
 * Wahrheitsregel: NUR echte axe-Ergebnisse, nichts wird geschönt.
 *
 * Start: APPWRITE_API_KEY="<key>" node scripts/a11y-audit.mjs [--dry]
 */
import puppeteer from "puppeteer-core";
import { readFileSync } from "fs";
import { Client, Databases, Query } from "node-appwrite";

const DRY = process.argv.includes("--dry");
const endpoint = "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey && !DRY) { console.error("❌ APPWRITE_API_KEY fehlt (oder --dry nutzen)."); process.exit(1); }

const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");

// Alle Komponenten (öffentlich lesbar)
const client = new Client().setEndpoint(endpoint).setProject(project);
if (apiKey) client.setKey(apiKey);
const db = new Databases(client);
const { documents } = await db.listDocuments("marketplace", "components", [Query.limit(100)]);
console.log(`Audit über ${documents.length} Komponenten…\n`);

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 700 });

const report = [];

for (const doc of documents) {
  try {
    await page.goto("http://localhost:3000/sandbox.html", { waitUntil: "domcontentloaded" });
    // Top-Level geöffnet ist window.parent === window → self-postMessage wird akzeptiert.
    await page.evaluate((payload) => {
      window.postMessage(payload, "*");
    }, {
      type: "elementa:render",
      framework: doc.framework,
      html: doc.html || "",
      css: doc.css || "",
      js: doc.js || "",
      bg: "#0b0b12",
      fit: false,
    });

    // Auf gerenderten Inhalt warten (React/Tailwind laden asynchron)
    await page.waitForFunction(
      () => document.getElementById("__stage")?.children.length > 0,
      { timeout: 15000 },
    );
    await new Promise((r) => setTimeout(r, 800)); // Animationen/Fonts settlen lassen

    await page.evaluate(axeSource);
    const result = await page.evaluate(async () => {
      return await window.axe.run(document.getElementById("__stage"), {
        // Best-Practice-Regeln (region/landmarks) sind für isolierte Snippets irrelevant
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
    });

    const violations = result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
    }));
    const status = violations.length === 0 ? "pass" : "warn";
    report.push({ slug: doc.slug, framework: doc.framework, prev: doc.a11y, status, violations });

    const badge = status === "pass" ? "✓ pass" : `✗ warn (${violations.map((v) => v.id).join(", ")})`;
    console.log(`${badge}  ${doc.slug}`);

    if (!DRY && doc.a11y !== status) {
      await db.updateDocument("marketplace", "components", doc.$id, { a11y: status });
    }
  } catch (e) {
    report.push({ slug: doc.slug, framework: doc.framework, prev: doc.a11y, status: "error", error: e.message.slice(0, 140) });
    console.log(`⚠ error  ${doc.slug} — ${e.message.slice(0, 100)}`);
  }
}

await browser.close();

const pass = report.filter((r) => r.status === "pass").length;
const warn = report.filter((r) => r.status === "warn").length;
const err = report.filter((r) => r.status === "error").length;
console.log(`\n=== Ergebnis: ${pass} pass · ${warn} warn · ${err} error ===`);

// Häufigste Verstöße aggregieren
const byRule = {};
for (const r of report) for (const v of r.violations ?? []) byRule[v.id] = (byRule[v.id] ?? 0) + 1;
console.log("Verstöße nach Regel:", JSON.stringify(byRule, null, 2));

// Vollreport für die Auswertung
const { writeFileSync } = await import("fs");
writeFileSync("a11y-report.json", JSON.stringify(report, null, 2));
console.log("Report: a11y-report.json");
