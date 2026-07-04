// Rendert die App-Icons (PNG) aus src/app/icon.svg
import puppeteer from "puppeteer-core";
import { readFileSync } from "fs";

const svg = readFileSync("src/app/icon.svg", "utf8");
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function render(size, out, pad = 0) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  // Apple-Icons: kein Alpha, eigene Hintergrundfläche + Innenabstand
  const bg = pad ? "#0b0b12" : "transparent";
  const inner = size - pad * 2;
  await page.setContent(
    `<body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">
       <div style="width:${inner}px;height:${inner}px">${svg.replace(/width="48" height="48"/, `width="${inner}" height="${inner}"`)}</div>
     </body>`,
  );
  await page.screenshot({ path: out, omitBackground: !pad });
  await page.close();
  console.log("OK", out);
}

await render(512, "src/app/icon.png");
await render(180, "src/app/apple-icon.png", 18);
await browser.close();
