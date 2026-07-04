import Link from "next/link";
import { PenTool, ListChecks, ShieldCheck, LogIn } from "lucide-react";

const STEPS = [
  { icon: PenTool, t: "Komponente erstellen", d: "Baue deine UI in HTML/CSS (optional JS)." },
  { icon: ListChecks, t: "Details eingeben", d: "Name, Kategorie, Framework, Beschreibung und Tags." },
  { icon: ShieldCheck, t: "Wir prüfen & veröffentlichen", d: "Nach kurzem Qualitäts-Check geht deine Komponente live." },
];

/**
 * Vorschau des Upload-Prozesses für nicht angemeldete Besucher — zeigt den Ablauf
 * und ein read-only Beispiel-Formular, damit klar ist, was einen erwartet.
 */
export default function UploadPreview() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Teile deine Komponenten mit der Community</h1>
      <p className="mt-3 max-w-xl text-fg-muted">
        Jede Komponente, die du hochlädst, wird von anderen Entwicklern entdeckt und genutzt.
        So läuft der Upload ab:
      </p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg btn-grad text-sm font-bold">{i + 1}</span>
              <s.icon size={16} className="text-accent" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-fg">{s.t}</h2>
            <p className="mt-1 text-sm text-fg-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      {/* Read-only Beispiel-Formular */}
      <div className="mt-10">
        <p className="mb-3 text-sm font-medium text-fg-muted">Beispiel-Upload (Vorschau)</p>
        <fieldset
          disabled
          aria-label="Beispiel-Formular (nur Vorschau)"
          className="glass space-y-4 rounded-2xl p-6 opacity-70"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name" value="Aurora Button" />
            <Field label="Kategorie" value="Buttons" />
            <Field label="Framework" value="HTML/CSS" />
          </div>
          <Field label="Beschreibung" value="Button mit animierter Verlaufs-Aura — nur CSS, keine Abhängigkeiten." />
          <div>
            <span className="mb-1.5 block text-xs text-fg-muted">HTML</span>
            <div className="rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 font-mono text-[13px] text-fg-dim">
              &lt;button class=&quot;aurora&quot;&gt;Jetzt starten&lt;/button&gt;
            </div>
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/login" className="btn-grad inline-flex items-center gap-2 rounded-xl px-6 py-3">
          <LogIn size={18} /> Anmelden / Registrieren
        </Link>
        <Link href="/docs/contribute" className="text-sm text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent">
          Contributor-Guidelines ansehen
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-fg-muted">{label}</span>
      <input
        readOnly
        value={value}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-fg-muted"
      />
    </label>
  );
}
