"use client";

import { Cookie } from "lucide-react";
import { openCookieSettings } from "@/lib/consent";

/** Öffnet den Cookie-Consent-Dialog erneut (z. B. aus der Datenschutzerklärung). */
export default function CookieSettingsButton() {
  return (
    <button
      onClick={openCookieSettings}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg transition hover:border-white/20 hover:text-white"
    >
      <Cookie size={15} className="text-accent" aria-hidden="true" />
      Cookie-Einstellungen ändern
    </button>
  );
}
