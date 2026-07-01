import type { Metadata } from "next";
import Link from "next/link";
import { getGuide } from "@/lib/guides";
import { GuideShell, Lead, H2, P, UL, OL, LI, InlineCode, CodeBlock, Callout } from "@/components/guide";

const guide = getGuide("barrierefreie-toggles-wcag")!;

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
        Ein Toggle sieht simpel aus — ist aber eine der am häufigsten falsch gebauten Komponenten.
        Ein hübscher Switch, den man nicht mit der Tastatur bedienen kann, ist für viele Menschen
        schlicht kaputt. So machst du es nach WCAG 2.2 richtig.
      </Lead>

      <H2 id="basis">Baue auf nativem HTML auf</H2>
      <P>
        Der wichtigste Grundsatz: Nutze ein echtes{" "}
        <InlineCode>&lt;input type=&quot;checkbox&quot;&gt;</InlineCode> oder einen{" "}
        <InlineCode>&lt;button&gt;</InlineCode>. Ein <InlineCode>&lt;div&gt;</InlineCode> mit
        Klick-Handler bekommst du niemals vollständig barrierefrei. Native Elemente bringen Fokus,
        Tastaturbedienung und den Zustand für assistive Technologie kostenlos mit.
      </P>

      <H2 id="checkliste">Die WCAG-2.2-Checkliste</H2>
      <OL>
        <LI><strong>Beschriftung</strong>: Jeder Toggle hat ein verknüpftes <InlineCode>&lt;label&gt;</InlineCode> (2.5.3, 4.1.2).</LI>
        <LI><strong>Tastatur</strong>: mit <InlineCode>Tab</InlineCode> erreichbar, mit <InlineCode>Leertaste</InlineCode> umschaltbar (2.1.1).</LI>
        <LI><strong>Sichtbarer Fokus</strong>: ein deutlicher <InlineCode>:focus-visible</InlineCode>-Ring (2.4.7, 2.4.11 in WCAG&nbsp;2.2).</LI>
        <LI><strong>Zustand erkennbar</strong>: nicht nur über Farbe — Position/Form ändern sich (1.4.1).</LI>
        <LI><strong>Zielgröße</strong>: mindestens 24×24&nbsp;px, besser 44×44&nbsp;px (2.5.8, neu in WCAG&nbsp;2.2).</LI>
        <LI><strong>Bewegung</strong>: Übergänge respektieren <InlineCode>prefers-reduced-motion</InlineCode> (2.3.3).</LI>
      </OL>

      <H2 id="beispiel">Ein vollständig barrierefreier Toggle</H2>
      <P>
        Diese Variante nutzt eine echte Checkbox, verbirgt sie visuell (aber nicht für Screenreader)
        und stylt den sichtbaren Switch über das Geschwister-Element:
      </P>
      <CodeBlock
        label="HTML + CSS"
        code={`<label class="switch">
  <input type="checkbox" checked>
  <span class="track" aria-hidden="true"></span>
  <span class="switch-label">Benachrichtigungen</span>
</label>

<style>
.switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }

/* Checkbox visuell verstecken, aber bedienbar & für SR sichtbar lassen */
.switch input {
  position: absolute; opacity: 0; width: 0; height: 0;
}

.track {
  width: 46px; height: 26px; border-radius: 99px;
  background: #3a3a4a; position: relative;
  transition: background .25s ease;
}
.track::after {
  content: ""; position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; transition: transform .25s ease;
}

/* Zustand: an */
.switch input:checked + .track { background: #8b5cf6; }
.switch input:checked + .track::after { transform: translateX(20px); }

/* Sichtbarer Fokus für Tastatur */
.switch input:focus-visible + .track {
  outline: 2px solid #8b5cf6; outline-offset: 2px;
}

/* Bewegung reduzieren */
@media (prefers-reduced-motion: reduce) {
  .track, .track::after { transition: none; }
}
</style>`}
      />

      <Callout>
        Weil hier eine echte <InlineCode>&lt;input type=&quot;checkbox&quot;&gt;</InlineCode> im{" "}
        <InlineCode>&lt;label&gt;</InlineCode> steckt, funktioniert alles automatisch: Klick aufs
        Label schaltet um, die Leertaste toggelt, und Screenreader sagen „Kontrollkästchen,
        aktiviert/deaktiviert" an. Kein <InlineCode>aria-checked</InlineCode> nötig.
      </Callout>

      <H2 id="button-variante">Alternative: role=&quot;switch&quot;</H2>
      <P>
        Wenn du statt einer Checkbox einen <InlineCode>&lt;button&gt;</InlineCode> nutzt, musst du
        den Zustand selbst über <InlineCode>aria-checked</InlineCode> und{" "}
        <InlineCode>role=&quot;switch&quot;</InlineCode> abbilden — und das Umschalten per JavaScript
        übernehmen:
      </P>
      <CodeBlock
        label="HTML"
        code={`<button type="button" role="switch" aria-checked="true" class="switch-btn">
  <span class="visually-hidden">Dunkelmodus</span>
</button>`}
      />

      <H2 id="fehler">Häufige Fehler</H2>
      <UL>
        <LI>Zustand nur über Farbe (rot/grün) signalisieren — für Farbfehlsichtige nicht erkennbar.</LI>
        <LI>Fokus-Ring per <InlineCode>outline: none</InlineCode> entfernen, ohne Ersatz.</LI>
        <LI>Zu kleine Klickfläche (unter 24&nbsp;px) — verstößt gegen WCAG&nbsp;2.2 (2.5.8).</LI>
        <LI>Kein Label — der Screenreader liest nur „Kontrollkästchen" ohne Bedeutung vor.</LI>
      </UL>

      <H2 id="fazit">Fazit</H2>
      <P>
        Barrierefreiheit beim Toggle ist kein Extra, sondern das Fundament. Baue auf nativem HTML,
        halte die Checkliste ein — dann funktioniert dein Switch für alle. Geprüfte Beispiele
        findest du in der{" "}
        <Link href="/explore?cat=toggles" className="text-accent underline-offset-4 hover:underline">
          Toggle-Sammlung
        </Link>
        .
      </P>
    </GuideShell>
  );
}
