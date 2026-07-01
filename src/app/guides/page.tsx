import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";
import { GUIDES } from "@/lib/guides";
import JsonLd from "@/components/JsonLd";

const BASE = "https://ui.it-handwerk-stuttgart.de";

export const metadata: Metadata = {
  title: "Guides — UI-Tutorials & CSS-Tricks",
  description:
    "Praktische Anleitungen rund um UI-Komponenten: CSS-Effekte, Glassmorphism, Barrierefreiheit und mehr — verständlich erklärt, mit kopierbarem Code.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Guides — UI-Tutorials & CSS-Tricks · Elementa",
    description:
      "Praktische Anleitungen rund um UI-Komponenten: CSS-Effekte, Glassmorphism, Barrierefreiheit und mehr.",
    type: "website",
    url: "/guides",
    images: [{ url: "/brand/og-default.png", width: 1376, height: 768 }],
  },
};

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Elementa Guides",
          url: `${BASE}/guides`,
          description: "Praktische UI- und CSS-Anleitungen von Elementa.",
        }}
      />
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Guides</h1>
        <p className="mt-3 text-lg text-fg-muted">
          Praktische Anleitungen rund um moderne UI-Komponenten — verständlich erklärt und mit
          Code, den du direkt kopieren kannst.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="card group relative flex flex-col overflow-hidden"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/5">
              <Image
                src={g.cover}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="card-preview object-cover"
              />
              <span className="absolute left-3 top-3 inline-flex rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {g.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-fg transition group-hover:text-white">
                  {g.title}
                </h2>
                <ArrowUpRight size={18} className="mt-1 shrink-0 text-fg-dim transition group-hover:text-white" />
              </div>
              <p className="mt-2 flex-1 text-sm text-fg-muted">{g.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-fg-muted">
                <Clock size={13} className="text-fg-dim" /> {g.readingMinutes} Min. Lesezeit
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
