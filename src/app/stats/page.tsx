import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Eye, CalendarDays, Globe, ShieldCheck } from "lucide-react";
import { fetchStats, type StatsSummary } from "@/lib/analytics-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistiken — offene Zahlen",
  description:
    "Transparente Besucherzahlen von Elementa: täglich aggregiert, ohne IPs, ohne Dritt-Anbieter — DSGVO-konform in der EU gemessen.",
  alternates: { canonical: "/stats" },
};

function fmtDay(day: string): string {
  return `${day.slice(8, 10)}.${day.slice(5, 7)}.`;
}

/* ---------- 30-Tage-Balkenchart (Inline-SVG, eine Serie → keine Legende) ---------- */
function DailyChart({ days }: { days: StatsSummary["days"] }) {
  const W = 900;
  const H = 240;
  const PAD = { top: 16, right: 8, bottom: 26, left: 40 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...days.map((d) => d.count));
  // „schöne" Obergrenze für Grid/Achse
  const step = Math.max(1, Math.pow(10, Math.floor(Math.log10(max))));
  const top = Math.ceil(max / step) * step;

  const bw = iw / days.length;
  const barW = Math.max(4, bw - 2); // 2px Lücke zwischen Balken

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Balkendiagramm: Seitenaufrufe der letzten 30 Tage, Maximum ${max} an einem Tag`}
      className="w-full"
    >
      {/* dezentes Grid (¼-Schritte) */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + ih - ih * f}
            y2={PAD.top + ih - ih * f}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 8}
            y={PAD.top + ih - ih * f + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--fg-dim)"
          >
            {Math.round(top * f)}
          </text>
        </g>
      ))}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={PAD.top + ih}
        y2={PAD.top + ih}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />

      {days.map((d, i) => {
        const h = Math.round((d.count / top) * ih);
        const x = PAD.left + i * bw + (bw - barW) / 2;
        const y = PAD.top + ih - h;
        return (
          <g key={d.day} className="group/bar">
            {/* großzügige Hover-Fläche (breiter als der Balken) */}
            <rect x={PAD.left + i * bw} y={PAD.top} width={bw} height={ih} fill="transparent">
              <title>{`${fmtDay(d.day)} — ${d.count} Aufrufe`}</title>
            </rect>
            {d.count > 0 && (
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 3)}
                rx="4"
                fill="#8b5cf6"
                className="pointer-events-none transition-opacity group-hover/bar:opacity-100"
                opacity="0.85"
              />
            )}
            {/* sparsame X-Labels: jeder 7. Tag */}
            {i % 7 === 0 && (
              <text
                x={PAD.left + i * bw + bw / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="11"
                fill="var(--fg-dim)"
              >
                {fmtDay(d.day)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- horizontale Top-Listen (Magnitude → eine Farbe) ---------- */
function TopList({
  items,
  linkify,
}: {
  items: { label: string; count: number }[];
  linkify?: boolean;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ol className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            {linkify ? (
              <Link
                href={it.label}
                className="truncate font-mono text-[13px] text-fg-muted transition hover:text-white"
              >
                {it.label}
              </Link>
            ) : (
              <span className="truncate font-mono text-[13px] text-fg-muted">{it.label}</span>
            )}
            <span className="shrink-0 tabular-nums text-fg">{it.count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="glass flex flex-col items-center gap-1.5 rounded-2xl px-4 py-7 text-center">
      <Icon size={18} className="text-accent" aria-hidden="true" />
      <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-fg">
        {value.toLocaleString("de-DE")}
      </p>
      <p className="text-xs tracking-wide text-fg-muted">{label}</p>
    </div>
  );
}

export default async function StatsPage() {
  const stats = await fetchStats();

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Transparenz</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Offene Statistiken</h1>
        <p className="mt-3 text-lg text-fg-muted">
          Wir zeigen unsere Zahlen öffentlich — so wie wir sie messen: täglich aggregiert,
          ohne IP-Adressen, ohne Dritt-Anbieter, in der EU.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
          <ShieldCheck size={13} aria-hidden="true" />
          Gezählt werden nur Besuche mit Statistik-Einwilligung — die echten Zahlen liegen höher.
        </p>
      </header>

      {!stats ? (
        <p className="mt-12 text-fg-muted">Statistiken sind derzeit nicht verfügbar.</p>
      ) : (
        <>
          {/* Kennzahlen */}
          <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Tile icon={Eye} label="Aufrufe heute" value={stats.today} />
            <Tile icon={CalendarDays} label="Letzte 7 Tage" value={stats.last7} />
            <Tile icon={BarChart3} label="Letzte 30 Tage" value={stats.last30} />
          </dl>

          {/* Verlauf */}
          <section className="glass mt-6 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-fg">Seitenaufrufe · letzte 30 Tage</h2>
            <div className="mt-4">
              {stats.last30 === 0 ? (
                <p className="py-14 text-center text-sm text-fg-muted">
                  Noch keine Daten — die Messung hat gerade erst begonnen.
                </p>
              ) : (
                <DailyChart days={stats.days} />
              )}
            </div>
            {/* Tabellen-Alternative (Screenreader / Datenblick) */}
            {stats.last30 > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-fg-dim transition hover:text-fg-muted">
                  Als Tabelle anzeigen
                </summary>
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-fg-muted">
                      <th scope="col" className="py-1.5 font-medium">Tag</th>
                      <th scope="col" className="py-1.5 text-right font-medium">Aufrufe</th>
                    </tr>
                  </thead>
                  <tbody className="text-fg-muted">
                    {stats.days.filter((d) => d.count > 0).map((d) => (
                      <tr key={d.day} className="border-b border-white/5 last:border-0">
                        <td className="py-1">{fmtDay(d.day)}</td>
                        <td className="py-1 text-right tabular-nums text-fg">{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </section>

          {/* Top-Listen */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <BarChart3 size={15} className="text-accent" aria-hidden="true" /> Meistbesuchte Seiten
              </h2>
              <div className="mt-4">
                {stats.topPaths.length === 0 ? (
                  <p className="text-sm text-fg-muted">Noch keine Daten.</p>
                ) : (
                  <TopList
                    linkify
                    items={stats.topPaths.map((p) => ({ label: p.path, count: p.count }))}
                  />
                )}
              </div>
            </section>
            <section className="glass rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Globe size={15} className="text-accent" aria-hidden="true" /> Referrer
              </h2>
              <div className="mt-4">
                {stats.topRefs.length === 0 ? (
                  <p className="text-sm text-fg-muted">
                    Noch keine externen Verweise erfasst.
                  </p>
                ) : (
                  <TopList
                    items={stats.topRefs.map((r) => ({ label: r.host, count: r.count }))}
                  />
                )}
              </div>
            </section>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-fg-dim">
            Methodik: Ein First-Party-Beacon zählt Seitenaufrufe erst nach deiner Einwilligung
            (Cookie-Banner). Gespeichert werden ausschließlich Tages-Summen pro Pfad und
            Referrer-Hostname — keine IP-Adressen, keine Geräte-Fingerprints, keine Profile.
            Details in der <Link href="/datenschutz" className="underline hover:text-fg-muted">Datenschutzerklärung</Link>.
          </p>
        </>
      )}
    </div>
  );
}
