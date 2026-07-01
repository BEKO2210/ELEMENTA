/** Metadaten aller Guides/Blog-Artikel. Der Artikel-Inhalt liegt jeweils in
 *  src/app/guides/[slug]/page.tsx (echte, indexierbare Seiten). */
export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  /** ISO-Datum der Veröffentlichung. */
  date: string;
  readingMinutes: number;
  category: string;
}

export const GUIDES: GuideMeta[] = [
  {
    slug: "css-button-effekte",
    title: "10 CSS-Button-Effekte zum Kopieren (2026)",
    description:
      "Zehn moderne Button-Effekte in reinem CSS — Glow, Gradient-Border, Shine-Sweep, Magnetic & mehr. Barrierefrei, ohne Abhängigkeiten, sofort einsetzbar.",
    excerpt:
      "Von Glow bis Shine-Sweep: zehn Button-Effekte in reinem CSS, die deine Interfaces sofort hochwertiger wirken lassen — kopieren und einfügen.",
    date: "2026-07-01",
    readingMinutes: 7,
    category: "CSS",
  },
  {
    slug: "glassmorphism-css",
    title: "Glassmorphism in reinem CSS — Schritt für Schritt",
    description:
      "So baust du den Milchglas-Effekt (Glassmorphism) korrekt mit backdrop-filter — inklusive Fallbacks, Kontrast und Performance-Tipps.",
    excerpt:
      "Der Milchglas-Look richtig gemacht: backdrop-filter, Transparenz-Ebenen, Fallbacks und worauf du bei Kontrast & Performance achten musst.",
    date: "2026-07-01",
    readingMinutes: 6,
    category: "CSS",
  },
  {
    slug: "barrierefreie-toggles-wcag",
    title: "Barrierefreie Toggles: Was WCAG 2.2 wirklich verlangt",
    description:
      "Ein Toggle ist mehr als ein hübscher Switch: Tastaturbedienung, Fokus, ARIA-Rollen und reduzierte Bewegung — der komplette WCAG-2.2-Leitfaden.",
    excerpt:
      "Fokus, Tastatur, ARIA und prefers-reduced-motion: Was einen Toggle wirklich barrierefrei macht — mit kopierbarem, geprüftem Beispiel.",
    date: "2026-07-01",
    readingMinutes: 8,
    category: "Barrierefreiheit",
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
