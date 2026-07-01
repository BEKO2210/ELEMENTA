"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Home, Compass, Upload, User, LogIn, LogOut, Plus, Box, CornerDownLeft,
} from "lucide-react";
import { fetchComponents } from "@/lib/data";
import type { UIComponent } from "@/lib/types";
import { useAuth } from "./AuthProvider";

interface Item {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Home;
  group: string;
  run: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [comps, setComps] = useState<UIComponent[]>([]);
  const { user, logout } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  // ⌘K / Ctrl+K + externes „open-command"-Event (Navbar-Button)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command", onOpen);
    };
  }, []);

  // Komponenten genau einmal laden (setzt NICHT die Sucheingabe zurück).
  useEffect(() => {
    if (open && !loadedRef.current) {
      loadedRef.current = true;
      fetchComponents()
        .then(setComps)
        .catch(() => {
          // Fehler beim Laden → Retry beim nächsten Öffnen erlauben.
          loadedRef.current = false;
        });
    }
  }, [open]);

  // Beim Öffnen Eingabe/Fokus zurücksetzen + Hintergrund-Scroll sperren.
  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }
  function go(path: string) {
    close();
    router.push(path);
  }

  const nav: Item[] = [
    { id: "home", label: "Startseite", icon: Home, group: "Navigation", run: () => go("/") },
    { id: "explore", label: "Komponenten entdecken", icon: Compass, group: "Navigation", run: () => go("/explore") },
    { id: "submit", label: "Komponente hochladen", icon: Upload, group: "Navigation", run: () => go("/submit") },
    ...(user
      ? [
          { id: "profile", label: "Mein Profil", icon: User, group: "Navigation", run: () => go("/profil") } as Item,
          { id: "new", label: "Neue Komponente", icon: Plus, group: "Aktionen", run: () => go("/submit") } as Item,
          {
            id: "logout",
            label: "Abmelden",
            icon: LogOut,
            group: "Aktionen",
            run: async () => {
              close();
              await logout();
              router.push("/");
            },
          } as Item,
        ]
      : [{ id: "login", label: "Anmelden / Registrieren", icon: LogIn, group: "Navigation", run: () => go("/login") } as Item]),
  ];

  const compItems: Item[] = comps.map((c) => ({
    id: "c-" + c.id,
    label: c.title,
    hint: "@" + c.author,
    icon: Box,
    group: "Komponenten",
    run: () => go("/c/" + c.slug),
  }));

  const query = q.trim().toLowerCase();
  const all = [...nav, ...compItems];
  const filtered = (
    query
      ? all.filter((i) => i.label.toLowerCase().includes(query) || i.hint?.toLowerCase().includes(query))
      : all.filter((i) => i.group !== "Komponenten").concat(compItems.slice(0, 4))
  ).slice(0, 24);

  const safeActive = Math.min(active, Math.max(0, filtered.length - 1));

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[safeActive]?.run();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Befehls- und Suchpalette"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="shrink-0 text-fg-dim" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Suchen oder springen zu …"
                className="flex-1 bg-transparent py-3.5 text-[15px] outline-none placeholder:text-fg-dim"
              />
              <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-fg-dim sm:block">ESC</kbd>
            </div>

            <div className="max-h-[52vh] overflow-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-fg-muted">Nichts gefunden.</p>
              ) : (
                filtered.map((item, i) => {
                  const Icon = item.icon;
                  const showGroup = i === 0 || filtered[i - 1].group !== item.group;
                  return (
                    <div key={item.id}>
                      {showGroup && (
                        <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-fg-dim">
                          {item.group}
                        </div>
                      )}
                      <button
                        onClick={item.run}
                        onMouseEnter={() => setActive(i)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          i === safeActive ? "bg-accent/15 text-white" : "text-fg-muted hover:bg-white/5"
                        }`}
                      >
                        <Icon size={16} className={i === safeActive ? "text-accent" : "text-fg-dim"} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.hint && <span className="truncate text-xs text-fg-dim">{item.hint}</span>}
                        {i === safeActive && <CornerDownLeft size={14} className="text-fg-dim" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-fg-dim">
              <span>↑↓ Navigieren</span>
              <span>↵ Öffnen</span>
              <span>ESC Schließen</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
