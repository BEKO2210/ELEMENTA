import type { UIComponent } from "@/lib/types";
import ComponentCard from "./ComponentCard";

/**
 * „Ähnliche Komponenten" — abgeleitet aus gleicher Kategorie, geteilten Tags oder
 * gleichem Autor. Reihenfolge nach Relevanz-Score, keine Zufallsauswahl.
 */
export function relatedTo(current: UIComponent, all: UIComponent[], limit = 3): UIComponent[] {
  return all
    .filter((c) => c.slug !== current.slug)
    .map((c) => {
      let score = 0;
      if (c.category === current.category) score += 3;
      score += c.tags.filter((t) => current.tags.includes(t)).length * 2;
      if (c.author === current.author) score += 1;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.c.likes - a.c.likes)
    .slice(0, limit)
    .map((x) => x.c);
}

export default function RelatedComponents({ items }: { items: UIComponent[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-14">
      <h2 className="text-lg font-semibold text-fg">Ähnliche Komponenten</h2>
      <p className="mt-1 text-sm text-fg-muted">Aus derselben Kategorie oder mit passenden Tags.</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <ComponentCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}
