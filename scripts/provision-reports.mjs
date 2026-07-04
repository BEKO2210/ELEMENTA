/**
 * Elementa — T4: reports-Collection provisionieren + Admin-Label setzen.
 * Meldungen sind NUR mit API-Key lesbar (kein öffentlicher/User-Lesezugriff) —
 * eingeloggte Nutzer dürfen nur erstellen. Idempotent.
 *
 * Start:  APPWRITE_API_KEY="<key>" node scripts/provision-reports.mjs
 */
import { Client, Databases, Users } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
const ADMIN_ID = process.env.ADMIN_USER_ID || "6a447115002c7120de36"; // Belkis

if (!apiKey) {
  console.error("❌ APPWRITE_API_KEY fehlt.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);
const users = new Users(client);
const DB = "marketplace";

const exists = (e) => e?.code === 409 || /already exists/i.test(e?.message || "");
async function step(label, fn) {
  try {
    await fn();
    console.log("  ✓", label);
  } catch (e) {
    if (exists(e)) console.log("  • existiert bereits:", label);
    else console.error("  ✗", label, "→", e.message);
  }
}
async function waitAttributes(col) {
  for (let i = 0; i < 30; i++) {
    const { attributes } = await db.listAttributes(DB, col);
    if (attributes.length && attributes.every((a) => a.status === "available")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

/* ---------- reports (privat: NUR API-Key liest; Nutzer erstellen) ---------- */
console.log("→ Collection: reports");
// Keine read/update/delete-Rolle → nur der Server-Key kann lesen/moderieren.
// documentSecurity=false, damit auch pro-Dokument-Permissions das nicht aufweichen.
import("node-appwrite").then(async ({ Permission, Role }) => {
  await step("collection reports", () =>
    db.createCollection(DB, "reports", "Reports", [Permission.create(Role.users())], false),
  );
  await step("targetType", () => db.createStringAttribute(DB, "reports", "targetType", 16, true)); // comment | component
  await step("targetId", () => db.createStringAttribute(DB, "reports", "targetId", 64, true));
  await step("reason", () => db.createStringAttribute(DB, "reports", "reason", 32, true)); // spam|abuse|illegal|other
  await step("details", () => db.createStringAttribute(DB, "reports", "details", 1000, false));
  await step("reporterId", () => db.createStringAttribute(DB, "reports", "reporterId", 36, false));
  await step("reporterName", () => db.createStringAttribute(DB, "reports", "reporterName", 64, false));
  await step("status", () => db.createStringAttribute(DB, "reports", "status", 16, false, "open")); // open|resolved|dismissed
  await step("createdAt", () => db.createDatetimeAttribute(DB, "reports", "createdAt", false));
  console.log("  … warte auf Attribute (reports)");
  await waitAttributes("reports");
  await step("index by_status", () => db.createIndex(DB, "reports", "by_status", "key", ["status"]));
  await step("index by_target", () => db.createIndex(DB, "reports", "by_target", "key", ["targetType", "targetId"]));
  await step("index by_created", () => db.createIndex(DB, "reports", "by_created", "key", ["createdAt"]));

  /* ---------- Admin-Label für Belkis ---------- */
  console.log("→ Admin-Label setzen");
  await step(`label admin → ${ADMIN_ID}`, async () => {
    const u = await users.get(ADMIN_ID);
    const labels = Array.from(new Set([...(u.labels || []), "admin"]));
    await users.updateLabels(ADMIN_ID, labels);
  });

  console.log("\n✅ reports-Provisioning fertig.");
});
