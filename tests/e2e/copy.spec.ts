import { test, expect } from "./fixtures";
import { firstComponentSlug } from "./helpers";

// Flow 2 (§10): Copy-Button legt den Code in die Zwischenablage
test("Copy-Button: Code landet in der Zwischenablage", async ({ page }) => {
  const slug = await firstComponentSlug(page);
  await page.goto(`/c/${slug}`);

  const copyBtn = page.getByRole("button", { name: /Kopieren|Code kopieren/ }).first();
  await copyBtn.click();
  await expect(page.getByText("Kopiert!").first()).toBeVisible();

  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip.trim().length, "Zwischenablage enthält Code").toBeGreaterThan(0);
});
