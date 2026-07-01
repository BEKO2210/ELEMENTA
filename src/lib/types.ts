export type Framework = "html" | "css" | "tailwind" | "react" | "vue" | "svelte";

export type Category =
  | "buttons"
  | "cards"
  | "loaders"
  | "inputs"
  | "toggles"
  | "backgrounds";

export interface UIComponent {
  id: string;
  slug: string;
  title: string;
  description: string;
  framework: Framework;
  category: Category;
  tags: string[];
  html: string;
  css: string;
  js: string;
  author: string;
  /** Stabile Appwrite-User-ID des Autors (für Ownership-Checks; bei Mock-Daten undefined). */
  authorId?: string;
  likes: number;
  /** Accessibility check result (WCAG) — our differentiator vs competitors. */
  a11y: "pass" | "warn" | "unchecked";
  createdAt: string;
}

export interface CategoryMeta {
  slug: Category;
  label: string;
}
