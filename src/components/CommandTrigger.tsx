"use client";

import { Search } from "lucide-react";

/** Öffnet die globale Command-Palette (⌘K) per Custom-Event. */
export default function CommandTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("open-command"))}
      title="Suche öffnen (⌘K)"
      aria-label="Command-Palette öffnen"
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-2 text-sm text-fg-muted transition hover:border-accent/40 hover:text-white"
    >
      <Search size={15} />
      <kbd className="hidden rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium sm:block">
        ⌘K
      </kbd>
    </button>
  );
}
