/**
 * Elementa — Appwrite-Backend provisionieren.
 *
 * Legt Datenbank + Collections (components, profiles, likes) mit Feldern,
 * Indizes und Berechtigungen an. Idempotent: bereits Vorhandenes wird übersprungen.
 *
 * Start:
 *   APPWRITE_API_KEY="<dein-key>" node scripts/provision.mjs
 */
import { Client, Databases, Permission, Role } from "node-appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error("❌ APPWRITE_API_KEY fehlt. Aufruf: APPWRITE_API_KEY=... node scripts/provision.mjs");
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

/** Warte, bis alle Attribute einer Collection 'available' sind (Indizes brauchen das). */
async function waitAttributes(col) {
  for (let i = 0; i < 30; i++) {
    const { attributes } = await db.listAttributes(DB, col);
    if (attributes.length && attributes.every((a) => a.status === "available")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

console.log("→ Datenbank");
await step("Database 'marketplace'", () => db.create(DB, "Marketplace"));

/* ---------- components ---------- */
console.log("→ Collection: components");
await step("collection components", () =>
  db.createCollection(DB, "components", "Components",
    [Permission.read(Role.any()), Permission.create(Role.users())], true),
);
await step("title", () => db.createStringAttribute(DB, "components", "title", 140, true));
await step("slug", () => db.createStringAttribute(DB, "components", "slug", 160, true));
await step("description", () => db.createStringAttribute(DB, "components", "description", 2000, false));
await step("html", () => db.createStringAttribute(DB, "components", "html", 65535, false));
await step("css", () => db.createStringAttribute(DB, "components", "css", 65535, false));
await step("js", () => db.createStringAttribute(DB, "components", "js", 65535, false));
await step("framework", () => db.createEnumAttribute(DB, "components", "framework",
  ["html", "css", "tailwind", "react", "vue", "svelte"], true));
await step("category", () => db.createStringAttribute(DB, "components", "category", 64, true));
await step("tags", () => db.createStringAttribute(DB, "components", "tags", 32, false, undefined, true));
await step("authorId", () => db.createStringAttribute(DB, "components", "authorId", 36, true));
await step("authorUsername", () => db.createStringAttribute(DB, "components", "authorUsername", 64, false));
await step("likesCount", () => db.createIntegerAttribute(DB, "components", "likesCount", false, 0, undefined, 0));
await step("views", () => db.createIntegerAttribute(DB, "components", "views", false, 0, undefined, 0));
await step("a11y", () => db.createEnumAttribute(DB, "components", "a11y", ["pass", "warn", "unchecked"], false, "unchecked"));
await step("createdAt", () => db.createDatetimeAttribute(DB, "components", "createdAt", false));

console.log("  … warte auf Attribute (components)");
await waitAttributes("components");
await step("index slug (unique)", () => db.createIndex(DB, "components", "slug_unique", "unique", ["slug"]));
await step("index category", () => db.createIndex(DB, "components", "by_category", "key", ["category"]));
await step("index framework", () => db.createIndex(DB, "components", "by_framework", "key", ["framework"]));
await step("index authorId", () => db.createIndex(DB, "components", "by_author", "key", ["authorId"]));
await step("index likesCount", () => db.createIndex(DB, "components", "by_likes", "key", ["likesCount"]));
await step("index title (fulltext)", () => db.createIndex(DB, "components", "search_title", "fulltext", ["title"]));

/* ---------- profiles ---------- */
console.log("→ Collection: profiles");
await step("collection profiles", () =>
  db.createCollection(DB, "profiles", "Profiles",
    [Permission.read(Role.any()), Permission.create(Role.users())], true),
);
await step("username", () => db.createStringAttribute(DB, "profiles", "username", 64, true));
await step("displayName", () => db.createStringAttribute(DB, "profiles", "displayName", 128, false));
await step("bio", () => db.createStringAttribute(DB, "profiles", "bio", 1000, false));
await step("avatarUrl", () => db.createStringAttribute(DB, "profiles", "avatarUrl", 2048, false));
await step("componentsCount", () => db.createIntegerAttribute(DB, "profiles", "componentsCount", false, 0, undefined, 0));
console.log("  … warte auf Attribute (profiles)");
await waitAttributes("profiles");
await step("index username (unique)", () => db.createIndex(DB, "profiles", "username_unique", "unique", ["username"]));

/* ---------- likes ---------- */
console.log("→ Collection: likes");
await step("collection likes", () =>
  db.createCollection(DB, "likes", "Likes",
    [Permission.read(Role.any()), Permission.create(Role.users())], true),
);
await step("userId", () => db.createStringAttribute(DB, "likes", "userId", 36, true));
await step("componentId", () => db.createStringAttribute(DB, "likes", "componentId", 36, true));
await step("createdAt", () => db.createDatetimeAttribute(DB, "likes", "createdAt", false));
console.log("  … warte auf Attribute (likes)");
await waitAttributes("likes");
await step("index user+component (unique)", () =>
  db.createIndex(DB, "likes", "user_component_unique", "unique", ["userId", "componentId"]));

console.log("\n✅ Provisioning fertig.");
