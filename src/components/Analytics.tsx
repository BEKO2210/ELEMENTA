"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent, CONSENT_EVENT } from "@/lib/consent";

/**
 * Consent-gebundene First-Party-Reichweitenmessung.
 * Sendet einen anonymen Pageview-Beacon an /api/track — ausschließlich wenn die
 * Nutzerin/der Nutzer der Statistik zugestimmt hat. Keine Dritt-Anbieter, keine IDs.
 */
export default function Analytics() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    setAllowed(hasAnalyticsConsent());
    const onChange = () => setAllowed(hasAnalyticsConsent());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!allowed || !pathname) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      ref: document.referrer ? new URL(document.referrer).hostname : null,
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", body: payload, keepalive: true });
      }
    } catch {
      /* Analytik darf niemals die App beeinträchtigen. */
    }
  }, [allowed, pathname]);

  return null;
}
