import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contributor-Guidelines",
  description:
    "So trägst du eine Komponente zu Elementa bei — Anforderungen, Review-Prozess und Qualitätskriterien.",
  alternates: { canonical: "/docs/contribute" },
};

const STEPS = [
  { n: 1, t: "Registrieren", d: "Erstelle ein kostenloses Konto — in unter einer Minute." },
  { n: 2, t: "Komponente erstellen", d: "Baue deine UI in HTML/CSS (optional JS). Framework-übergreifend willkommen." },
  { n: 3, t: "Hochladen", d: "Name, Kategorie, Framework, Beschreibung und Tags angeben — mit Live-Vorschau." },
  { n: 4, t: "Review", d: "Wir prüfen auf valides Markup, Barrierefreiheit und Funktionalität." },
  { n: 5, t: "Live", d: "Nach Freigabe ist deine Komponente öffentlich sichtbar und nutzbar." },
];

const REQS = [
  "Valides HTML5 und CSS3",
  "Keine externen Abhängigkeiten (oder explizit deklariert)",
  "Mindestens 50 Zeichen aussagekräftige Beschreibung",
  "Passende Tags und korrekte Kategorie",
  "Respektiert prefers-reduced-motion",
  "Kein schädlicher Code, keine Tracker",
];

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Contributor-Guidelines</h1>
      <p className="mt-3 text-fg-muted">
        Jede Komponente, die du teilst, hilft anderen Entwicklern, schneller schöne
        Interfaces zu bauen. So funktioniert&apos;s:
      </p>

      <ol className="mt-8 space-y-3">
        {STEPS.map((s) => (
          <li key={s.n} className="glass flex gap-4 rounded-2xl p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full btn-grad text-sm font-bold">
              {s.n}
            </span>
            <div>
              <h2 className="font-semibold text-fg">{s.t}</h2>
              <p className="mt-0.5 text-sm text-fg-muted">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-lg font-semibold text-fg">Anforderungen</h2>
      <ul className="mt-4 space-y-2">
        {REQS.map((r) => (
          <li key={r} className="flex items-center gap-2 text-fg-muted">
            <Check size={16} className="shrink-0 text-emerald-400" aria-hidden="true" />
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link href="/submit" className="btn-grad inline-flex items-center gap-2 rounded-xl px-5 py-3">
          Jetzt beitragen <ArrowRight size={18} />
        </Link>
        <Link href="/docs/guidelines" className="text-sm text-accent underline decoration-white/30 underline-offset-4 transition hover:decoration-accent">
          Community-Richtlinien lesen
        </Link>
      </div>
    </div>
  );
}
