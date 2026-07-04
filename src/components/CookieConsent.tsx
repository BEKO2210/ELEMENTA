"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, BarChart3, ShieldCheck } from "lucide-react";
import { readConsent, saveConsent, type ConsentValue } from "@/lib/consent";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState<ConsentValue>("denied");

  useEffect(() => {
    // Banner nur zeigen, wenn noch keine Entscheidung vorliegt.
    const existing = readConsent();
    if (!existing) setOpen(true);
    else setAnalytics(existing.analytics);

    const reopen = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? "denied");
      setShowSettings(true);
      setOpen(true);
    };
    window.addEventListener("elementa-open-cookie-settings", reopen);
    return () => window.removeEventListener("elementa-open-cookie-settings", reopen);
  }, []);

  function decide(value: ConsentValue) {
    saveConsent(value);
    setOpen(false);
    setShowSettings(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie-Einstellungen"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:inset-x-5 sm:bottom-5"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-accent">
              <Cookie size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-fg">Wir respektieren deine Privatsphäre</h2>
              <p className="mt-1 text-sm text-fg-muted">
                Wir nutzen technisch notwendige Cookies für den Betrieb. Optional hilft uns eine
                anonyme, in der EU gehostete Reichweitenmessung (keine Dritt-Anbieter). Details in
                der{" "}
                <Link href="/datenschutz" className="text-fg underline decoration-white/30 underline-offset-4 transition hover:decoration-accent">
                  Datenschutzerklärung
                </Link>
                .
              </p>

              <AnimatePresence initial={false}>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span className="flex items-center gap-2 text-sm text-fg">
                          <ShieldCheck size={16} className="text-emerald-400" aria-hidden="true" />
                          Notwendig
                        </span>
                        <span className="text-xs text-fg-dim">Immer aktiv</span>
                      </div>
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span className="flex items-center gap-2 text-sm text-fg">
                          <BarChart3 size={16} className="text-accent" aria-hidden="true" />
                          Statistik (First-Party-Analytik)
                        </span>
                        <input
                          type="checkbox"
                          checked={analytics === "granted"}
                          onChange={(e) => setAnalytics(e.target.checked ? "granted" : "denied")}
                          className="h-4 w-4 accent-[var(--accent)]"
                          aria-label="Statistik erlauben"
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => decide("granted")}
                  className="btn-grad inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm"
                >
                  Alle akzeptieren
                </button>
                <button
                  onClick={() => decide("denied")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg-muted transition hover:border-white/20 hover:text-white"
                >
                  Nur notwendige
                </button>
                {showSettings ? (
                  <button
                    onClick={() => decide(analytics)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg-muted transition hover:border-white/20 hover:text-white"
                  >
                    Auswahl speichern
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-fg-muted transition hover:text-white"
                  >
                    Einstellungen
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
