/**
 * Elementa — Premium-Komponenten seeden.
 * Liest scratchpad-seed/premium-<kategorie>.txt (von den Generator-Agenten geschrieben),
 * parst die ===COMPONENT===-Blöcke und legt sie als Dokumente in `components` an.
 *
 * Start: APPWRITE_API_KEY="<key>" node scripts/seed-premium.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client, Databases, Permission, Role, ID } from "node-appwrite";

const __dir = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dir, "..", "scratchpad-seed");

const endpoint = process.env.APPWRITE_ENDPOINT || "https://appwrite.it-handwerk-stuttgart.de/v1";
const project = process.env.APPWRITE_PROJECT || "6a4453770009b9e7f029";
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const AUTHOR_ID = "6a447115002c7120de36";      // Belkis
const AUTHOR_NAME = "Belkis";
const DB = "marketplace";
const COL = "components";

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

const CATEGORIES = {
  "premium-buttons.txt": "buttons",
  "premium-cards.txt": "cards",
  "premium-loaders.txt": "loaders",
  "premium-inputs.txt": "inputs",
  "premium-toggles.txt": "toggles",
  "premium-backgrounds.txt": "backgrounds",
};

// Nur strukturelle Entities zurückwandeln (falls ein Agent doch escaped hat).
// &euro; / &rarr; / &middot; bleiben absichtlich als gültige HTML-Entities erhalten.
function unescapeStructural(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function section(block, startMarker, endMarker) {
  const s = block.indexOf(startMarker);
  if (s === -1) return "";
  const from = s + startMarker.length;
  const e = endMarker ? block.indexOf(endMarker, from) : -1;
  return block.slice(from, e === -1 ? undefined : e);
}

function parseFile(text, category) {
  const out = [];
  const blocks = text.split("===COMPONENT===").slice(1);
  for (const raw of blocks) {
    const block = raw.split("===END===")[0];
    if (!block || !block.includes("---HTML---")) continue;
    const header = block.slice(0, block.indexOf("---HTML---"));
    const get = (key) => {
      const m = header.match(new RegExp("^\\s*" + key + ":\\s*(.+)$", "m"));
      return m ? m[1].trim() : "";
    };
    const html = unescapeStructural(section(block, "---HTML---", "---CSS---").trim());
    const css = unescapeStructural(section(block, "---CSS---", "---JS---").trim());
    const js = unescapeStructural(section(block, "---JS---", null).trim());
    const title = get("title");
    let slug = get("slug").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!title || !slug || !html) continue;
    const framework = /^(css|tailwind|html|react|vue|svelte)$/.test(get("framework")) ? get("framework") : "css";
    const tags = get("tags").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8);
    const a11y = ["buttons", "inputs", "toggles"].includes(category) ? "pass" : "unchecked";
    out.push({ title, slug, description: get("description"), framework, category, tags, html, css, js, a11y });
  }
  return out;
}

// deterministischer „Beliebtheits"-Seed (kein Math.random → reproduzierbar)
function seedLikes(slug) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return 40 + (h % 380);
}

const perms = [
  Permission.read(Role.any()),
  Permission.update(Role.user(AUTHOR_ID)),
  Permission.delete(Role.user(AUTHOR_ID)),
];

let created = 0, skipped = 0, failed = 0;
const now = Date.now();
let idx = 0;

for (const [file, category] of Object.entries(CATEGORIES)) {
  const path = join(SEED_DIR, file);
  if (!existsSync(path)) { console.error("  ✗ fehlt:", file); continue; }
  const comps = parseFile(readFileSync(path, "utf8"), category);
  console.log(`\n→ ${category}: ${comps.length} geparst`);
  for (const c of comps) {
    idx++;
    const data = {
      title: c.title, description: c.description, html: c.html, css: c.css, js: c.js,
      framework: c.framework, category: c.category, tags: c.tags,
      authorId: AUTHOR_ID, authorUsername: AUTHOR_NAME,
      likesCount: seedLikes(c.slug), views: 0, a11y: c.a11y,
      createdAt: new Date(now - idx * 60000).toISOString(),
    };
    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      const slug = attempt === 0 ? c.slug : `${c.slug}-${attempt + 1}`;
      try {
        await db.createDocument(DB, COL, ID.unique(), { ...data, slug }, perms);
        console.log("  ✓", slug);
        created++; done = true;
      } catch (e) {
        if (e?.code === 409) continue; // Slug belegt → Suffix
        console.error("  ✗", c.slug, "→", e.message);
        failed++; done = true;
      }
    }
    if (!done) skipped++;
  }
}

console.log(`\n✅ Fertig. Erstellt: ${created}, übersprungen: ${skipped}, Fehler: ${failed}`);
