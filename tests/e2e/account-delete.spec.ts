import { test, expect } from "./fixtures";
import { loginAsFreshUser } from "./helpers";

// Flow 6 (§10): Konto-Löschung (Deaktivierung) — mit frischem Wegwerf-Konto
test("Konto deaktivieren: sofortiger Logout, Login danach unmöglich", async ({ page }) => {
  const user = await loginAsFreshUser(page);

  await page.goto("/profil");
  // Gefahrenzone liegt im Einstellungen-Tab
  await page.getByRole("button", { name: "Einstellungen" }).click();
  // Dialog öffnen → bestätigen (zweiter Button gleichen Namens im Dialog)
  await page.getByRole("button", { name: "Konto deaktivieren" }).first().click();
  await expect(page.getByText("Konto deaktivieren?")).toBeVisible();
  await page.getByRole("button", { name: "Konto deaktivieren" }).last().click();

  // Nach Deaktivierung: abgemeldet
  await expect(page.getByText("Bitte melde dich an")).toBeVisible({ timeout: 20_000 });

  // Login mit deaktiviertem Konto scheitert (bleibt auf /login, Fehlermeldung)
  await page.goto("/login");
  await page.getByPlaceholder("E-Mail").fill(user.email);
  await page.getByPlaceholder("Passwort", { exact: false }).fill(user.password);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/\/login/);
});
