import type { UIComponent, CategoryMeta } from "./types";

export const CATEGORIES: CategoryMeta[] = [
  { slug: "buttons", label: "Buttons" },
  { slug: "cards", label: "Cards" },
  { slug: "loaders", label: "Loader" },
  { slug: "inputs", label: "Inputs" },
  { slug: "toggles", label: "Toggles" },
  { slug: "backgrounds", label: "Backgrounds" },
];

export const FRAMEWORKS: { slug: string; label: string }[] = [
  { slug: "html", label: "HTML/CSS" },
  { slug: "tailwind", label: "Tailwind" },
  { slug: "react", label: "React" },
  { slug: "vue", label: "Vue" },
  { slug: "svelte", label: "Svelte" },
];

export const COMPONENTS: UIComponent[] = [
  {
    id: "1",
    slug: "aurora-button",
    title: "Aurora Button",
    description:
      "Button mit animierter Verlaufs-Aura — auffällig, aber leichtgewichtig (nur CSS, keine Abhängigkeiten).",
    framework: "html",
    category: "buttons",
    tags: ["gradient", "glow", "animation"],
    html: `<button class="aurora">Jetzt starten</button>`,
    css: `.aurora{position:relative;padding:14px 30px;border:0;border-radius:14px;background:#0d0d16;color:#fff;font:600 16px/1 system-ui;cursor:pointer;isolation:isolate}
.aurora::before{content:"";position:absolute;inset:-2px;border-radius:16px;background:conic-gradient(from 0deg,#f5a623,#ff6b4a,#ffce6b,#f5a623);z-index:-1;animation:spin 4s linear infinite}
.aurora::after{content:"";position:absolute;inset:0;border-radius:14px;background:#0d0d16;z-index:-1}
@keyframes spin{to{transform:rotate(360deg)}}`,
    js: "",
    author: "elementa",
    likes: 214,
    a11y: "pass",
    createdAt: "2026-06-28",
  },
  {
    id: "2",
    slug: "glow-card",
    title: "Spotlight Glow Card",
    description:
      "Karte mit weichem Rand-Glow beim Hover. Tailwind-Utility-Klassen, sofort einsetzbar.",
    framework: "tailwind",
    category: "cards",
    tags: ["glass", "hover", "spotlight"],
    html: `<div class="group relative w-72 rounded-2xl border border-white/10 bg-neutral-900 p-6 transition hover:border-amber-400/40">
  <div class="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style="background:radial-gradient(400px circle at 50% 0,rgba(245,166,35,.18),transparent 40%)"></div>
  <h3 class="text-lg font-semibold text-white">Elementa Pro</h3>
  <p class="mt-2 text-sm text-neutral-400">Effektreiche Komponenten, DSGVO-konform, kostenlos.</p>
  <button class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">Mehr</button>
</div>`,
    css: "",
    js: "",
    author: "elementa",
    likes: 178,
    a11y: "pass",
    createdAt: "2026-06-29",
  },
  {
    id: "3",
    slug: "orbit-loader",
    title: "Orbit Loader",
    description: "Minimalistischer Orbit-Spinner aus reinem CSS. Respektiert prefers-reduced-motion.",
    framework: "css",
    category: "loaders",
    tags: ["spinner", "minimal", "a11y"],
    html: `<div class="orbit"><span></span><span></span><span></span></div>`,
    css: `.orbit{position:relative;width:60px;height:60px}
.orbit span{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;border-top-color:#f5a623;animation:o 1.2s linear infinite}
.orbit span:nth-child(2){border-top-color:#ff6b4a;animation-duration:1.8s}
.orbit span:nth-child(3){border-top-color:#ffce6b;animation-duration:2.4s}
@keyframes o{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion){.orbit span{animation:none;opacity:.6}}`,
    js: "",
    author: "aylin",
    likes: 96,
    a11y: "pass",
    createdAt: "2026-06-30",
  },
  {
    id: "4",
    slug: "magnetic-button",
    title: "Magnetic Button",
    description:
      "React-Button, der dem Cursor folgt. Zero-Dependency (kein Framer Motion) — nur ein State-Hook.",
    framework: "react",
    category: "buttons",
    tags: ["react", "interactive", "hover"],
    html: `function MagneticButton(){
  const [p,setP]=React.useState({x:0,y:0});
  return (
    <button
      onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();
        setP({x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.3})}}
      onMouseLeave={()=>setP({x:0,y:0})}
      style={{transform:\`translate(\${p.x}px,\${p.y}px)\`,transition:"transform .15s ease-out",
        padding:"14px 32px",borderRadius:14,border:0,cursor:"pointer",
        background:"linear-gradient(120deg,#f5a623,#ff6b4a)",color:"#0a0a0f",font:"600 16px system-ui"}}>
      Zieh mich
    </button>
  );
}`,
    css: "",
    js: "",
    author: "elementa",
    likes: 331,
    a11y: "warn",
    createdAt: "2026-06-27",
  },
  {
    id: "5",
    slug: "gradient-toggle",
    title: "Gradient Toggle",
    description: "Sanfter Umschalter mit Verlauf. Reines HTML/CSS, tastaturbedienbar.",
    framework: "html",
    category: "toggles",
    tags: ["switch", "gradient", "a11y"],
    html: `<label class="tg"><input type="checkbox" checked aria-label="Umschalten" /><span class="tr"></span></label>`,
    css: `.tg{display:inline-block;cursor:pointer}
.tg input{position:absolute;opacity:0}
.tr{display:block;width:58px;height:32px;border-radius:99px;background:#26263a;position:relative;transition:.3s}
.tr::after{content:"";position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;transition:.3s}
.tg input:checked+.tr{background:linear-gradient(120deg,#f5a623,#ff6b4a)}
.tg input:checked+.tr::after{transform:translateX(26px)}
.tg input:focus-visible+.tr{outline:2px solid #ffce6b;outline-offset:2px}`,
    js: "",
    author: "mert",
    likes: 142,
    a11y: "pass",
    createdAt: "2026-06-26",
  },
  {
    id: "6",
    slug: "aurora-background",
    title: "Aurora Background",
    description: "Weicher, animierter Verlaufs-Hintergrund für Hero-Sektionen. GPU-schonend.",
    framework: "css",
    category: "backgrounds",
    tags: ["gradient", "hero", "animation"],
    html: `<div class="aur"><h2>Elementa</h2></div>`,
    css: `.aur{position:relative;width:100%;height:220px;border-radius:16px;overflow:hidden;display:grid;place-items:center;background:#07070b}
.aur::before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,#f5a623,#ff6b4a,#ffce6b,#f5a623);filter:blur(70px);opacity:.55;animation:sp 8s linear infinite}
.aur h2{position:relative;color:#fff;font:700 34px system-ui;letter-spacing:-1px}
@keyframes sp{to{transform:rotate(360deg)}}`,
    js: "",
    author: "aylin",
    likes: 205,
    a11y: "pass",
    createdAt: "2026-06-25",
  },
];

export function getComponent(slug: string): UIComponent | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}
