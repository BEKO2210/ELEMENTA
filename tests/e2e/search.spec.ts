import { test, expect } from "./fixtures";

// Flow 1 (§10): Suche auf der Startseite → Enter → Explore mit Query
test("Suche: Eingabe + Enter führt zu /explore?q=…", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Komponenten suchen");
  await input.fill("button");
  await input.press("Enter");
  await page.waitForURL(/\/explore\?q=button/);
  // Explore zeigt Ergebnisse (mindestens eine Karte verlinkt auf /c/…)
  await expect(page.locator('a[href^="/c/"]').first()).toBeVisible();
});
