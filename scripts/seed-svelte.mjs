/**
 * Seedet die ersten zwei Svelte-Komponenten (Live-Preview-Showcase).
 * Wahrheitsregel: likesCount 0, a11y "unchecked" (der axe-Audit setzt den echten Wert).
 * Start: APPWRITE_API_KEY="<key>" node scripts/seed-svelte.mjs
 */
import { Client, Databases, ID, Query } from "node-appwrite";

const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }
const db = new Databases(
  new Client()
    .setEndpoint("https://appwrite.it-handwerk-stuttgart.de/v1")
    .setProject("6a4453770009b9e7f029")
    .setKey(apiKey),
);

const BELKIS_ID = "6a447115002c7120de36";

const COMPONENTS = [
  {
    title: "Svelte Spring Magnetic Button",
    slug: "svelte-spring-magnetic-button",
    description:
      "Magnetischer Button mit echter Federphysik: svelte/motion-Spring folgt dem Cursor und schnappt sanft zurück. Zero-Dependency — die Physik bringt Svelte mit.",
    framework: "svelte",
    category: "buttons",
    tags: ["svelte", "spring", "interactive", "magnetic"],
    html: `<script>
  import { spring } from 'svelte/motion';

  const pos = spring({ x: 0, y: 0 }, { stiffness: 0.12, damping: 0.35 });

  function move(e) {
    const r = e.currentTarget.getBoundingClientRect();
    pos.set({
      x: (e.clientX - r.left - r.width / 2) * 0.35,
      y: (e.clientY - r.top - r.height / 2) * 0.35,
    });
  }
</script>

<button
  class="magnet"
  on:mousemove={move}
  on:mouseleave={() => pos.set({ x: 0, y: 0 })}
  style="transform: translate({$pos.x}px, {$pos.y}px)"
>
  Zieh mich
</button>

<style>
  .magnet {
    padding: 14px 32px;
    border: 0;
    border-radius: 14px;
    cursor: pointer;
    background: linear-gradient(120deg, #8b5cf6, #d946ef);
    color: #fff;
    font: 600 16px system-ui, sans-serif;
  }
  .magnet:focus-visible {
    outline: 2px solid #c4b5fd;
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    .magnet { transform: none !important; }
  }
</style>`,
    css: "",
    js: "",
  },
  {
    title: "Svelte Tweened Progress Ring",
    slug: "svelte-tweened-progress-ring",
    description:
      "Animierter Fortschritts-Ring mit svelte/motion-Tween und kubischem Easing. Klick setzt einen neuen Zielwert — der Ring gleitet butterweich hin.",
    framework: "svelte",
    category: "loaders",
    tags: ["svelte", "tweened", "progress", "ring"],
    html: `<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const progress = tweened(0.72, { duration: 900, easing: cubicOut });
  const R = 52;
  const C = 2 * Math.PI * R;

  function randomize() {
    progress.set(Math.round((0.15 + Math.random() * 0.85) * 100) / 100);
  }
</script>

<button class="ring-btn" on:click={randomize} aria-label="Neuen Zufallswert animieren">
  <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-hidden="true">
    <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10" />
    <circle
      cx="70" cy="70" r={R} fill="none"
      stroke="url(#ring-grad)" stroke-width="10" stroke-linecap="round"
      stroke-dasharray={C}
      stroke-dashoffset={C * (1 - $progress)}
      transform="rotate(-90 70 70)"
    />
    <defs>
      <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8b5cf6" />
        <stop offset="0.5" stop-color="#d946ef" />
        <stop offset="1" stop-color="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
  <span class="value">{Math.round($progress * 100)}%</span>
</button>

<style>
  .ring-btn {
    position: relative;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
  }
  .value {
    position: absolute;
    color: #fff;
    font: 700 24px system-ui, sans-serif;
    letter-spacing: -0.02em;
  }
  .ring-btn:focus-visible {
    outline: 2px solid #c4b5fd;
    outline-offset: 4px;
    border-radius: 16px;
  }
</style>`,
    css: "",
    js: "",
  },
];

for (const c of COMPONENTS) {
  const { total } = await db.listDocuments("marketplace", "components", [
    Query.equal("slug", c.slug), Query.limit(1),
  ]);
  if (total > 0) { console.log(`· existiert schon: ${c.slug}`); continue; }
  await db.createDocument("marketplace", "components", ID.unique(), {
    ...c,
    authorId: BELKIS_ID,
    authorUsername: "Belkis",
    a11y: "unchecked",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  console.log(`✓ geseedet: ${c.slug}`);
}
console.log("Fertig.");
