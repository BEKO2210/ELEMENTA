"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/explore", label: "Entdecken" },
  { href: "/submit", label: "Hochladen" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "Über uns" },
];

/** Hauptnavigation mit aktivem Zustand (Gradient-Underline bleibt sichtbar). */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Hauptnavigation" className="hidden items-center gap-7 text-sm text-fg-muted md:flex">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`nav-link transition hover:text-white ${
              active ? "nav-link-active text-white" : ""
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
