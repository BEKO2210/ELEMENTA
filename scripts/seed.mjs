/**
 * Elementa — Beispiel-Komponenten in Appwrite einfügen.
 * Liest die Daten direkt aus src/lib/mock-data.ts (single source of truth).
 *
 * Start: APPWRITE_API_KEY="<key>" node scripts/seed.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client, Databases, Permission, Role } from "node-appwrite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) {
  console.error("❌ APPWRITE_API_KEY fehlt.");
  process.exit(1);
}

// Komponenten-Array aus mock-data.ts extrahieren (kein TS-Build nötig)
const src = readFileSync(join(__dirname, "..", "src", "lib", "mock-data.ts"), "utf8");
const m = src.match(/export const COMPONENTS[^=]*=\s*(\[[\s\S]*?\n\]);/);
if (!m) {
  console.error("❌ COMPONENTS-Array in mock-data.ts nicht gefunden.");
  process.exit(1);
}
const COMPONENTS = new Function("return " + m[1])();

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);
const DB = "marketplace";
const COL = "components";

let created = 0,
  skipped = 0;
for (const c of COMPONENTS) {
  const data = {
    title: c.title,
    slug: c.slug,
    description: c.description,
    html: c.html,
    css: c.css,
    js: c.js,
    framework: c.framework,
    category: c.category,
    tags: c.tags,
    authorId: c.author,
    authorUsername: c.author,
    likesCount: c.likes,
    views: 0,
    a11y: c.a11y,
    createdAt: new Date(c.createdAt + "T12:00:00.000Z").toISOString(),
  };
  try {
    await db.createDocument(DB, COL, c.slug, data, [Permission.read(Role.any())]);
    console.log("  ✓ eingefügt:", c.slug);
    created++;
  } catch (e) {
    if (e?.code === 409) {
      console.log("  • existiert bereits:", c.slug);
      skipped++;
    } else {
      console.error("  ✗", c.slug, "→", e.message);
    }
  }
}
console.log(`\n✅ Seed fertig — ${created} neu, ${skipped} vorhanden.`);
