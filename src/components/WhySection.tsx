import { Boxes, PackageX, Feather, ShieldCheck, Check, X, Minus } from "lucide-react";
import type { SiteStats } from "@/lib/data";
import { Reveal, Stagger, StaggerItem } from "./Motion";
import CountUp from "./CountUp";

/** Datengetriebene „Warum Elementa"-Sektion — konkrete Zahlen statt Behauptungen. */
export default function WhySection({ stats }: { stats: SiteStats }) {
  const cards = [
    {
      icon: Boxes,
      value: <CountUp value={stats.components} suffix="+" />,
      title: "Komponenten",
      text: "React, Vue, Svelte, Tailwind oder pures HTML/CSS. Eine Bibliothek für deinen Stack.",
    },
    {
      icon: PackageX,
      value: "0",
      title: "Dependencies",
      text: "Kopieren und einfügen. Kein npm install, kein Build-Step, kein Ballast.",
    },
    {
      icon: Feather,
      value: <><CountUp value={stats.avgKb} decimals={1} /> KB</>,
      title: "Ø Größe",
      text: "Nur das, was du brauchst — schlanke Komponenten ohne große Bundles.",
    },
    {
      icon: ShieldCheck,
      value: "WCAG 2.2",
      title: "Geprüft",
      text: "Geprüfte Kontraste, Fokus-Zustände und prefers-reduced-motion Unterstützung.",
    },
  ];

  return (
    <section id="warum" className="mx-auto max-w-6xl px-5 pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold">Warum Entwickler Elementa wählen</h2>
        <p className="mt-3 text-fg-muted">
          Kein Marketing-Versprechen, sondern nachprüfbare Fakten aus der Bibliothek.
        </p>
      </div>

      <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StaggerItem key={c.title} className="glass rounded-2xl p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-accent">
              <c.icon size={20} aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-bold text-fg">{c.value}</p>
            <h3 className="mt-1 text-sm font-semibold text-fg">{c.title}</h3>
            <p className="mt-2 text-sm text-fg-muted">{c.text}</p>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Vergleichstabelle — subtil, nicht aggressiv */}
      <Reveal className="mt-10">
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Vergleich von Elementa mit anderen Anbietern</caption>
            <thead>
              <tr className="border-b border-white/10 text-left text-fg-muted">
                <th scope="col" className="px-5 py-3 font-medium">Feature</th>
                <th scope="col" className="px-5 py-3 font-medium text-accent">Elementa</th>
                <th scope="col" className="px-5 py-3 font-medium">shadcn/ui</th>
                <th scope="col" className="px-5 py-3 font-medium">CodePen</th>
              </tr>
            </thead>
            <tbody className="text-fg-muted">
              {[
                { f: "Kostenlos", e: "yes", s: "yes", c: "yes" },
                { f: "Frameworks", e: "Alle", s: "React", c: "Alle" },
                { f: "Live-Vorschau", e: "yes", s: "no", c: "yes" },
                { f: "DSGVO / EU-Hosting", e: "yes", s: "unknown", c: "no" },
                { f: "WCAG-geprüft", e: "yes", s: "no", c: "no" },
              ].map((row) => (
                <tr key={row.f} className="border-b border-white/5 last:border-0">
                  <th scope="row" className="px-5 py-3 text-left font-normal text-fg">{row.f}</th>
                  <Cell v={row.e} highlight />
                  <Cell v={row.s} />
                  <Cell v={row.c} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-fg-dim">
          Angaben nach bestem Wissen (Stand 2026); Anbieter entwickeln sich weiter.
        </p>
      </Reveal>
    </section>
  );
}

function Cell({ v, highlight }: { v: string; highlight?: boolean }) {
  const cls = highlight ? "px-5 py-3 bg-accent/[0.06]" : "px-5 py-3";
  if (v === "yes") return <td className={cls}><Check size={16} className="text-emerald-400" aria-label="Ja" /></td>;
  if (v === "no") return <td className={cls}><X size={16} className="text-red-400/80" aria-label="Nein" /></td>;
  if (v === "unknown") return <td className={cls}><Minus size={16} className="text-fg-dim" aria-label="Unklar" /></td>;
  return <td className={cls}>{v}</td>;
}
