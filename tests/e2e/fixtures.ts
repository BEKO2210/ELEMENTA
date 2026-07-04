import { test as base, expect } from "@playwright/test";

// Setzt den Consent-Cookie (elementa_consent) vor jedem Test, damit der
// Cookie-Banner nie erscheint — er ist am unteren Rand fixiert und würde sonst
// Klicks auf Elemente in der „Gefahrenzone" abfangen. Format wie saveConsent().
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const host = new URL(baseURL || "http://localhost:3000").hostname;
    await page.context().addCookies([
      {
        name: "elementa_consent",
        value: encodeURIComponent(JSON.stringify({ analytics: "denied", ts: "2026-01-01T00:00:00.000Z" })),
        domain: host,
        path: "/",
      },
    ]);
    await use(page);
  },
});

export { expect };
