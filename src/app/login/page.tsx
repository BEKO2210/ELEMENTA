"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      router.push("/");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      // Freundliche, konkrete Meldungen statt roher Appwrite-Fehler.
      if (/invalid credentials|invalid.*password/i.test(raw)) {
        setError("E-Mail oder Passwort ist falsch. Bitte prüfe deine Eingabe.");
      } else if (/already exists|user_already/i.test(raw)) {
        setError("Für diese E-Mail existiert bereits ein Konto. Melde dich stattdessen an.");
      } else if (/rate|too many/i.test(raw)) {
        setError("Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.");
      } else {
        setError(raw || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20">
      <h1 className="text-3xl font-bold">
        {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
      </h1>
      <p className="mt-2 text-fg-muted">
        {mode === "login"
          ? "Melde dich an, um Komponenten zu speichern und hochzuladen."
          : "Erstelle ein kostenloses Konto und teile deine Komponenten."}
      </p>

      <form onSubmit={submit} className="glass mt-8 space-y-4 rounded-2xl p-6">
        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent/50"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="E-Mail"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent/50"
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Passwort (min. 8 Zeichen)"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent/50"
        />

        {error && (
          <p className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-grad flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {mode === "login" ? "Anmelden" : "Registrieren"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {mode === "login" ? "Noch kein Konto?" : "Schon registriert?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="text-accent hover:underline"
        >
          {mode === "login" ? "Jetzt registrieren" : "Anmelden"}
        </button>
      </p>
    </div>
  );
}
