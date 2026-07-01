/**
 * DSGVO-konforme Einwilligungsverwaltung (client-seitig).
 *
 * - "necessary": nur technisch notwendige Cookies/Storage (immer erlaubt).
 * - "analytics": First-Party-Reichweitenmessung — nur nach ausdrücklicher Einwilligung.
 *
 * Der Zustand wird in einem First-Party-Cookie (1 Jahr) + localStorage gespiegelt.
 * Änderungen lösen ein `elementa-consent-change` Event auf window aus, damit
 * Analytics & UI sofort reagieren können.
 */
export type ConsentValue = "granted" | "denied";

export interface Consent {
  analytics: ConsentValue;
  /** ISO-Zeitpunkt der Entscheidung — dient als Nachweis. */
  ts: string;
}

const COOKIE = "elementa_consent";
const EVENT = "elementa-consent-change";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

export function saveConsent(analytics: ConsentValue): Consent {
  const value: Consent = { analytics, ts: new Date().toISOString() };
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE}=${encodeURIComponent(
      JSON.stringify(value),
    )}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  }
  return value;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === "granted";
}

/** Öffnet die Cookie-Einstellungen erneut (vom Banner/Settings-Button genutzt). */
export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("elementa-open-cookie-settings"));
  }
}

export const CONSENT_EVENT = EVENT;
