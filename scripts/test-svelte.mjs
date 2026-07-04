// Testet die Svelte-Live-Preview in der Sandbox (top-level self-postMessage).
import puppeteer from "puppeteer-core";

const SVELTE_SRC = `<script>
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';
  const count = writable(0);
  let visible = true;
</script>

<div class="wrap">
  <button class="btn" on:click={() => { $count += 1; visible = !visible; }}>
    Geklickt: {$count}
  </button>
  {#if visible}
    <p transition:fade class="hint">Svelte läuft live!</p>
  {/if}
</div>

<style>
  .wrap { display: grid; gap: 12px; place-items: center; }
  .btn {
    padding: 12px 28px; border: 0; border-radius: 12px; cursor: pointer;
    background: linear-gradient(120deg, #8b5cf6, #d946ef); color: #fff;
    font: 600 15px system-ui;
  }
  .hint { color: #a8a6b8; font: 13px system-ui; margin: 0; }
</style>`;

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 500 });
const logs = [];
page.on("console", (m) => { if (m.type() === "error") logs.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => logs.push("pageerror: " + e.message.slice(0, 200)));

await page.goto("http://localhost:3000/sandbox.html", { waitUntil: "domcontentloaded" });
await page.evaluate((src) => {
  window.postMessage({ type: "elementa:render", framework: "svelte", html: src, css: "", js: "", bg: "#0b0b12", fit: false }, "*");
}, SVELTE_SRC);

try {
  await page.waitForFunction(() => document.querySelector("#__stage button")?.textContent.includes("Geklickt"), { timeout: 15000 });
  console.log("✓ gemountet:", await page.$eval("#__stage button", (b) => b.textContent.trim()));
  // Interaktivität: Klick erhöht Zähler + Transition togglet
  await page.click("#__stage button");
  await new Promise((r) => setTimeout(r, 400));
  console.log("✓ nach Klick:", await page.$eval("#__stage button", (b) => b.textContent.trim()));
  console.log("✓ hint sichtbar:", await page.$("#__stage .hint") ? "nein (weg-transitioned)" : "korrekt entfernt");
} catch (e) {
  console.log("✗ FEHLGESCHLAGEN:", e.message.slice(0, 150));
  console.log("Stage:", await page.evaluate(() => document.getElementById("__stage")?.innerHTML.slice(0, 300)));
}
if (logs.length) console.log("Konsole:", logs.join("\n"));

await page.screenshot({ path: "/tmp/claude-1000/-home-belkis/f23cf422-1243-47da-b182-4a1b72ad827d/scratchpad/svelte-test.png" });
await browser.close();
