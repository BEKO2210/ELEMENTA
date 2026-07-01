/**
 * Wahrheit herstellen: erfundene Daten entfernen.
 *  - likesCount = 0 für ALLE Komponenten (Likes = nur echte Like-Dokumente).
 *  - a11y = "unchecked" für von uns geseedete Komponenten (kein echter WCAG-Test gelaufen).
 * Start: APPWRITE_API_KEY="<key>" node scripts/reset-truthful.mjs
 */
import { Client, Databases, Query } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);
const DB = "marketplace", COL = "components";

let offset = 0, total = Infinity, likesFixed = 0, a11yFixed = 0;
while (offset < total) {
  const r = await db.listDocuments(DB, COL, [Query.limit(100), Query.offset(offset)]);
  total = r.total;
  for (const d of r.documents) {
    const patch = {};
    if ((d.likesCount ?? 0) !== 0) patch.likesCount = 0;
    // Nur die selbst geseedeten Premium-Komponenten (Autor Belkis) auf "unchecked" —
    // wir haben dort kein echtes WCAG-Audit durchgeführt.
    if (d.authorId === "6a447115002c7120de36" && d.a11y === "pass") patch.a11y = "unchecked";
    if (Object.keys(patch).length) {
      try {
        await db.updateDocument(DB, COL, d.$id, patch);
        if ("likesCount" in patch) likesFixed++;
        if ("a11y" in patch) a11yFixed++;
      } catch (e) { console.error("  ✗", d.slug, e.message); }
    }
  }
  offset += r.documents.length;
  if (!r.documents.length) break;
}
console.log(`✅ likesCount=0 gesetzt: ${likesFixed} · a11y→unchecked: ${a11yFixed} (von ${total} Komponenten)`);
