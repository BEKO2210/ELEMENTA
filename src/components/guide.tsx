import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, CalendarDays, ArrowRight, Lightbulb } from "lucide-react";
import type { GuideMeta } from "@/lib/guides";
import JsonLd from "./JsonLd";
import CopyButton from "./CopyButton";

const BASE = "https://ui.it-handwerk-stuttgart.de";

/* ---------- Seitenrahmen für einen Guide-Artikel ---------- */
export function GuideShell({ guide, children }: { guide: GuideMeta; children: React.ReactNode }) {
  const dateLabel = new Date(guide.date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          datePublished: guide.date,
          dateModified: guide.date,
          inLanguage: "de",
          author: { "@type": "Person", name: "Belkis Aslani", url: `${BASE}/about` },
          publisher: { "@type": "Organization", name: "Elementa", url: BASE },
          mainEntityOfPage: `${BASE}/guides/${guide.slug}`,
          image: `${BASE}${guide.cover}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Elementa", item: BASE },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
            { "@type": "ListItem", position: 3, name: guide.title, item: `${BASE}/guides/${guide.slug}` },
          ],
        }}
      />

      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/" className="hover:text-white">Elementa</Link>
        <ChevronRight size={14} className="text-fg-dim" />
        <Link href="/guides" className="hover:text-white">Guides</Link>
        <ChevronRight size={14} className="text-fg-dim" />
        <span className="text-fg">{guide.category}</span>
      </nav>

      <header className="mt-5">
        <span className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {guide.category}
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{guide.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={15} className="text-fg-dim" /> {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} className="text-fg-dim" /> {guide.readingMinutes} Min. Lesezeit
          </span>
        </div>
      </header>

      <Image
        src={guide.cover}
        alt=""
        width={1600}
        height={900}
        priority
        sizes="(max-width: 768px) 100vw, 768px"
        className="mt-6 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
      />

      <div className="mt-8">{children}</div>

      {/* Abschluss-CTA */}
      <div className="glass mt-12 flex flex-col items-start gap-3 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-fg">Direkt loslegen</p>
          <p className="mt-0.5 text-sm text-fg-muted">Durchstöbere passende Komponenten zum Kopieren.</p>
        </div>
        <Link href="/explore" className="btn-grad inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm">
          Komponenten entdecken <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

/* ---------- Prose-Bausteine (konsistente Artikel-Typografie) ---------- */
export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-lg leading-relaxed text-fg-muted">{children}</p>;
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} className="mt-10 scroll-mt-24 text-2xl font-bold tracking-tight">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-7 text-lg font-semibold">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-relaxed text-fg-muted">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-4 list-disc space-y-2 pl-5 text-fg-muted marker:text-accent">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
  return <ol className="mt-4 list-decimal space-y-2 pl-5 text-fg-muted marker:text-fg-dim">{children}</ol>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-fg">{children}</code>;
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-6 flex gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
      <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <div className="text-sm leading-relaxed text-fg-muted">{children}</div>
    </aside>
  );
}

export function CodeBlock({ code, label = "CSS" }: { code: string; label?: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="max-h-[460px] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
