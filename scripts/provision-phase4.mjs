/**
 * Elementa — Phase-4-Collections provisionieren: comments, comment_helpful, favorites.
 * Idempotent (Vorhandenes wird übersprungen).
 *
 * Start:  APPWRITE_API_KEY="<key>" node scripts/provision-phase4.mjs
 */
import { Client, Databases, Permission, Role } from "node-appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error("❌ APPWRITE_API_KEY fehlt.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);
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

/* ---------- comments (öffentlich lesbar) ---------- */
console.log("→ Collection: comments");
await step("collection comments", () =>
  db.createCollection(DB, "comments", "Comments",
    [Permission.read(Role.any()), Permission.create(Role.users())], true),
);
await step("componentId", () => db.createStringAttribute(DB, "comments", "componentId", 36, true));
await step("userId", () => db.createStringAttribute(DB, "comments", "userId", 36, true));
await step("authorUsername", () => db.createStringAttribute(DB, "comments", "authorUsername", 64, false));
await step("body", () => db.createStringAttribute(DB, "comments", "body", 2000, true));
await step("createdAt", () => db.createDatetimeAttribute(DB, "comments", "createdAt", false));
console.log("  … warte auf Attribute (comments)");
await waitAttributes("comments");
await step("index by_component", () => db.createIndex(DB, "comments", "by_component", "key", ["componentId"]));
await step("index by_created", () => db.createIndex(DB, "comments", "by_created", "key", ["createdAt"]));

/* ---------- comment_helpful (Votes, öffentlich zählbar) ---------- */
console.log("→ Collection: comment_helpful");
await step("collection comment_helpful", () =>
  db.createCollection(DB, "comment_helpful", "Comment Helpful",
    [Permission.read(Role.any()), Permission.create(Role.users())], true),
);
await step("userId", () => db.createStringAttribute(DB, "comment_helpful", "userId", 36, true));
await step("commentId", () => db.createStringAttribute(DB, "comment_helpful", "commentId", 36, true));
await step("createdAt", () => db.createDatetimeAttribute(DB, "comment_helpful", "createdAt", false));
console.log("  … warte auf Attribute (comment_helpful)");
await waitAttributes("comment_helpful");
await step("index user+comment (unique)", () =>
  db.createIndex(DB, "comment_helpful", "user_comment_unique", "unique", ["userId", "commentId"]));
await step("index by_comment", () => db.createIndex(DB, "comment_helpful", "by_comment", "key", ["commentId"]));

/* ---------- favorites (privat: nur Besitzer) ---------- */
console.log("→ Collection: favorites");
await step("collection favorites", () =>
  db.createCollection(DB, "favorites", "Favorites",
    [Permission.create(Role.users())], true),
);
await step("userId", () => db.createStringAttribute(DB, "favorites", "userId", 36, true));
await step("componentId", () => db.createStringAttribute(DB, "favorites", "componentId", 36, true));
await step("createdAt", () => db.createDatetimeAttribute(DB, "favorites", "createdAt", false));
console.log("  … warte auf Attribute (favorites)");
await waitAttributes("favorites");
await step("index user+component (unique)", () =>
  db.createIndex(DB, "favorites", "user_component_unique", "unique", ["userId", "componentId"]));
await step("index by_user", () => db.createIndex(DB, "favorites", "by_user", "key", ["userId"]));

console.log("\n✅ Phase-4-Provisioning fertig.");
