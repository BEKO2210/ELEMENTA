/**
 * Provisioniert die Analytics-Collections (datensparsam, aggregiert pro Tag):
 *   pageviews_daily: day + path + count   (Doc-ID = day~sha(path) → Upsert)
 *   refs_daily:      day + host + count
 * Beide Collections sind PRIVAT (nur API-Key) — die /stats-Seite liest serverseitig.
 * Start: APPWRITE_API_KEY="<key>" node scripts/provision-analytics.mjs
 */
import { Client, Databases } from "node-appwrite";

const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }
const db = new Databases(
  new Client()
    .setEndpoint("https://appwrite.it-handwerk-stuttgart.de/v1")
    .setProject("6a4453770009b9e7f029")
    .setKey(apiKey),
);

const DB = "marketplace";

async function ensureCollection(id, name, attrs, indexes) {
  try {
    await db.getCollection(DB, id);
    console.log(`· Collection ${id} existiert`);
  } catch {
    await db.createCollection(DB, id, name, [], false); // keine Permissions → nur API-Key
    console.log(`✓ Collection ${id} angelegt`);
  }
  for (const a of attrs) {
    try {
      if (a.type === "string") await db.createStringAttribute(DB, id, a.key, a.size, a.required);
      else if (a.type === "integer") await db.createIntegerAttribute(DB, id, a.key, a.required);
      console.log(`  ✓ Attribut ${a.key}`);
    } catch (e) {
      if (e.code === 409) console.log(`  · Attribut ${a.key} existiert`);
      else throw e;
    }
  }
  // Attribute brauchen einen Moment bis "available"
  await new Promise((r) => setTimeout(r, 2500));
  for (const ix of indexes) {
    try {
      await db.createIndex(DB, id, ix.key, ix.type, ix.attributes);
      console.log(`  ✓ Index ${ix.key}`);
    } catch (e) {
      if (e.code === 409) console.log(`  · Index ${ix.key} existiert`);
      else console.log(`  ⚠ Index ${ix.key}: ${e.message}`);
    }
  }
}

await ensureCollection(
  "pageviews_daily",
  "Pageviews (täglich aggregiert)",
  [
    { key: "day", type: "string", size: 10, required: true },
    { key: "path", type: "string", size: 200, required: true },
    { key: "count", type: "integer", required: true },
  ],
  [{ key: "by_day", type: "key", attributes: ["day"] }],
);

await ensureCollection(
  "refs_daily",
  "Referrer (täglich aggregiert)",
  [
    { key: "day", type: "string", size: 10, required: true },
    { key: "host", type: "string", size: 120, required: true },
    { key: "count", type: "integer", required: true },
  ],
  [{ key: "by_day", type: "key", attributes: ["day"] }],
);

console.log("Fertig.");
