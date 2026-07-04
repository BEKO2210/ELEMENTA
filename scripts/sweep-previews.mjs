// Debug-Sweep: öffnet jede Komponenten-Seite und prüft alle Sandbox-iframes
// auf Renderfehler, leere Stages und CSP-Verstöße. Nutzung:
//   node scripts/sweep-previews.mjs [baseUrl]
import puppeteer from "puppeteer-core";

const base = process.argv[2] || "http://localhost:3000";

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const slugs = [...sitemap.matchAll(/<loc>[^<]*\/c\/([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`Prüfe ${slugs.length} Komponenten…\n`);

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const problems = [];
let consoleErrors = [];
page.on("console", (m) => {
  const t = m.text();
  if (
    m.type() === "error" &&
    /violates|Uncaught|SyntaxError|Ladefehler|is not defined|Cannot read/.test(t) &&
    !/appwrite|CORS|_rsc|net::ERR_FAILED/.test(t)
  ) {
    consoleErrors.push(t.slice(0, 220));
  }
});

for (const slug of slugs) {
  consoleErrors = [];
  try {
    await page.goto(`${base}/c/${slug}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // lazy iframes triggern + Sandbox-Handshake abwarten
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 2500));

    const frames = page.frames().filter((f) => f.url().includes("sandbox.html"));
    if (!frames.length) {
      problems.push({ slug, issue: "keine Sandbox-Frames gefunden" });
      console.log(`✗ ${slug} — keine Sandbox-Frames`);
      continue;
    }

    const issues = [];
    for (let i = 0; i < frames.length; i++) {
      try {
        const r = await frames[i].evaluate(() => {
          const stage = document.getElementById("__stage");
          const err = stage?.querySelector(".__err")?.textContent ?? null;
          const ph = stage?.querySelector(".__ph b")?.textContent ?? null;
          return {
            err,
            placeholder: ph,
            children: stage ? stage.children.length : -1,
            text: (stage?.innerText || "").slice(0, 60),
          };
        });
        if (r.err) issues.push(`Frame ${i}: FEHLER: ${r.err.slice(0, 160)}`);
        else if (r.children === 0) issues.push(`Frame ${i}: leere Stage`);
        else if (r.placeholder) issues.push(`Frame ${i}: Platzhalter (${r.placeholder})`);
      } catch {
        issues.push(`Frame ${i}: nicht auswertbar`);
      }
    }
    if (consoleErrors.length) issues.push(...consoleErrors.map((e) => `console: ${e}`));

    if (issues.length) {
      problems.push({ slug, issue: issues.join(" | ") });
      console.log(`✗ ${slug}\n    ${issues.join("\n    ")}`);
    } else {
      console.log(`✓ ${slug} (${frames.length} Frames)`);
    }
  } catch (e) {
    problems.push({ slug, issue: `Seitenfehler: ${e.message}` });
    console.log(`✗ ${slug} — ${e.message}`);
  }
}

await browser.close();
console.log(`\n=== Ergebnis: ${slugs.length - problems.length}/${slugs.length} OK, ${problems.length} mit Problemen ===`);
if (problems.length) process.exitCode = 1;
