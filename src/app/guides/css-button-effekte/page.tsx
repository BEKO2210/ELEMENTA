import type { Metadata } from "next";
import Link from "next/link";
import { getGuide } from "@/lib/guides";
import { GuideShell, Lead, H2, P, InlineCode, CodeBlock, Callout } from "@/components/guide";

const guide = getGuide("css-button-effekte")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guides/${guide.slug}` },
  openGraph: { title: `${guide.title} · Elementa`, description: guide.description, type: "article", url: `/guides/${guide.slug}` },
};

export default function Page() {
  return (
    <GuideShell guide={guide}>
      <Lead>
        Ein guter Button ist das kleinste Interface-Detail mit der größten Wirkung. Hier sind
        zehn moderne Effekte in reinem CSS — keine Bibliothek, keine Abhängigkeiten. Kopieren,
        einfügen, fertig.
      </Lead>

      <Callout>
        Alle Beispiele setzen eine Basis-Klasse voraus:{" "}
        <InlineCode>{`.btn { padding: 12px 26px; border: 0; border-radius: 12px; font: 600 15px system-ui; cursor: pointer; }`}</InlineCode>
      </Callout>

      <H2 id="glow">1. Weicher Glow</H2>
      <P>Ein farbiger Schein, der beim Hover aufleuchtet — dezent und premium.</P>
      <CodeBlock
        code={`.btn-glow {
  background: #7c3aed;
  color: #fff;
  transition: box-shadow .25s ease;
}
.btn-glow:hover {
  box-shadow: 0 0 24px -2px rgba(124, 58, 237, .7);
}`}
      />

      <H2 id="gradient-border">2. Animierter Gradient-Rahmen</H2>
      <P>
        Ein rotierender Verlaufs-Rahmen über ein Pseudo-Element und eine{" "}
        <InlineCode>mask</InlineCode> — der Klassiker im „Uiverse"-Stil.
      </P>
      <CodeBlock
        code={`.btn-gradient {
  position: relative;
  background: #0d0d16;
  color: #fff;
  isolation: isolate;
}
.btn-gradient::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, #8b5cf6, #d946ef, #06b6d4, #8b5cf6);
  z-index: -1;
  animation: spin 4s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }`}
      />

      <H2 id="shine">3. Shine-Sweep</H2>
      <P>Ein Lichtstreifen, der beim Hover über den Button gleitet.</P>
      <CodeBlock
        code={`.btn-shine {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #7c3aed, #c026d3);
  color: #fff;
}
.btn-shine::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.4) 50%, transparent 70%);
  transform: translateX(-130%) skewX(-18deg);
  transition: transform .7s ease;
}
.btn-shine:hover::after { transform: translateX(130%) skewX(-18deg); }`}
      />

      <H2 id="lift">4. 3D-Lift</H2>
      <P>Der Button hebt sich beim Hover leicht an — subtiles Tiefengefühl.</P>
      <CodeBlock
        code={`.btn-lift {
  background: #16161f;
  color: #fff;
  transition: transform .2s ease, box-shadow .2s ease;
}
.btn-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -8px rgba(0,0,0,.6);
}`}
      />

      <H2 id="fill">5. Slide-Fill</H2>
      <P>Eine Füllung wischt beim Hover von links herein.</P>
      <CodeBlock
        code={`.btn-fill {
  position: relative;
  overflow: hidden;
  background: transparent;
  border: 1px solid #8b5cf6;
  color: #8b5cf6;
  transition: color .3s ease;
  z-index: 0;
}
.btn-fill::before {
  content: "";
  position: absolute;
  inset: 0;
  background: #8b5cf6;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .3s ease;
  z-index: -1;
}
.btn-fill:hover { color: #fff; }
.btn-fill:hover::before { transform: scaleX(1); }`}
      />

      <H2 id="pulse">6. Puls-Ring</H2>
      <P>Ein ausklingender Ring signalisiert eine wichtige Aktion.</P>
      <CodeBlock
        code={`.btn-pulse {
  background: #06b6d4;
  color: #04121a;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(6, 182, 212, .5); }
  70%  { box-shadow: 0 0 0 12px rgba(6, 182, 212, 0); }
  100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
}
@media (prefers-reduced-motion: reduce) { .btn-pulse { animation: none; } }`}
      />

      <H2 id="underline">7. Gleitender Unterstrich</H2>
      <P>Perfekt für Text- bzw. Ghost-Buttons in der Navigation.</P>
      <CodeBlock
        code={`.btn-underline {
  position: relative;
  background: none;
  color: #f4f3f8;
  padding: 6px 2px;
  border-radius: 0;
}
.btn-underline::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .28s ease;
}
.btn-underline:hover::after { transform: scaleX(1); }`}
      />

      <H2 id="magnetic">8. Magnetic (mit 3 Zeilen JS)</H2>
      <P>
        Der Button folgt leicht dem Cursor. Der einzige Effekt hier, der ein bisschen JavaScript
        braucht — aber ohne Bibliothek.
      </P>
      <CodeBlock
        label="HTML + JS"
        code={`<button class="btn btn-lift" id="mag">Zieh mich</button>
<script>
  const b = document.getElementById('mag');
  b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform =
      \`translate(\${(e.clientX - r.left - r.width/2) * .3}px, \${(e.clientY - r.top - r.height/2) * .3}px)\`;
  });
  b.addEventListener('pointerleave', () => b.style.transform = '');
</script>`}
      />

      <H2 id="neon">9. Neon-Outline</H2>
      <P>Leuchtender Rahmen im Cyberpunk-Look.</P>
      <CodeBlock
        code={`.btn-neon {
  background: transparent;
  color: #d946ef;
  border: 1.5px solid #d946ef;
  text-shadow: 0 0 8px rgba(217, 70, 239, .6);
  box-shadow: 0 0 12px -2px rgba(217, 70, 239, .5), inset 0 0 12px -6px rgba(217, 70, 239, .5);
  transition: box-shadow .25s ease;
}
.btn-neon:hover {
  box-shadow: 0 0 22px 0 rgba(217, 70, 239, .7), inset 0 0 16px -4px rgba(217, 70, 239, .7);
}`}
      />

      <H2 id="ripple">10. Material-Ripple</H2>
      <P>Eine Welle breitet sich vom Klickpunkt aus — reines CSS über den aktiven Zustand.</P>
      <CodeBlock
        code={`.btn-ripple {
  position: relative;
  overflow: hidden;
  background: #7c3aed;
  color: #fff;
}
.btn-ripple::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,.5);
  opacity: 0;
  transform: scale(1);
}
.btn-ripple:active::after {
  animation: ripple .5s ease-out;
}
@keyframes ripple {
  from { opacity: .6; transform: scale(1); }
  to   { opacity: 0;  transform: scale(60); }
}`}
      />

      <H2 id="fazit">Fazit</H2>
      <P>
        Zehn Effekte, null Abhängigkeiten. Achte immer auf zwei Dinge: einen sichtbaren{" "}
        <InlineCode>:focus-visible</InlineCode>-Zustand für die Tastatur und{" "}
        <InlineCode>prefers-reduced-motion</InlineCode> für Animationen. Fertige, geprüfte Varianten
        findest du in der{" "}
        <Link href="/explore?cat=buttons" className="text-accent underline-offset-4 hover:underline">
          Button-Sammlung
        </Link>
        .
      </P>
    </GuideShell>
  );
}
