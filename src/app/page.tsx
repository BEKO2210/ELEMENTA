import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MousePointerClick, Copy, Rocket, CircleCheck, ShieldCheck, Zap, Scale } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import { fetchComponents, attachLikeCounts, computeStats } from "@/lib/data";
import type { Category } from "@/lib/types";
import ComponentCard from "@/components/ComponentCard";
import HeroSearch from "@/components/HeroSearch";
import HeroShowcase, { type ShowcaseItem } from "@/components/HeroShowcase";
import HeroVideo from "@/components/HeroVideo";
import TechMarquee from "@/components/TechMarquee";
import TrustBar from "@/components/TrustBar";
import WhySection from "@/components/WhySection";
import CommunityCTA from "@/components/CommunityCTA";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import JsonLd from "@/components/JsonLd";

const BASE = "https://ui.it-handwerk-stuttgart.de";
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Elementa",
  url: BASE,
  description:
    "Der offene Baukasten für UI-Komponenten — framework-übergreifend, barrierefrei, DSGVO-konform in der EU gehostet.",
  inLanguage: "de",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE}/explore?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const APP_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Elementa",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "Framework-übergreifende UI-Komponenten zum Kopieren — kostenlos, barrierefrei, DSGVO-konform.",
  url: BASE,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://opensource.org/licenses/MIT",
};

const TRUST_BADGES = [
  { icon: CircleCheck, label: "In der EU gehostet" },
  { icon: ShieldCheck, label: "DSGVO-konform" },
  { icon: Zap, label: "0 Dependencies" },
  { icon: Scale, label: "MIT-Lizenz" },
];

const STEPS = [
  { icon: MousePointerClick, title: "Entdecken", text: "Durchsuche Kategorien oder such gezielt nach Effekten — mit echter Live-Vorschau." },
  { icon: Copy, title: "Kopieren", text: "Ein Klick kopiert HTML/CSS in die Zwischenablage. Kein npm, kein Build-Step." },
  { icon: Rocket, title: "Einbauen", text: "Einfügen, fertig. In deinem Framework, in unter 60 Sekunden." },
];

// Immer frisch rendern, damit neu hochgeladene Komponenten sofort auftauchen.
export const dynamic = "force-dynamic";

/** Erste Komponente einer Kategorie (bevorzugt viele Likes) für den Hero-Showcase. */
function pickForShowcase(
  all: Awaited<ReturnType<typeof attachLikeCounts>>,
  category: Category,
  label: string,
): ShowcaseItem | null {
  const c = all.filter((x) => x.category === category).sort((a, b) => b.likes - a.likes)[0];
  if (!c) return null;
  return { label, slug: c.slug, title: c.title, framework: c.framework, html: c.html, css: c.css, js: c.js };
}

