// Audit 1: Routen-/Link-Checker — crawlt Sitemap + alle internen Links von
// Schlüsselseiten, prüft Status, Redirects, 404-Verhalten und Security-Header.
const base = process.argv[2] || "http://localhost:3000";

const pages = ["/", "/explore", "/guides", "/about", "/stats", "/submit", "/login",
  "/impressum", "/datenschutz", "/lizenz", "/docs/contribute", "/docs/guidelines", "/profil"];

// Sitemap einlesen
const sm = await (await fetch(`${base}/sitemap.xml`)).text();
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
console.log(`Sitemap: ${smUrls.length} URLs`);

// interne Links aus Seiten sammeln
const found = new Set(pages.concat(smUrls));
for (const p of pages) {
  try {
    const html = await (await fetch(base + p)).text();
    for (const m of html.matchAll(/href="(\/[^"#?]*)[^"]*"/g)) {
      const path = m[1];
      if (!path.startsWith("/_next") && !path.startsWith("/vendor")) found.add(path);
    }
  } catch {}
}
console.log(`Zu prüfen: ${found.size} Pfade`);

const bad = [];
for (const p of [...found].sort()) {
  try {
    const r = await fetch(base + p, { redirect: "manual" });
    if (r.status >= 400) bad.push(`${r.status}  ${p}`);
    else if (r.status >= 300) bad.push(`${r.status}→${r.headers.get("location")}  ${p}`);
  } catch (e) {
    bad.push(`FEHLER ${p}: ${e.message}`);
  }
}
console.log(bad.length ? "PROBLEME:\n" + bad.join("\n") : "✓ alle Links OK");
let failures = bad.length;

// 404-Verhalten
const r404 = await fetch(base + "/gibt-es-nicht-xyz");
console.log(`404-Seite: Status ${r404.status}`);
if (r404.status !== 404) failures++;

// Security-Header der Hauptseite
const h = await fetch(base + "/");
const want = ["content-security-policy", "x-content-type-options", "referrer-policy",
  "x-frame-options", "permissions-policy", "strict-transport-security"];
for (const k of want) {
  const ok = Boolean(h.headers.get(k));
  console.log(`${ok ? "✓" : "✗ FEHLT"} ${k}`);
  if (!ok) failures++;
}

// externe Links (aus Footer/Impressum) — informativ, kein Gate (externe Ausfälle
// sollen die eigene Pipeline nicht rot färben)
for (const ext of ["https://github.com/BEKO2210/ELEMENTA"]) {
  try {
    const r = await fetch(ext, { method: "HEAD" });
    console.log(`extern ${r.status}  ${ext}`);
  } catch (e) { console.log(`extern FEHLER ${ext}`); }
}

if (failures > 0) {
  console.log(`\n=== ${failures} Probleme ===`);
  process.exit(1); // CI-Gate
}
