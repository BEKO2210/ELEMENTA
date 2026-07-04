import { defineConfig, devices } from "@playwright/test";

// E2E-Kernflows gegen den Produktions-Build (§10 im Audit-Plan).
// Lokal: läuft gegen den bereits laufenden Server auf :3000.
// CI: startet den Server selbst (webServer.command).
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Flows teilen sich Live-Backend — sequenziell, keine Races
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  use: {
    // Auth-Flows brauchen (1) einen bei Appwrite registrierten Origin-Hostnamen
    // (Appwrite ignoriert den Port) und (2) HTTPS, sonst speichert der Browser
    // den Secure-Session-Cookie nicht (Schemeful Same-Site wie in Produktion).
    // Voraussetzung: /etc/hosts → "127.0.0.1 ui.it-handwerk-stuttgart.de".
    baseURL: process.env.E2E_BASE_URL || "https://ui.it-handwerk-stuttgart.de:3443",
    ignoreHTTPSErrors: true, // self-signed Zertifikat des lokalen TLS-Proxys
    trace: "retain-on-failure",
    locale: "de-DE",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run start",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      // TLS-Terminierung für den Produktions-Hostnamen (Cookie-Verhalten wie live)
      command: "npx local-ssl-proxy --source 3443 --target 3000",
      url: "https://localhost:3443",
      ignoreHTTPSErrors: true,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
