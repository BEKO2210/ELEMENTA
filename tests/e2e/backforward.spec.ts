import { test, expect } from "./fixtures";
import { firstComponentSlug } from "./helpers";

// Flow 5 (§10): Back/Forward-Matrix Home ↔ Detail ↔ Explore ↔ Guide
test("Back/Forward: Navigation stellt Seiten exakt wieder her", async ({ page }) => {
  const slug = await firstComponentSlug(page);

  await page.goto("/");
  await page.goto(`/c/${slug}`);
  await page.goto("/explore?cat=buttons");
  await page.goto("/guides");

  // Zurück durch die History
  await page.goBack();
  await expect(page).toHaveURL(/\/explore\?cat=buttons/);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/c/${slug}`));
  await page.goBack();
  await expect(page).toHaveURL(/\/$|\/\?/);

  // Vorwärts
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`/c/${slug}`));
  await page.goForward();
  await expect(page).toHaveURL(/\/explore\?cat=buttons/);
  // Explore hat den Kategorie-Filter aus der URL wiederhergestellt
  await expect(page.locator('a[href^="/c/"]').first()).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/guides/);
});
