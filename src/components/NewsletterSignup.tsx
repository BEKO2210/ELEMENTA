"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Check } from "lucide-react";

/**
 * Newsletter-Signup mit DSGVO-Einwilligung und DOUBLE-OPT-IN (T5): nach dem
 * Absenden geht eine Bestätigungs-Mail raus; erst der Link darin aktiviert das
 * Abo. Die E-Mail wird NICHT an Dritte übermittelt (EU-gehostetes Appwrite).
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Bitte stimme dem Erhalt von Updates zu.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Anmeldung derzeit nicht möglich.");
        return;
      }
      setDone(true);
    } catch {
      setError("Anmeldung derzeit nicht möglich.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="inline-flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-300">
        <Check size={15} className="mt-0.5 shrink-0" /> Fast geschafft! Wir haben dir eine Bestätigungs-Mail geschickt — bitte klick den Link darin.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xs">
      <p className="text-sm font-medium text-fg">Updates erhalten</p>
      <div className="mt-2 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@mail.de"
          aria-label="E-Mail für Newsletter"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition placeholder:text-fg-dim focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Newsletter abonnieren"
          className="btn-grad inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm disabled:opacity-60"
        >
          <Send size={15} className={busy ? "animate-pulse" : undefined} />
        </button>
      </div>
      <label className="mt-2 flex items-start gap-2 text-xs text-fg-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-[var(--accent)]"
        />
        <span>
          Ich möchte Produkt-Updates erhalten und akzeptiere die{" "}
          <Link href="/datenschutz" className="text-fg-muted underline underline-offset-2 hover:text-white">
            Datenschutzerklärung
          </Link>
          .
        </span>
      </label>
      {error && <p className="mt-1.5 text-xs text-red-300" role="alert">{error}</p>}
    </form>
  );
}
