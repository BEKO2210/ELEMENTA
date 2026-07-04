import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3000/c/magnetic-button";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const logs = [];
page.on("console", (m) => logs.push(`[console:${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) =>
  logs.push(`[reqfail] ${r.url()} -> ${r.failure()?.errorText}`),
);

await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 4000));

// In alle Frames schauen: was steht im #root / body?
for (const frame of page.frames()) {
  if (frame === page.mainFrame()) continue;
  try {
    const info = await frame.evaluate(() => ({
      rootHtml: document.getElementById("root")?.innerHTML?.slice(0, 200) ?? null,
      bodyText: document.body?.innerText?.slice(0, 200),
      scripts: [...document.scripts].map((s) => s.src || "(inline)"),
      hasReact: typeof window.React !== "undefined",
      hasBabel: typeof window.Babel !== "undefined",
    }));
    console.log("FRAME:", JSON.stringify(info, null, 2));
  } catch (e) {
    console.log("FRAME eval failed:", e.message);
  }
}

console.log("--- LOGS ---");
for (const l of logs) console.log(l);

await page.screenshot({ path: process.argv[3] || "/tmp/claude-1000/-home-belkis/f23cf422-1243-47da-b182-4a1b72ad827d/scratchpad/magnetic-before.png", fullPage: false });
await browser.close();
