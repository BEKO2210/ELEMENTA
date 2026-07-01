"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GithubIcon } from "./BrandIcons";

const LINKS = [
  { href: "/explore", label: "Entdecken" },
  { href: "/submit", label: "Hochladen" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "Über uns" },
];

/** Mobiles Navigationsmenü (< md). Auf Desktop ausgeblendet. */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Bei Routenwechsel schließen.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape schließt; Hintergrund-Scroll sperren, solange offen.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-fg-muted transition hover:text-white"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              id="mobile-menu"
              ref={panelRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="glass fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              <nav aria-label="Mobile Navigation" className="flex flex-col">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-xl px-4 py-3 text-sm text-fg-muted transition hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
                <a
                  href="https://github.com/BEKO2210/ELEMENTA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-fg-muted transition hover:bg-white/5 hover:text-white"
                >
                  <GithubIcon size={15} /> GitHub
                </a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
