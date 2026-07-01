"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Check } from "lucide-react";

/**
 * Schlanker Newsletter-Signup mit DSGVO-Einwilligung.
 * Ohne angebundenen Dienst wird die Anmeldung lokal bestätigt — die E-Mail wird
 * NICHT an Dritte übermittelt. Ein echter Versanddienst kann später ergänzt werden.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Bitte stimme dem Erhalt von Updates zu.");
      return;
    }
    setError(null);
    setDone(true);
  }

  if (done) {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-300">
        <Check size={15} /> Danke! Wir melden uns bei Neuigkeiten.
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
          aria-label="Newsletter abonnieren"
          className="btn-grad inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
        >
          <Send size={15} />
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
