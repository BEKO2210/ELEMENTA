/**
 * Seedet einen Komponenten-Batch (aus einer .mjs-Datei) als Belkis in Appwrite.
 * Kein likesCount/views (T7). a11y="unchecked" (Wahrheitsregel — der nächtliche
 * axe-Cron setzt den echten Wert). Idempotent: vorhandener Slug wird übersprungen.
 *
 * Start: APPWRITE_API_KEY="<key>" node scripts/seed-gen.mjs <batch.mjs>
 */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { Client, Databases, Permission, Role, ID, Query } from "node-appwrite";

const inFile = process.argv[2];
if (!inFile) { console.error("Usage: node scripts/seed-gen.mjs <batch.mjs>"); process.exit(1); }
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const AUTHOR_ID = "6a447115002c7120de36";
const AUTHOR_NAME = "Belkis";
const DB = "marketplace";
const COL = "components";

const db = new Databases(
  new Client().setEndpoint("https://appwrite.it-handwerk-stuttgart.de/v1").setProject("6a4453770009b9e7f029").setKey(apiKey),
);

const mod = await import(pathToFileURL(resolve(inFile)).href);
const items = mod.default;

let created = 0, skipped = 0, failed = 0;
for (const c of items) {
  const slug = String(c.slug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  try {
    const existing = await db.listDocuments(DB, COL, [Query.equal("slug", slug), Query.limit(1)]);
    if (existing.total > 0) { console.log("  • existiert:", slug); skipped++; continue; }
    await db.createDocument(DB, COL, ID.unique(), {
      title: c.title, slug, description: c.description || "",
      framework: c.framework, category: c.category,
      tags: (c.tags || []).slice(0, 8),
      html: c.html || "", css: c.css || "", js: c.js || "",
      authorId: AUTHOR_ID, authorUsername: AUTHOR_NAME,
      a11y: "unchecked",
      createdAt: new Date().toISOString(),
    }, [
      Permission.read(Role.any()),
      Permission.update(Role.user(AUTHOR_ID)),
      Permission.delete(Role.user(AUTHOR_ID)),
    ]);
    console.log("  ✓ seeded:", slug, `(${c.framework}/${c.category})`);
    created++;
  } catch (e) {
    console.error("  ✗", slug, "→", e.message);
    failed++;
  }
}
console.log(`\nFertig: ${created} neu, ${skipped} übersprungen, ${failed} Fehler.`);
