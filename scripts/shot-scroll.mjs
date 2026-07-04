// Viewport-Screenshot an einer Scroll-Position (löst whileInView-Animationen echt aus)
// node scripts/shot-scroll.mjs <url> <outfile> <scrollY> [width]
import puppeteer from "puppeteer-core";

const [url, out, scrollY = "0", w = "1440"] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: +w, height: 1000 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
try {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /nur notwendige/i.test(b.textContent || ""),
    );
    btn?.click();
  });
} catch {}
await new Promise((r) => setTimeout(r, 1500));
// sanft hinscrollen, damit IntersectionObserver/whileInView feuern
await page.evaluate(async (target) => {
  for (let y = 0; y <= target; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 100));
  }
  window.scrollTo(0, target);
}, +scrollY);
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: out });
await browser.close();
console.log("OK", out);
