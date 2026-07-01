import { Copy, ClipboardPaste, Palette, Zap } from "lucide-react";
import type { UIComponent } from "@/lib/types";

const STEPS = [
  { icon: Copy, t: "Code kopieren", d: "Klicke oben auf „Code kopieren“ — HTML und CSS landen in deiner Zwischenablage." },
  { icon: ClipboardPaste, t: "In dein Projekt einfügen", d: "Füge das Markup an der gewünschten Stelle deiner Seite oder Komponente ein." },
  { icon: Palette, t: "CSS übernehmen", d: "Übernimm den <style>-Block bzw. die Klassen in deine Stylesheet-Datei." },
];

/** „Wie nutze ich das?" — schlanke, ehrliche Einbau-Anleitung (kein npm-Zwang). */
export default function InstallGuide({ c }: { c: UIComponent }) {
  const isTailwind = c.framework === "tailwind";
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-fg">Eingebaut in 60 Sekunden</h2>
      </div>
      <p className="mt-1 text-sm text-fg-muted">
        Keine Installation, kein Build-Step — reine Standards, sofort einsatzbereit.
      </p>

      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-sm font-bold text-accent">
                {i + 1}
              </span>
              <s.icon size={16} className="text-fg-muted" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-fg">{s.t}</h3>
            <p className="mt-1 text-sm text-fg-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      {isTailwind && (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-fg-muted">
          <strong className="text-fg">Hinweis:</strong> Diese Komponente nutzt Tailwind-Utility-Klassen.
          Stelle sicher, dass Tailwind in deinem Projekt eingebunden ist — per{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">npx tailwindcss</code> oder{" "}
          CDN <code className="rounded bg-white/10 px-1 py-0.5 text-xs">cdn.tailwindcss.com</code> (nur für Prototypen).
        </p>
      )}
    </section>
  );
}
