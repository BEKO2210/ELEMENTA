/**
 * Entfernt Seed-Artefakte (---JS--- / ---CSS--- / ---HTML---) aus den
 * html/css/js-Feldern aller Komponenten-Dokumente.
 * Start: APPWRITE_API_KEY="<key>" node scripts/fix-js-artifacts.mjs
 */
import { Client, Databases, Query } from "node-appwrite";

const endpoint = "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

const MARKER = /\s*---(?:JS|CSS|HTML)---\s*$/;

const { documents } = await db.listDocuments("marketplace", "components", [Query.limit(100)]);
let fixed = 0;
for (const doc of documents) {
  const patch = {};
  for (const f of ["html", "css", "js"]) {
    const v = doc[f] || "";
    if (MARKER.test(v)) patch[f] = v.replace(MARKER, "").trimEnd();
  }
  if (Object.keys(patch).length) {
    await db.updateDocument("marketplace", "components", doc.$id, patch);
    console.log("✓ repariert:", doc.slug, Object.keys(patch).join(","));
    fixed++;
  }
}
console.log(`Fertig — ${fixed} Dokument(e) repariert.`);
