import type { Category } from "@/lib/types";

/** Handgezeichnete, konsistente SVG-Icons pro Kategorie — keine Emojis. */
export function CategoryIcon({
  category,
  size = 18,
  className = "",
}: {
  category: Category;
  size?: number;
  className?: string;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (category) {
    case "buttons":
      return (
        <svg {...p}>
          <rect x="3" y="8" width="18" height="8" rx="4" />
          <circle cx="8" cy="12" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "cards":
      return (
        <svg {...p}>
          <rect x="3" y="7" width="12" height="13" rx="2" />
          <path d="M8 3h11a1 1 0 0 1 1 1v12" />
        </svg>
      );
    case "loaders":
      return (
        <svg {...p}>
          <path d="M12 3a9 9 0 1 0 9 9" />
          <path d="M12 7a5 5 0 0 0-5 5" opacity="0.5" />
        </svg>
      );
    case "inputs":
      return (
        <svg {...p}>
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <path d="M7 12h1.5" />
        </svg>
      );
    case "toggles":
      return (
        <svg {...p}>
          <rect x="3" y="8" width="18" height="8" rx="4" />
          <circle cx="16" cy="12" r="2.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "backgrounds":
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 16l4.5-4.5 3.5 3.5 3-3L21 17" />
          <circle cx="8" cy="8" r="1.4" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
