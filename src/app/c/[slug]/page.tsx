import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ShieldCheck, AlertTriangle, Eye } from "lucide-react";
import { fetchComponent, fetchComponents, fetchSlugs, attachLikeCounts } from "@/lib/data";
import { CATEGORIES } from "@/lib/mock-data";
import PreviewStage from "@/components/PreviewStage";
import CodeSection from "@/components/CodeSection";
import InstallGuide from "@/components/InstallGuide";
import RelatedComponents, { relatedTo } from "@/components/RelatedComponents";
import LikeButton from "@/components/LikeButton";
import FavoriteButton from "@/components/FavoriteButton";
import Comments from "@/components/Comments";
import AuthorCard from "@/components/AuthorCard";
import JsonLd from "@/components/JsonLd";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category } from "@/lib/types";

const BASE = "https://ui.it-handwerk-stuttgart.de";

const FW_LABEL: Record<string, string> = {
  html: "HTML", css: "CSS", tailwind: "Tailwind", react: "React", vue: "Vue", svelte: "Svelte",
};

// Immer frisch rendern, damit Bearbeitungen sofort sichtbar sind (konsistent mit / und /explore).
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await fetchSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await fetchComponent(slug);
  if (!c) return { title: "Nicht gefunden" };
  return {
    // Längerer, beschreibender SERP-Titel (Ziel 50–60 Zeichen); Template hängt „· Elementa" an.
    title: `${c.title} – ${FW_LABEL[c.framework] ?? c.framework}-Komponente zum Kopieren`,
    description: c.description,
    alternates: { canonical: `/c/${slug}` },
    openGraph: {
      siteName: "Elementa",
      title: c.title,
      description: c.description,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: c.title, description: c.description },
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await fetchComponent(slug);
  if (!c) notFound();

  const catLabel = CATEGORIES.find((x) => x.slug === c.category)?.label ?? c.category;
  const initial = c.author.charAt(0).toUpperCase();

  const related = relatedTo(c, await attachLikeCounts(await fetchComponents()));

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: c.title,
          description: c.description,
          programmingLanguage: FW_LABEL[c.framework] ?? c.framework,
          codeRepository: `${BASE}/c/${c.slug}`,
          url: `${BASE}/c/${c.slug}`,
          author: { "@type": "Person", name: c.author },
          license: "https://opensource.org/licenses/MIT",
          keywords: c.tags.join(", "),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Elementa", item: BASE },
            { "@type": "ListItem", position: 2, name: catLabel, item: `${BASE}/explore?cat=${c.category}` },
            { "@type": "ListItem", position: 3, name: c.title, item: `${BASE}/c/${c.slug}` },
          ],
        }}
      />
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/" className="hover:text-white">Elementa</Link>
        <ChevronRight size={14} className="text-fg-dim" />
        <Link href={`/explore?cat=${c.category}`} className="inline-flex items-center gap-1 hover:text-white">
          <CategoryIcon category={c.category as Category} size={14} /> {catLabel}
        </Link>
        <ChevronRight size={14} className="text-fg-dim" />
        <span className="text-fg">{c.title}</span>
      </nav>

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{c.title}</h1>
          <p className="mt-2 max-w-2xl text-fg-muted">{c.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={`/u/${encodeURIComponent(c.author)}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-white/20"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full btn-grad text-xs font-bold">{initial}</span>
              @{c.author}
            </Link>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-fg-muted">
              {FW_LABEL[c.framework] ?? c.framework}
            </span>
            {c.a11y === "pass" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
                <ShieldCheck size={13} /> WCAG 2.2
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-300">
                <AlertTriangle size={13} /> A11y prüfen
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-fg-dim">
              <Eye size={13} /> {c.createdAt?.slice(0, 10)}
            </span>
          </div>

          {c.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <Link
                  key={t}
                  href={`/explore?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-fg-muted transition hover:border-accent/40 hover:text-white"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton componentId={c.id} />
          <LikeButton componentId={c.id} initialLikes={c.likes} />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6">
        <PreviewStage framework={c.framework} html={c.html} css={c.css} js={c.js} height={380} />
      </div>

      {/* Code */}
      <div className="mt-5">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Code — zum Kopieren &amp; Einfügen</h2>
        <CodeSection c={c} />
      </div>

      {/* Installationsanleitung */}
      <InstallGuide c={c} />

      {/* Autor + Teilen */}
      <AuthorCard username={c.author} authorId={c.authorId} title={c.title} />

      {/* Ähnliche Komponenten */}
      <RelatedComponents items={related} />

      {/* Kommentare */}
      <Comments componentId={c.id} />
    </div>
  );
}
