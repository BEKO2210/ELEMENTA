import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, ShieldCheck, Euro, Sparkles, ArrowRight, Mail } from "lucide-react";
import { GithubIcon } from "@/components/BrandIcons";
import JsonLd from "@/components/JsonLd";

const BASE = "https://ui.it-handwerk-stuttgart.de";

export const metadata: Metadata = {
  title: "Über Elementa",
  description:
    "Warum Elementa entstanden ist: die offene, framework-übergreifende und DSGVO-konforme UI-Komponenten-Bibliothek — gebaut von Belkis Aslani, für Entwickler.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über Elementa · Der offene Baukasten für UI-Komponenten",
    description:
      "Die Geschichte, Mission und Werte hinter Elementa — framework-übergreifend, barrierefrei, EU-gehostet.",
    type: "website",
    url: "/about",
    images: [{ url: "/brand/og-default.png", width: 1376, height: 768 }],
  },
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Qualität vor Quantität",
    text: "Lieber kuratierte, geprüfte Komponenten als tausende in schwankender Qualität. Jede geht durch einen Review.",
  },
  {
    icon: Boxes,
    title: "Framework-übergreifend",
    text: "Nicht React-only. HTML/CSS, Tailwind, React, Vue oder Svelte — eine Bibliothek für jeden Stack.",
  },
  {
    icon: ShieldCheck,
    title: "Barrierefreiheit & EU-Datenschutz",
    text: "WCAG-geprüfte Komponenten, in der EU gehostet, DSGVO-konform. Vertrauen, dem auch Behörden folgen können.",
  },
  {
    icon: Euro,
    title: "Immer kostenlos",
    text: "MIT-lizenziert, keine Paywall, keine Dark Patterns. Frei für private und kommerzielle Projekte.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Über Elementa",
          url: `${BASE}/about`,
          mainEntity: {
            "@type": "Organization",
            name: "Elementa",
            url: BASE,
            description:
              "Offene, framework-übergreifende und DSGVO-konforme UI-Komponenten-Bibliothek.",
            founder: { "@type": "Person", name: "Belkis Aslani" },
            sameAs: ["https://github.com/BEKO2210/ELEMENTA"],
          },
        }}
      />

      <header>
        <h1 className="text-4xl font-bold tracking-tight">Über Elementa</h1>
        <p className="mt-4 text-lg text-fg-muted">
          Elementa ist der offene Baukasten für effektreiche UI-Komponenten — framework-übergreifend,
          barrierefrei geprüft und DSGVO-konform in der EU gehostet.
        </p>
      </header>

      <section className="mt-12 space-y-4 leading-relaxed text-fg-muted">
        <h2 className="text-2xl font-bold text-fg">Warum es Elementa gibt</h2>
        <p>
          Wer schöne UI-Effekte braucht, landet schnell bei einem Kompromiss: entweder eine
          React-only-Bibliothek, ein aufgeblähtes <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-sm text-fg">node_modules</code>{" "}
          von hunderten Megabyte, oder verstreute Code-Schnipsel ohne Qualitätsanspruch. Und fast
          immer ohne klare Antwort auf die Frage, wo eigentlich die Daten liegen.
        </p>
        <p>
          Elementa dreht das um: Jede Komponente ist <strong>zum Kopieren</strong> gedacht — kein
          npm-Install, kein Build-Step. Du siehst sie live, testest jeden Hover-Zustand und fügst
          reines HTML/CSS in dein Projekt ein. Framework-übergreifend, weil dein Stack dir gehört,
          nicht der Bibliothek.
        </p>
        <p>
          Und weil das Projekt aus Deutschland kommt, ist Datenschutz kein nachträglicher Gedanke:
          Alles läuft auf einem Server in der EU, ohne Tracking durch Dritte.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-fg">Wofür wir stehen</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="glass rounded-2xl p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-accent">
                <v.icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg">{v.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-fg">Wer dahinter steht</h2>
        <div className="glass mt-6 flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl btn-grad text-2xl font-bold">
            B
          </span>
          <div>
            <p className="text-lg font-semibold text-fg">Belkis Aslani</p>
            <p className="mt-1 text-sm text-fg-muted">
              Gründer &amp; Entwickler von Elementa. Baut Elementa als offenes Projekt, um
              Entwicklern im deutschsprachigen Raum eine kuratierte, faire Alternative zu bieten.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a
                href="https://github.com/BEKO2210/ELEMENTA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-fg-muted transition hover:text-white"
              >
                <GithubIcon size={15} /> GitHub
              </a>
              <a
                href="mailto:belkis.aslani@gmail.com"
                className="inline-flex items-center gap-1.5 text-fg-muted transition hover:text-white"
              >
                <Mail size={15} /> Kontakt
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="glass mt-12 flex flex-col items-start gap-3 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-fg">Werde Teil der Community</p>
          <p className="mt-0.5 text-sm text-fg-muted">Teile deine besten Komponenten — sichtbar für tausende Entwickler.</p>
        </div>
        <Link href="/submit" className="btn-grad inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm">
          Jetzt beitragen <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
