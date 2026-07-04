// Testet: Filter setzen → scrollen → Detailseite → zurück → gleiche Position + Filter?
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle2", timeout: 60000 });

// Framework-Filter "Svelte" klicken
await page.evaluate(() => {
  const chip = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Svelte");
  chip?.click();
});
await new Promise((r) => setTimeout(r, 800));
console.log("URL nach Filter:", await page.evaluate(() => location.search));

// runter scrollen
await page.evaluate(() => window.scrollTo(0, 600));
await new Promise((r) => setTimeout(r, 600));
const before = await page.evaluate(() => window.scrollY);

// erste Karte öffnen
await page.evaluate(() => {
  document.querySelector("article a[href^='/c/']")?.click();
});
await page.waitForFunction(() => location.pathname.startsWith("/c/"), { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1500));
console.log("Detailseite:", await page.evaluate(() => location.pathname));

// zurück
await page.goBack({ waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1500));
const after = await page.evaluate(() => ({ y: window.scrollY, url: location.pathname + location.search }));
console.log(`Scroll vorher=${before} nachher=${after.y} | URL: ${after.url}`);
console.log(Math.abs(after.y - before) < 60 && after.url.includes("fw=svelte") ? "✓ Zurück-Navigation OK" : "✗ PROBLEM");
await browser.close();
