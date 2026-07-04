import { test, expect } from "./fixtures";
import { ensureLoggedIn } from "./helpers";

// Flow 4 (§10): Submit-Formular-Validierung (Formular erscheint nur eingeloggt).
// Duplikat-Slugs werden by design automatisch suffixiert (ComponentForm),
// zu lange Felder begrenzt Appwrite serverseitig — hier prüfen wir die
// deterministische Client-Validierung (persistenter Nutzer aus global-setup).
test("Submit-Formular: MIT-Pflicht, Leer-Validierung, Sonderzeichen", async ({ page }) => {
  await ensureLoggedIn(page);

  await page.goto("/submit");
  const submitBtn = page.getByRole("button", { name: "Unter MIT-Lizenz veröffentlichen" });
  await expect(submitBtn).toBeVisible();

  // T10: Hinweis auf Moderation/Meldung ist im Formular sichtbar
  await expect(page.getByText(/gemeldet werden/)).toBeVisible();

  // 1) Ohne MIT-Zustimmung ist Veröffentlichen gesperrt
  await expect(submitBtn).toBeDisabled();

  // 2) Leeres Formular → Validierungsfehler statt Request
  await page.locator('input[type="checkbox"]').first().check();
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();
  await expect(page.getByText("Titel und Code sind erforderlich.")).toBeVisible();
  await expect(page).toHaveURL(/\/submit/);

  // 3) Sonderzeichen-Titel: Seite bleibt funktional, kein Crash/XSS
  await page.getByPlaceholder("z. B. Aurora Button").fill('X<script>"&äöü Test!!');
  await expect(page.getByPlaceholder("Kurz, was die Komponente macht")).toBeVisible();
  await expect(submitBtn).toBeVisible();
});
