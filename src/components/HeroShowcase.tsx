"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Framework } from "@/lib/types";
import SandboxPreview from "./SandboxPreview";
import CopyButton from "./CopyButton";

export interface ShowcaseItem {
  label: string;
  slug: string;
  title: string;
  framework: Framework;
  html: string;
  css: string;
  js: string;
}

/**
 * Interaktiver Produkt-Showcase im Hero: Tabs wechseln zwischen echten, live
 * gerenderten Komponenten (kein Screenshot) inkl. Copy-Button und Detail-Link.
 */
export default function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const cur = items[active];
  const copyText = [cur.html, cur.css && `\n<style>\n${cur.css}\n</style>`].filter(Boolean).join("");

  return (
    <div className="glass overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(139,92,246,0.5)]">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 p-2" role="tablist" aria-label="Komponenten-Vorschau">
        {items.map((it, i) => (
          <button
            key={it.slug}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              i === active ? "bg-white/10 text-white" : "text-fg-muted hover:text-white"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>

      {/* Live-Vorschau */}
      <div className="checker relative">
        <SandboxPreview
          key={cur.slug}
          framework={cur.framework}
          html={cur.html}
          css={cur.css}
          js={cur.js}
          height={260}
          fit
        />
      </div>

      {/* Aktionen */}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 p-3">
        <Link
          href={`/c/${cur.slug}`}
          className="inline-flex items-center gap-1 text-sm text-fg-muted transition hover:text-white"
        >
          {cur.title} <ArrowUpRight size={15} />
        </Link>
        <CopyButton text={copyText} label="Code kopieren" />
      </div>
    </div>
  );
}
