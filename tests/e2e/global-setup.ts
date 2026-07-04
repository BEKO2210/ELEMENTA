import { Client, Users, ID } from "node-appwrite";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Legt EINEN persistenten Test-Nutzer serverseitig an (per API-Key → umgeht das
// Abuse-/Rate-Limit aus T2). Login-basierte Flows (Like, Submit) nutzen ihn und
// müssen sich nicht selbst registrieren — nur der Lösch-Test registriert 1× echt.
// Ohne Key: Fallback auf öffentliche Registrierung (1 Account, unter dem Limit).
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "6a4453770009b9e7f029";
const KEY = process.env.APPWRITE_API_KEY;

export const STATE_DIR = join(process.cwd(), "test-results");
export const CREDS_FILE = join(STATE_DIR, "e2e-user.json");

export default async function globalSetup() {
  mkdirSync(STATE_DIR, { recursive: true });
  const suffix = Date.now().toString(36);
  const user = {
    id: `e2e${suffix}`,
    email: `e2e-persist-${suffix}@example.com`,
    password: `E2e!${suffix}Persist99`,
    name: `E2E Persist ${suffix}`,
  };

  if (KEY) {
    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(KEY);
    const users = new Users(client);
    const created = await users.create(ID.unique(), user.email, undefined, user.password, user.name);
    user.id = created.$id;
    writeFileSync(CREDS_FILE, JSON.stringify({ ...user, provisioned: "server" }));
    console.log(`[e2e] Persistenter Nutzer serverseitig angelegt: ${user.email}`);
  } else {
    // Kein Key (z. B. CI ohne Secret): Datei markiert Fallback — die Login-Flows
    // registrieren sich dann selbst (siehe helpers.ensureUser).
    writeFileSync(CREDS_FILE, JSON.stringify({ ...user, provisioned: "public" }));
    console.log(`[e2e] Kein API-Key — Login-Flows registrieren selbst (Fallback).`);
  }
}
