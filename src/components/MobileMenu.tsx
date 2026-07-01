"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, LogOut, LogIn } from "lucide-react";
import { GithubIcon } from "./BrandIcons";
import { useAuth } from "./AuthProvider";

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
  const { user, logout } = useAuth();
  const router = useRouter();

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
              className="fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]/98 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
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

                <div className="my-1 h-px bg-white/10" />

                {user ? (
                  <>
                    <Link
                      href="/profil"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-fg-muted transition hover:bg-white/5 hover:text-white"
                    >
                      <User size={15} /> Mein Profil
                    </Link>
                    <button
                      onClick={async () => {
                        setOpen(false);
                        await logout();
                        router.push("/");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-fg-muted transition hover:bg-white/5 hover:text-white"
                    >
                      <LogOut size={15} /> Abmelden
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-fg-muted transition hover:bg-white/5 hover:text-white"
                  >
                    <LogIn size={15} /> Anmelden / Registrieren
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
