/**
 * T5 — Cron: unbestätigte Newsletter-Anmeldungen nach 30 Tagen löschen.
 * confirmedAt == null UND consentAt älter als 30 Tage → gelöscht.
 * Start: APPWRITE_API_KEY="<key>" node scripts/newsletter-cleanup.mjs
 */
import { Client, Databases, Query } from "node-appwrite";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const endpoint = process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";

// Key aus Env oder — für den Cron, unabhängig vom Arbeitsverzeichnis — aus
// der .env.local neben scripts/ laden.
function loadKey() {
  if (process.env.APPWRITE_API_KEY) return process.env.APPWRITE_API_KEY;
  try {
    const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
    const line = readFileSync(envPath, "utf8").split("\n").find((l) => l.startsWith("APPWRITE_API_KEY="));
    return line ? line.slice("APPWRITE_API_KEY=".length).trim() : "";
  } catch {
    return "";
  }
}
const apiKey = loadKey();
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const db = new Databases(new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey));
const DB = "marketplace";
const COL = "newsletter";
const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

let removed = 0;
let cursor = null;
for (;;) {
  const queries = [
    Query.isNull("confirmedAt"),
    Query.lessThan("consentAt", cutoff),
    Query.limit(100),
  ];
  if (cursor) queries.push(Query.cursorAfter(cursor));
  const list = await db.listDocuments(DB, COL, queries);
  if (list.documents.length === 0) break;
  for (const d of list.documents) {
    await db.deleteDocument(DB, COL, d.$id).catch(() => {});
    removed++;
  }
  cursor = list.documents[list.documents.length - 1].$id;
  if (list.documents.length < 100) break;
}
console.log(`[${new Date().toISOString()}] Newsletter-Cleanup: ${removed} unbestätigte Einträge (>30 Tage) gelöscht.`);
