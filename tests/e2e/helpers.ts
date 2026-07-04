import { expect, type Page } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";
import { Client, Users, ID } from "node-appwrite";

type Creds = { id: string; email: string; password: string; name: string; provisioned: "server" | "public" };

// Persistenten Test-Nutzer aus global-setup laden
export function persistentUser(): Creds {
  return JSON.parse(readFileSync(join(process.cwd(), "test-results", "e2e-user.json"), "utf8"));
}

// Als persistenter Nutzer angemeldet sein: server-provisioniert → login;
// Fallback ohne Key → einmalig registrieren (danach existiert der Account).
export async function ensureLoggedIn(page: Page) {
  const u = persistentUser();
  if (u.provisioned === "server") {
    await login(page, u);
  } else {
    try {
      await login(page, u);
    } catch {
      await register(page, u);
    }
  }
}

// Frischen Wegwerf-Nutzer bereitstellen und einloggen. Mit API-Key serverseitig
// angelegt (umgeht das T2-Rate-Limit), sonst per öffentlicher Registrierung.
// Für den Lösch-Test, der das Konto anschließend deaktiviert.
export async function loginAsFreshUser(page: Page): Promise<{ email: string; password: string }> {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const u = { email: `e2e-del-${suffix}@example.com`, password: `E2e!${suffix}Del99`, name: `E2E Del ${suffix}` };
  const key = process.env.APPWRITE_API_KEY;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "6a4453770009b9e7f029";
  if (key) {
    const users = new Users(new Client().setEndpoint(endpoint).setProject(project).setKey(key));
    await users.create(ID.unique(), u.email, undefined, u.password, u.name);
    await login(page, u);
  } else {
    await register(page, u);
  }
  return u;
}

export async function register(page: Page, u: { name: string; email: string; password: string }) {
  await page.goto("/login");
  // Consent-Banner wird per Fixture (fixtures.ts) unterdrückt
  // In den Registrieren-Modus wechseln
  await page.getByRole("button", { name: "Jetzt registrieren" }).click();
  await page.getByPlaceholder("Name").fill(u.name);
  await page.getByPlaceholder("E-Mail").fill(u.email);
  await page.getByPlaceholder("Passwort", { exact: false }).fill(u.password);
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  // Erfolgreiche Anmeldung leitet weg von /login
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}

export async function login(page: Page, u: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByPlaceholder("E-Mail").fill(u.email);
  await page.getByPlaceholder("Passwort", { exact: false }).fill(u.password);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}

export async function logout(page: Page) {
  await page.goto("/profil");
  // Zwei Abmelden-Buttons (Navbar-Icon + Profilseite) — der auf der Profilseite
  // (im DOM der letzte) leitet nach dem Logout auf die Startseite weiter
  await page.getByRole("button", { name: "Abmelden" }).last().click();
  await page.waitForURL("/", { timeout: 15_000 });
}

// Erste Komponente aus der Sitemap holen (echte, existierende Detailseite).
export async function firstComponentSlug(page: Page): Promise<string> {
  const res = await page.request.get("/sitemap.xml");
  const xml = await res.text();
  const m = xml.match(/<loc>[^<]*\/c\/([^<]+)<\/loc>/);
  expect(m, "Sitemap enthält mindestens eine Komponente").toBeTruthy();
  return m![1];
}
