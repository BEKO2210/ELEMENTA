import Link from "next/link";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import type { UIComponent } from "@/lib/types";
import SandboxPreview from "./SandboxPreview";
import QuickCopy from "./QuickCopy";

const FRAMEWORK_LABEL: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  tailwind: "Tailwind",
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
};

// Farbcodierte Framework-Badges für schnelle visuelle Zuordnung.
const FRAMEWORK_COLOR: Record<string, string> = {
  react: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  vue: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  svelte: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  tailwind: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  html: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  css: "border-blue-400/30 bg-blue-400/10 text-blue-200",
};

const NEW_DAYS = 14;

function isNew(createdAt: string): boolean {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export default function ComponentCard({ c, popular }: { c: UIComponent; popular?: boolean }) {
  const copyText = [c.html, c.css && `\n<style>\n${c.css}\n</style>`].filter(Boolean).join("");
  const badge = FRAMEWORK_COLOR[c.framework] ?? "border-white/10 bg-white/5 text-fg-muted";

  return (
    <article className="card spotlight group relative overflow-hidden">
      {/* Ganzflächiger Navigations-Link (liegt unter den interaktiven Elementen). */}
      <Link href={`/c/${c.slug}`} className="absolute inset-0 z-10" aria-label={`${c.title} öffnen`} />

      <div className="card-preview pointer-events-none relative border-b border-white/5">
        <SandboxPreview framework={c.framework} html={c.html} css={c.css} js={c.js} height={220} fit />
      </div>

      {/* Status-Badges (oben links) */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-1.5">
        {isNew(c.createdAt) && (
          <span className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <Sparkles size={11} /> Neu
          </span>
        )}
        {popular && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/15 px-2 py-0.5 text-[11px] font-medium text-amber-100 backdrop-blur">
            <Heart size={11} /> Beliebt
          </span>
        )}
      </div>

      {/* Quick-Copy (oben rechts, immer sichtbar) */}
      <div className="absolute right-3 top-3 z-20">
        <QuickCopy text={copyText} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-fg transition group-hover:text-white">{c.title}</h3>
          <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${badge}`}>
            {FRAMEWORK_LABEL[c.framework] ?? c.framework}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">{c.description}</p>

        {c.tags.length > 0 && (
          <div className="relative z-20 mt-3 flex flex-wrap gap-1.5">
            {c.tags.slice(0, 2).map((t) => (
              <Link
                key={t}
                href={`/explore?q=${encodeURIComponent(t)}`}
                className="inline-flex min-h-6 items-center rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-fg-muted transition hover:border-accent/40 hover:text-white"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-fg-muted">
          <span>@{c.author}</span>
          <div className="flex items-center gap-3">
            {c.a11y === "pass" && (
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <ShieldCheck size={13} /> WCAG
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Heart size={13} /> {c.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
