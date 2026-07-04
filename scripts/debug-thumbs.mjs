// Untersucht Karten-Thumbnails einer Kategorie: Stage-Größe, Transform, Sichtbarkeit.
// node scripts/debug-thumbs.mjs <kategorie> <breite>
import puppeteer from "puppeteer-core";

const [cat = "backgrounds", width = "390"] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: +width, height: 900 });
await page.goto(`http://localhost:3000/explore?cat=${cat}`, { waitUntil: "networkidle2", timeout: 60000 });
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
});
await new Promise((r) => setTimeout(r, 3500));

// Titel-Zuordnung: iframe → umgebende Karte → h3
const cards = await page.evaluate(() => {
  return [...document.querySelectorAll("article")].map((a) => ({
    title: a.querySelector("h3")?.textContent?.trim(),
    hasIframe: !!a.querySelector("iframe"),
  }));
});
console.log("Karten:", JSON.stringify(cards));

let i = 0;
for (const frame of page.frames()) {
  if (!frame.url().includes("sandbox.html")) continue;
  try {
    const info = await frame.evaluate(() => {
      const stage = document.getElementById("__stage");
      const r = stage?.getBoundingClientRect();
      const first = stage?.firstElementChild;
      const fr = first?.getBoundingClientRect();
      const cs = first ? getComputedStyle(first) : null;
      return {
        stage: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
        first: fr ? { w: Math.round(fr.width), h: Math.round(fr.height) } : null,
        firstPos: cs?.position,
        firstTag: first?.tagName,
        transform: stage?.style.transform || "none",
        win: { w: window.innerWidth, h: window.innerHeight },
        html: (stage?.innerHTML || "").slice(0, 80).replace(/\n/g, " "),
      };
    });
    console.log(`[${i++}]`, JSON.stringify(info));
  } catch (e) {
    console.log(`[${i++}] err:`, e.message.slice(0, 80));
  }
}
await page.screenshot({ path: `/tmp/claude-1000/-home-belkis/f23cf422-1243-47da-b182-4a1b72ad827d/scratchpad/thumbs-${cat}-${width}.png`, fullPage: true });
await browser.close();
