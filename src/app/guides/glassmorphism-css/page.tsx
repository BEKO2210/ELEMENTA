import type { Metadata } from "next";
import Link from "next/link";
import { getGuide } from "@/lib/guides";
import { GuideShell, Lead, H2, P, UL, LI, InlineCode, CodeBlock, Callout } from "@/components/guide";

const guide = getGuide("glassmorphism-css")!;

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
        Glassmorphism — der „Milchglas"-Effekt — verleiht Karten und Overlays Tiefe, ohne schwer
        zu wirken. Das Geheimnis ist eine Kombination aus Unschärfe, Transparenz und einem feinen
        Rand. Hier baust du ihn Schritt für Schritt korrekt auf.
      </Lead>

      <H2 id="grundlage">Die drei Zutaten</H2>
      <P>Jedes echte Glassmorphism-Element kombiniert immer diese drei Eigenschaften:</P>
      <UL>
        <LI><InlineCode>backdrop-filter: blur(...)</InlineCode> — verwischt, was hinter dem Element liegt.</LI>
        <LI>Ein <strong>halbtransparenter</strong> Hintergrund, damit der Blur überhaupt sichtbar wird.</LI>
        <LI>Ein <strong>heller, dünner Rand</strong> (1&nbsp;px), der die Glaskante andeutet.</LI>
      </UL>

      <H2 id="basis">Das Basis-Rezept</H2>
      <P>
        Wichtig: Glassmorphism braucht einen <strong>farbigen oder bildhaften Hintergrund</strong>{" "}
        hinter dem Element — auf reinem Schwarz oder Weiß sieht man den Effekt nicht.
      </P>
      <CodeBlock
        code={`.glass {
  /* halbtransparent — nur so wirkt der Blur */
  background: rgba(255, 255, 255, 0.08);
  /* der eigentliche Milchglas-Effekt */
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px); /* Safari */
  /* feine Glaskante + Tiefe */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}`}
      />

      <H2 id="karte">Eine komplette Glass-Karte</H2>
      <P>Einsatzbereites Beispiel — lege es über einen farbigen Verlaufs-Hintergrund:</P>
      <CodeBlock
        label="HTML + CSS"
        code={`<div class="scene">
  <div class="glass-card">
    <h3>Elementa Pro</h3>
    <p>Effektreiche Komponenten — DSGVO-konform, kostenlos.</p>
  </div>
</div>

<style>
.scene {
  display: grid; place-items: center; min-height: 320px; padding: 40px;
  background: linear-gradient(120deg, #8b5cf6, #06b6d4);
}
.glass-card {
  max-width: 300px; padding: 24px; color: #fff;
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 18px;
  box-shadow: 0 16px 50px rgba(0,0,0,.25);
}
</style>`}
      />

      <H2 id="fallback">Fallback für ältere Browser</H2>
      <P>
        <InlineCode>backdrop-filter</InlineCode> wird zwar breit unterstützt, aber sichere dich mit{" "}
        <InlineCode>@supports</InlineCode> ab — sonst wird deine Karte auf Alt-Browsern unlesbar
        transparent:
      </P>
      <CodeBlock
        code={`@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(20, 20, 30, 0.9); } /* deckend statt durchsichtig */
}`}
      />

      <H2 id="kontrast">Kontrast &amp; Barrierefreiheit</H2>
      <Callout>
        Text auf Glas ist die häufigste WCAG-Falle: Über einem hellen Hintergrund kann heller Text
        unter die Mindestkontrast-Grenze (4,5:1) fallen. Prüfe den Kontrast <strong>gegen den
        hellsten Bereich</strong> hinter dem Glas — nicht nur gegen die Glasfarbe.
      </Callout>
      <UL>
        <LI>Text-Overlay-Trick: eine leicht dunklere Ebene unter dem Text erhöht den Kontrast.</LI>
        <LI>Erhöhe im Zweifel die Deckkraft des Hintergrunds (z.&nbsp;B. <InlineCode>rgba(...,0.15)</InlineCode>).</LI>
      </UL>

      <H2 id="performance">Performance-Tipps</H2>
      <UL>
        <LI><InlineCode>backdrop-filter</InlineCode> ist GPU-lastig — nutze es sparsam, nicht auf Dutzenden Elementen gleichzeitig.</LI>
        <LI>Vermeide es auf großen, scrollenden Flächen; das kann auf schwächeren Geräten ruckeln.</LI>
        <LI>Kombiniere es nicht mit vielen gleichzeitigen Animationen desselben Elements.</LI>
      </UL>

      <H2 id="fazit">Fazit</H2>
      <P>
        Transparenz + Blur + Kante = Glas. Achte auf einen farbigen Hintergrund, einen Fallback und
        ausreichenden Kontrast. Fertige Glass-Komponenten findest du in der{" "}
        <Link href="/explore?cat=cards" className="text-accent underline-offset-4 hover:underline">
          Card-Sammlung
        </Link>
        .
      </P>
    </GuideShell>
  );
}
