"use client";

import { useEffect } from "react";

/**
 * Globaler Cursor-Spotlight: setzt --mx/--my auf allen .spotlight-Elementen
 * unter dem Cursor (Event-Delegation statt Listener pro Karte).
 * Rein dekorativ — auf Touch-Geräten und bei reduced-motion inaktiv.
 */
export default function SpotlightEffect() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    function onMove(e: MouseEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = (e.target as Element | null)?.closest?.(".spotlight");
        if (!(el instanceof HTMLElement)) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
