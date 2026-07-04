// Untersucht die Karten-iframes auf der Startseite im Detail
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
const logs = [];
page.on("console", (m) => { if (m.type() === "error") logs.push(m.text().slice(0, 200)); });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await page.evaluate(async () => {
  for (let y = 0; y <= 1200; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
});
await new Promise((r) => setTimeout(r, 3000));

for (const frame of page.frames()) {
  if (!frame.url().includes("sandbox.html")) continue;
  try {
    const info = await frame.evaluate(() => {
      const stage = document.getElementById("__stage");
      const r = stage?.getBoundingClientRect();
      const cs = stage ? getComputedStyle(stage) : null;
      return {
        fit: document.body.className,
        bg: document.body.style.background,
        children: stage?.children.length,
        firstChild: stage?.firstElementChild?.tagName,
        stageRect: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
        stageDisplay: cs?.display,
        transform: stage?.style.transform,
        cssLen: document.getElementById("__user-css")?.textContent?.length,
        html: (stage?.innerHTML || "").slice(0, 120),
        winW: window.innerWidth,
        winH: window.innerHeight,
      };
    });
    console.log(JSON.stringify(info));
  } catch (e) {
    console.log("frame err:", e.message.slice(0, 120));
  }
}
console.log("--- console errors:", logs.length ? logs.join("\n") : "keine");
await browser.close();