export default async function Home() {
  const all = await attachLikeCounts(await fetchComponents());
  const featured = [...all].sort((a, b) => b.likes - a.likes).slice(0, 6);
  const stats = computeStats(all);

  const showcase = [
    pickForShowcase(all, "buttons", "Button"),
    pickForShowcase(all, "cards", "Card"),
    pickForShowcase(all, "loaders", "Loader"),
  ].filter(Boolean) as ShowcaseItem[];

  const catCounts = new Map<string, number>();
  for (const c of all) catCounts.set(c.category, (catCounts.get(c.category) ?? 0) + 1);

  const searchItems = all.map((c) => ({ title: c.title, slug: c.slug, category: c.category }));
  const recent = [...all]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 3)
    .map((c) => ({ title: c.title, slug: c.slug, category: c.category }));

  return (
    <>
      <JsonLd data={SITE_JSONLD} />
      <JsonLd data={APP_JSONLD} />
      {/* ---------- Hero (Split) ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Statisches Bild als Basis/Poster (und Fallback bei reduced-motion). */}
          <Image
            src="/brand/hero-aurora.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-90"
          />
          {/* Animiertes, textfreies Hintergrundvideo (nahtloser Loop; reduced-motion-safe). */}
          <HeroVideo />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/10 via-bg/40 to-bg" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-20 lg:grid-cols-2 lg:gap-8 lg:pt-24">
          {/* Links: Text + Suche */}
          <div className="text-center lg:text-left">
            <p className="eyebrow rise justify-center lg:justify-start">
              Open-Source UI-Bibliothek · Made in EU
            </p>

            <h1 className="mt-4 text-balance text-[2.75rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              <span className="line-reveal"><span>Baue bessere</span></span>
              <span className="line-reveal"><span style={{ animationDelay: "120ms" }}>Interfaces.</span></span>
              <span className="line-reveal">
                <span className="gradient-text shimmer" style={{ animationDelay: "240ms" }}>
                  Kopiere weniger.
                </span>
              </span>
            </h1>

            <p
              className="rise mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-fg-muted lg:mx-0"
              style={{ animationDelay: "90ms" }}
            >
              {stats.components}+ geprüfte UI-Komponenten — live editierbar, framework-übergreifend,
              MIT-lizenziert. Kein npm. Kein Build-Step. Einfach kopieren und einfügen.
            </p>

            <ul
              className="rise mt-5 flex flex-wrap justify-center gap-2 text-xs text-fg-muted lg:justify-start"
              style={{ animationDelay: "150ms" }}
            >
              {TRUST_BADGES.map((b) => (
                <li key={b.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <b.icon size={13} className="text-accent" aria-hidden="true" />
                  {b.label}
                </li>
              ))}
            </ul>

            <div className="rise" style={{ animationDelay: "230ms" }}>
              <div className="lg:[&>div]:mx-0">
                <HeroSearch items={searchItems} recent={recent} />
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/explore" className="btn-grad inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm">
                  Komponenten entdecken <ArrowRight size={16} />
                </Link>
                <Link
                  href="#so"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-fg-muted transition hover:border-white/20 hover:text-white"
                >
                  So funktioniert&apos;s
                </Link>
              </div>
            </div>
          </div>

          {/* Rechts: Live-Showcase */}
          {showcase.length > 0 && (
            <div className="rise" style={{ animationDelay: "300ms" }}>
              <HeroShowcase items={showcase} />
            </div>
          )}
        </div>
      </section>

      {/* ---------- Tech-Marquee ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-2">
        <TechMarquee />
      </section>

      {/* ---------- Trust Bar ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-8">
        <Reveal>
          <TrustBar stats={stats} />
        </Reveal>
      </section>

      {/* ---------- Categories (mit Anzahl) ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-14">
        <Reveal>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/explore?cat=${cat.slug}`}
                className="chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-fg-muted"
              >
                <CategoryIcon category={cat.slug} size={16} className="text-accent" />
                {cat.label}
                {catCounts.get(cat.slug) ? (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-fg">
                    {catCounts.get(cat.slug)}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Bibliothek</p>
            <h2 className="mt-2 text-3xl font-bold">Beliebte Komponenten</h2>
            <p className="mt-1.5 text-sm text-fg-muted">Jede Karte ist eine echte Live-Vorschau — kein Screenshot.</p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm text-fg-muted transition hover:text-white"
          >
            Alle ansehen <ArrowRight size={15} />
          </Link>
        </div>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => (
            <StaggerItem key={c.id}>
              <ComponentCard c={c} popular={i < 3 && c.likes > 0} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------- So funktioniert's ---------- */}
      <section id="so" className="mx-auto max-w-6xl px-5 pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Workflow</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Unter 60 Sekunden bis zum Einbau</h2>
          <p className="mt-3 text-fg-muted">Von der Idee zur eingebauten Komponente — in drei Schritten.</p>
        </div>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <StaggerItem key={s.title} className="spotlight glass relative rounded-2xl p-7">
              {i < STEPS.length - 1 && <span className="step-line hidden sm:block" aria-hidden="true" />}
              <div className="flex items-center gap-4">
                <span className="conic-ring grid h-[52px] w-[52px] place-items-center rounded-2xl">
                  <s.icon size={20} className="text-accent" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs tracking-[0.18em] text-fg-dim">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------- Why (datengetrieben) ---------- */}
      <WhySection stats={stats} />

      {/* ---------- Community CTA ---------- */}
      <CommunityCTA stats={stats} />
    </>
  );
}
