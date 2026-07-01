"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import type { Category } from "@/lib/types";

export interface SearchItem {
  title: string;
  slug: string;
  category: Category;
}

const FALLBACK = ["Glow-Button", "Loader", "Gradient-Card", "Toggle", "Aurora", "Glassmorphism", "Neon"];
const PLACEHOLDERS = [
  "Suche nach Buttons, Loadern, Glow-Effekten …",
  "z. B. „Aurora-Button\" …",
  "z. B. „Glassmorphism-Card\" …",
  "z. B. „animierter Toggle\" …",
];

export default function HeroSearch({
  items = [],
  recent = [],
}: {
  items?: SearchItem[];
  recent?: SearchItem[];
}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focused, setFocused] = useState(false);
  const [phIndex, setPhIndex] = useState(0);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotierender Placeholder — nur solange nichts getippt wurde.
  useEffect(() => {
    if (q) return;
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(id);
  }, [q]);

  // Debounce (200 ms) für die Vorschläge.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(id);
  }, [q]);

  // Blur-Timer beim Unmount aufräumen (kein setState nach Unmount).
  useEffect(() => () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }, []);

  function go(term: string) {
    router.push(`/explore${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  }

  const matches = useMemo(() => {
    const query = debounced.toLowerCase();
    if (!query) return items.slice(0, 5);
    return items
      .filter((it) => it.title.toLowerCase().includes(query) || it.category.toLowerCase().includes(query))
      .slice(0, 5);
  }, [debounced, items]);

  // Optionsliste für Tastatur-Navigation: [0] = „Alle Ergebnisse", danach Treffer.
  const hasAllOption = debounced.length > 0;
  const optionCount = (hasAllOption ? 1 : 0) + matches.length;
  const showDropdown = focused && optionCount > 0;

  function selectAt(index: number) {
    if (hasAllOption && index === 0) return go(debounced);
    const it = matches[index - (hasAllOption ? 1 : 0)];
    if (it) router.push(`/c/${it.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % optionCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + optionCount) % optionCount);
    } else if (e.key === "Enter") {
      if (active >= 0) {
        e.preventDefault();
        selectAt(active);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative mx-auto mt-9 w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q.trim());
        }}
        role="search"
        className="group relative z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 pl-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_-24px_rgba(139,92,246,0.4)] backdrop-blur transition focus-within:border-accent/50 focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_40px_-8px_rgba(139,92,246,0.4)]"
      >
        <Search size={20} className="shrink-0 text-fg-dim" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 120);
          }}
          placeholder={PLACEHOLDERS[phIndex]}
          aria-label="Komponenten suchen"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
          aria-controls="hero-suggestions"
          aria-activedescendant={showDropdown && active >= 0 ? `hero-opt-${active}` : undefined}
          className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-dim"
        />
        <button
          type="submit"
          className="btn-grad inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm"
        >
          Suchen <ArrowRight size={16} />
        </button>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id="hero-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="glass absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl p-1.5 text-left shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
          >
            {hasAllOption && (
              <li id="hero-opt-0" role="option" aria-selected={active === 0}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(0)}
                  onClick={() => go(debounced)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-fg transition ${
                    active === 0 ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Search size={15} className="text-accent" />
                    Alle Ergebnisse für „{debounced}&ldquo;
                  </span>
                  <CornerDownLeft size={14} className="text-fg-dim" />
                </button>
              </li>
            )}
            {matches.map((it, i) => {
              const idx = i + (hasAllOption ? 1 : 0);
              return (
                <li key={it.slug} id={`hero-opt-${idx}`} role="option" aria-selected={active === idx}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => router.push(`/c/${it.slug}`)}
                    className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg-muted transition ${
                      active === idx ? "bg-white/10 text-fg" : "hover:bg-white/5 hover:text-fg"
                    }`}
                  >
                    <CategoryIcon category={it.category} size={16} className="text-accent" />
                    {it.title}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-fg-dim lg:justify-start">
        <span>Beliebt:</span>
        {FALLBACK.slice(0, 5).map((s) => (
          <button
            key={s}
            onClick={() => go(s)}
            className="cursor-pointer rounded-full border border-white/10 px-2.5 py-1 text-fg-muted transition hover:border-accent/40 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-fg-dim lg:justify-start">
          <span>Zuletzt hinzugefügt:</span>
          {recent.slice(0, 3).map((r) => (
            <Link key={r.slug} href={`/c/${r.slug}`} className="text-fg-muted underline-offset-2 hover:text-white hover:underline">
              {r.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
