import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ScanSearch, Contrast, MousePointerClick, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Community-Richtlinien & Qualitäts-Review",
  description:
    "Unsere Regeln für ein respektvolles Miteinander und der Qualitäts-Review, den jede Komponente vor der Veröffentlichung durchläuft.",
  alternates: { canonical: "/docs/guidelines" },
};

const RULES = [
  "Respektvoller Umgang miteinander",
  "Nur eigene Inhalte hochladen",
  "Keine Malware oder schädlichen Skripte",
  "Lizenzangaben beachten",
  "Konstruktives Feedback geben",
];

const REVIEW = [
  { icon: ScanSearch, t: "Code-Validierung", d: "Automatische Prüfung von HTML/CSS auf valides Markup." },
  { icon: Contrast, t: "WCAG 2.2 Kontrast", d: "Kontraste und Fokus-Zustände werden gegen den AA-Standard geprüft." },
  { icon: MousePointerClick, t: "Funktionalität", d: "Manuelle Sichtprüfung, dass die Komponente wie beschrieben funktioniert." },
  { icon: Globe, t: "Browser-Kompatibilität", d: "Check gegen aktuelle Chromium-, Firefox- und WebKit-Engines." },
];

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Community-Richtlinien</h1>
      <p className="mt-3 text-fg-muted">
        Elementa lebt von Vertrauen und Qualität. Damit die Bibliothek für alle nützlich
        bleibt, gelten ein paar einfache Regeln.
      </p>

      <ul className="mt-8 space-y-2">
        {RULES.map((r) => (
          <li key={r} className="flex items-center gap-2 text-fg-muted">
            <ShieldCheck size={16} className="shrink-0 text-emerald-400" aria-hidden="true" />
            {r}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-fg-dim">
        Bei Verstößen behalten wir uns vor, Inhalte zu entfernen.
      </p>

      <h2 className="mt-12 text-lg font-semibold text-fg">Unser Qualitäts-Review</h2>
      <p className="mt-2 text-fg-muted">
        Jede eingereichte Komponente durchläuft vor der Veröffentlichung diese Schritte
        (Dauer i. d. R. 24–48 Stunden):
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {REVIEW.map((r) => (
          <div key={r.t} className="glass rounded-2xl p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-accent">
              <r.icon size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-semibold text-fg">{r.t}</h3>
            <p className="mt-1 text-sm text-fg-muted">{r.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-fg-muted">
        Bereit?{" "}
        <Link href="/docs/contribute" className="text-accent underline-offset-4 hover:underline">
          Zu den Contributor-Guidelines
        </Link>
      </p>
    </div>
  );
}
