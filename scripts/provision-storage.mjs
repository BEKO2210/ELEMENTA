/**
 * Elementa — Storage-Bucket 'avatars' provisionieren (für Profilbilder).
 * Idempotent. Start: APPWRITE_API_KEY="<key>" node scripts/provision-storage.mjs
 */
import { Client, Storage, Permission, Role } from "node-appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) {
  console.error("❌ APPWRITE_API_KEY fehlt.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const storage = new Storage(client);

const exists = (e) => e?.code === 409 || /already exists/i.test(e?.message || "");

try {
  await storage.createBucket(
    "avatars",
    "Avatars",
    // Bucket-Ebene: jeder darf lesen, eingeloggte dürfen hochladen
    [Permission.read(Role.any()), Permission.create(Role.users())],
    true, // fileSecurity → Datei-Berechtigungen pro Upload
    true, // enabled
    5 * 1024 * 1024, // 5 MB
    ["png", "jpg", "jpeg", "webp", "gif"],
    "gzip", // compression
    false, // encryption
    true, // antivirus
  );
  console.log("  ✓ Bucket 'avatars' angelegt");
} catch (e) {
  if (exists(e)) console.log("  • Bucket 'avatars' existiert bereits");
  else console.error("  ✗ Bucket:", e.message);
}

console.log("\n✅ Storage-Provisioning fertig.");
