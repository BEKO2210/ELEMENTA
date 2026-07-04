import type { CategoryMeta } from "./types";

export const CATEGORIES: CategoryMeta[] = [
  { slug: "buttons", label: "Buttons" },
  { slug: "cards", label: "Cards" },
  { slug: "loaders", label: "Loader" },
  { slug: "inputs", label: "Inputs" },
  { slug: "toggles", label: "Toggles" },
  { slug: "backgrounds", label: "Backgrounds" },
];

export const FRAMEWORKS: { slug: string; label: string }[] = [
  { slug: "html", label: "HTML/CSS" },
  { slug: "tailwind", label: "Tailwind" },
  { slug: "react", label: "React" },
  { slug: "vue", label: "Vue" },
  { slug: "svelte", label: "Svelte" },
];
