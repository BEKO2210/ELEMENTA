"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES, FRAMEWORKS } from "@/lib/mock-data";
import type { UIComponent } from "@/lib/types";
import ComponentCard from "@/components/ComponentCard";
import { CategoryIcon } from "@/components/CategoryIcon";

type Sort = "beliebt" | "neu" | "name";

export default function ExploreClient({ components }: { components: UIComponent[] }) {
  const params = useSearchParams();
  const [cat, setCat] = useState<string>(params.get("cat") ?? "all");
  const [fw, setFw] = useState<string>("all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("beliebt");

  // Schwelle für „Beliebt"-Badge: oberste ~10 % nach Likes (mind. 1 Like).
  const popularThreshold = useMemo(() => {
    const liked = components.map((c) => c.likes).filter((n) => n > 0).sort((a, b) => b - a);
    if (!liked.length) return Infinity;
    return liked[Math.floor(liked.length * 0.1)] ?? liked[0];
  }, [components]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = components.filter((c) => {
      if (cat !== "all" && c.category !== cat) return false;
      if (fw !== "all") {
        // Der "HTML/CSS"-Filter umfasst sowohl html- als auch css-Komponenten.
        const match = fw === "html" ? c.framework === "html" || c.framework === "css" : c.framework === fw;
        if (!match) return false;
      }
      if (
        query &&
        !(
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
        )
      )
        return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "beliebt") sorted.sort((a, b) => b.likes - a.likes);
    else if (sort === "neu") sorted.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    else sorted.sort((a, b) => a.title.localeCompare(b.title, "de"));
    return sorted;
  }, [components, cat, fw, q, sort]);

  function resetFilters() {
    setCat("all");
    setFw("all");
    setQ("");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8">
        <p className="eyebrow">Bibliothek</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Komponenten entdecken</h1>
        <p className="mt-2 text-fg-muted">
          {components.length} Komponenten · Live-Vorschau · zum Kopieren
        </p>
      </div>

      {/* Suche + Filter: sticky unter der Navbar, Glas-Fläche für Kontext beim Scrollen */}
      {/* Auf Mobile nicht sticky — das Panel wäre dort zu hoch und verdeckt die Karten. */}
      <div className="glass z-30 -mx-5 mb-8 space-y-3 border-x-0 px-5 py-4 sm:sticky sm:top-16 sm:mx-0 sm:rounded-2xl sm:border-x">
      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-dim"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche nach Buttons, Loader, Glow …"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-fg-dim focus:border-accent/50"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            Alle
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              <span className="mr-1.5 inline-flex align-middle">
                <CategoryIcon category={c.slug} size={14} />
              </span>
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip small active={fw === "all"} onClick={() => setFw("all")}>
            Alle Frameworks
          </Chip>
          {FRAMEWORKS.map((f) => (
            <Chip key={f.slug} small active={fw === f.slug} onClick={() => setFw(f.slug)}>
              {f.label}
            </Chip>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-fg-muted">Sortieren</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-fg outline-none transition focus:border-accent/50"
            >
              <option value="beliebt">Beliebt</option>
              <option value="neu">Neueste</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>
      </div>

      <p className="mb-4 text-sm text-fg-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "Komponente" : "Komponenten"} gefunden
      </p>

      {results.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-fg">
            Keine Ergebnisse{q.trim() ? ` für „${q.trim()}"` : ""}.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
            Versuche eine andere Schreibweise oder durchsuche alle Kategorien.
          </p>
          <button
            onClick={resetFilters}
            className="btn-grad mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <ComponentCard key={c.id} c={c} popular={c.likes >= popularThreshold} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      data-active={active}
      onClick={onClick}
      className={`chip rounded-full ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} text-fg-muted`}
    >
      {children}
    </button>
  );
}
