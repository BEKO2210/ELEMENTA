// Screenshot-Helfer: node scripts/shot.mjs <url> <outfile> [width] [height] [fullpage]
import puppeteer from "puppeteer-core";

const [url, out, w = "1440", h = "1000", full = ""] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
// Cookie-Banner wegklicken, damit er nicht jedes Bild verdeckt
try {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /nur notwendige/i.test(b.textContent || ""),
    );
    btn?.click();
  });
} catch {}
await new Promise((r) => setTimeout(r, 2500));
if (full === "fullpage") {
  // Erst komplett durchscrollen, damit lazy-Inhalte + Reveal-Animationen feuern
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1200));
}
await page.screenshot({ path: out, fullPage: full === "fullpage" });
await browser.close();
console.log("OK", out);
