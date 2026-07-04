/**
 * Behebt die 3 realen axe-Verstöße aus dem A11y-Audit (2026-07-04) direkt im
 * Komponenten-Code — Kontraste auf AA angehoben, fehlendes Label ergänzt.
 * Start: APPWRITE_API_KEY="<key>" node scripts/fix-a11y-findings.mjs
 */
import { Client, Databases, Query } from "node-appwrite";

const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }
const db = new Databases(
  new Client()
    .setEndpoint("https://appwrite.it-handwerk-stuttgart.de/v1")
    .setProject("6a4453770009b9e7f029")
    .setKey(apiKey),
);

// slug → Feld → [suchen, ersetzen]
const FIXES = {
  // Checkbox ohne zugänglichen Namen → aria-label
  "gradient-toggle": {
    html: [[
      '<input type="checkbox" checked />',
      '<input type="checkbox" checked aria-label="Umschalten" />',
    ]],
  },
  // AUS-Text #64748b auf #e2e8f0 ≈ 4,1:1 → #475569 (≈7,5:1);
  // AN-Track-Grün #10b981 vs. weiß ≈ 2,4:1 → #047857 (≈4,7:1, AA)
  "text-label-on-off-toggle": {
    css: [
      ["color: #64748b;", "color: #475569;"],
      ["background-color: #10b981; /* Sattes Grün */", "background-color: #047857; /* Sattes Grün (AA-Kontrast zu Weiß) */"],
    ],
  },
  // -25%-Badge weiß auf #d946ef ≈ 3,2:1 → #a21caf (≈5,9:1);
  // Subzeile & Streichpreis-Alpha angehoben (AA auf dunklem Karten-BG)
  "3d-tilt-product-card": {
    css: [
      ["background:#d946ef;color:#fff;", "background:#a21caf;color:#fff;"],
      ["color:rgba(226,226,240,.6)", "color:rgba(226,226,240,.78)"],
      ["color:rgba(226,226,240,.45)", "color:rgba(226,226,240,.62)"],
    ],
  },
};

for (const [slug, fields] of Object.entries(FIXES)) {
  const { documents } = await db.listDocuments("marketplace", "components", [
    Query.equal("slug", slug), Query.limit(1),
  ]);
  const doc = documents[0];
  if (!doc) { console.log(`⚠ nicht gefunden: ${slug}`); continue; }

  const patch = {};
  for (const [field, replacements] of Object.entries(fields)) {
    let v = doc[field] || "";
    for (const [from, to] of replacements) {
      if (!v.includes(from)) { console.log(`⚠ ${slug}.${field}: Muster nicht gefunden: ${from.slice(0, 50)}`); continue; }
      v = v.replaceAll(from, to);
    }
    if (v !== doc[field]) patch[field] = v;
  }
  if (Object.keys(patch).length) {
    await db.updateDocument("marketplace", "components", doc.$id, patch);
    console.log(`✓ gefixt: ${slug} (${Object.keys(patch).join(",")})`);
  } else {
    console.log(`· unverändert: ${slug}`);
  }
}
console.log("Fertig.");
