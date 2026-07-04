/**
 * T5 — Newsletter Double-Opt-in: Felder confirmedAt + token ergänzen.
 * Idempotent. Start: APPWRITE_API_KEY="<key>" node scripts/provision-newsletter-doi.mjs
 */
import { Client, Databases } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const db = new Databases(new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey));
const DB = "marketplace";
const exists = (e) => e?.code === 409 || /already exists/i.test(e?.message || "");
async function step(label, fn) {
  try { await fn(); console.log("  ✓", label); }
  catch (e) { if (exists(e)) console.log("  • existiert bereits:", label); else console.error("  ✗", label, "→", e.message); }
}

console.log("→ newsletter: Double-Opt-in-Felder");
await step("confirmedAt (datetime, optional)", () => db.createDatetimeAttribute(DB, "newsletter", "confirmedAt", false));
await step("token (string 64, optional)", () => db.createStringAttribute(DB, "newsletter", "token", 64, false));
// Wartezeit, dann Indizes für Cleanup-Abfragen
await new Promise((r) => setTimeout(r, 2500));
await step("index by_confirmed", () => db.createIndex(DB, "newsletter", "by_confirmed", "key", ["confirmedAt"]));
await step("index by_token", () => db.createIndex(DB, "newsletter", "by_token", "key", ["token"]));
console.log("\n✅ Newsletter-DOI-Provisioning fertig.");
