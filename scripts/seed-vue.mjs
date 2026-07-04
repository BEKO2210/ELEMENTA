/**
 * Seedet die ersten zwei Vue-Komponenten (SFC-Format im html-Feld).
 * Wahrheitsregel: likesCount 0, a11y "unchecked" (der axe-Audit setzt den echten Wert).
 * Start: APPWRITE_API_KEY="<key>" node scripts/seed-vue.mjs
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
    title: "Vue Ripple Button",
    slug: "vue-ripple-button",
    description:
      "Material-inspirierter Ripple-Effekt, sauber in Vue gelöst: Jeder Klick spawnt eine Welle an der Cursor-Position, alte Wellen räumen sich selbst auf.",
    framework: "vue",
    category: "buttons",
    tags: ["vue", "ripple", "interactive", "material"],
    html: `<template>
  <button class="ripple-btn" @click="addRipple">
    Klick mich
    <span
      v-for="r in ripples"
      :key="r.id"
      class="ripple"
      :style="{ left: r.x + 'px', top: r.y + 'px' }"
    ></span>
  </button>
</template>

<script>
export default {
  data: () => ({ ripples: [], nextId: 0 }),
  methods: {
    addRipple(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = this.nextId++;
      this.ripples.push({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => {
        this.ripples = this.ripples.filter((r) => r.id !== id);
      }, 650);
    },
  },
};
</script>

<style>
.ripple-btn {
  position: relative;
  overflow: hidden;
  padding: 14px 34px;
  border: 0;
  border-radius: 14px;
  cursor: pointer;
  background: linear-gradient(120deg, #8b5cf6, #d946ef);
  color: #fff;
  font: 600 16px system-ui, sans-serif;
}
.ripple-btn:focus-visible {
  outline: 2px solid #c4b5fd;
  outline-offset: 3px;
}
.ripple {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%) scale(0);
  animation: rip 0.65s ease-out forwards;
  pointer-events: none;
}
@keyframes rip {
  to { transform: translate(-50%, -50%) scale(22); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ripple { animation: none; opacity: 0; }
}
</style>`,
    css: "",
    js: "",
  },
  {
    title: "Vue Heart Like Button",
    slug: "vue-heart-like-button",
    description:
      "Like-Button mit Pop-Animation und Zähler — Vue-Reaktivität pur: Zustand, Klasse und Zahl hängen an einem einzigen data-Feld.",
    framework: "vue",
    category: "toggles",
    tags: ["vue", "like", "heart", "micro-interaction"],
    html: `<template>
  <button
    class="like"
    :class="{ liked }"
    :aria-pressed="liked ? 'true' : 'false'"
    @click="toggle"
  >
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 21s-6.7-4.6-9.3-8.4C.5 9.4 1.7 5.5 5 4.5c2-.6 4.1.2 5.3 1.9l1.7 2.3 1.7-2.3c1.2-1.7 3.3-2.5 5.3-1.9 3.3 1 4.5 4.9 2.3 8.1C18.7 16.4 12 21 12 21z"
        :fill="liked ? '#fb7185' : 'none'"
        :stroke="liked ? '#fb7185' : '#a8a6b8'"
        stroke-width="1.8"
      />
    </svg>
    <span class="count">{{ count }}</span>
  </button>
</template>

<script>
export default {
  data: () => ({ liked: false, count: 128 }),
  methods: {
    toggle() {
      this.liked = !this.liked;
      this.count += this.liked ? 1 : -1;
    },
  },
};
</script>

<style>
.like {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: #e7e5ef;
  font: 600 15px system-ui, sans-serif;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.like:hover { border-color: rgba(251, 113, 133, 0.5); }
.like:focus-visible { outline: 2px solid #fda4af; outline-offset: 3px; }
.like.liked svg { animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.4); }
.count { min-width: 3ch; text-align: left; font-variant-numeric: tabular-nums; }
@keyframes pop {
  0% { transform: scale(0.6); }
  60% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .like.liked svg { animation: none; }
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
