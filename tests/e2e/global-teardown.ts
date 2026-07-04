import { Client, Users, Query } from "node-appwrite";

// Räumt alle E2E-Wegwerf-Nutzer auf (nur mit API-Key). Ohne Key bleiben die
// (deaktivierten) Konten liegen — sie sind an der example.com-Domain erkennbar.
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "6a4453770009b9e7f029";
const KEY = process.env.APPWRITE_API_KEY;

export default async function globalTeardown() {
  if (!KEY) return;
  const users = new Users(new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(KEY));
  let removed = 0;
  try {
    // Alle Test-Nutzer (e2e-*@example.com) einsammeln und löschen
    const list = await users.list([Query.startsWith("email", "e2e-"), Query.limit(100)]);
    for (const u of list.users) {
      if (u.email.endsWith("@example.com")) {
        await users.delete(u.$id).catch(() => {});
        removed++;
      }
    }
  } catch {
    /* Aufräumen ist best-effort */
  }
  console.log(`[e2e] Teardown: ${removed} Test-Nutzer entfernt.`);
}
