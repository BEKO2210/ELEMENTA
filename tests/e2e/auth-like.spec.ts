import { test, expect } from "./fixtures";
import { ensureLoggedIn, logout, firstComponentSlug } from "./helpers";

// Flow 3 (§10): Login → Like → Unlike → Logout (persistenter Nutzer aus global-setup)
test("Auth: Login → Like → Unlike → Abmelden", async ({ page }) => {
  await ensureLoggedIn(page);

  const slug = await firstComponentSlug(page);
  await page.goto(`/c/${slug}`);

  // Präziser Selektor: auch FavoriteButton/PreviewStage tragen aria-pressed
  const likeBtn = page.getByRole("button", { name: /^Gefällt (mir|dir)/ });
  await expect(likeBtn).toBeVisible();
  const before = (await likeBtn.getAttribute("aria-pressed")) === "true";

  // Like togglen und auf Zustandswechsel warten
  await likeBtn.click();
  await expect(likeBtn).toHaveAttribute("aria-pressed", String(!before), { timeout: 15_000 });

  // Unlike: zurück zum Ausgangszustand (kein Netto-Effekt auf Live-Daten)
  await likeBtn.click();
  await expect(likeBtn).toHaveAttribute("aria-pressed", String(before), { timeout: 15_000 });

  await logout(page);
  // Nach Logout: /profil verlangt wieder Anmeldung
  await page.goto("/profil");
  await expect(page.getByText("Bitte melde dich an")).toBeVisible({ timeout: 15_000 });
});
