import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Newsletter-Bestätigung",
  robots: { index: false, follow: false },
  alternates: { canonical: "/newsletter/bestaetigt" },
};

const MESSAGES: Record<string, { ok: boolean; title: string; text: string }> = {
  ok: { ok: true, title: "Anmeldung bestätigt 🎉", text: "Danke! Du bekommst ab jetzt Produkt-Updates von Elementa. Du kannst dich jederzeit wieder abmelden." },
  already: { ok: true, title: "Bereits bestätigt", text: "Deine Newsletter-Anmeldung war schon aktiv — alles gut, du bist dabei." },
  invalid: { ok: false, title: "Link ungültig oder abgelaufen", text: "Dieser Bestätigungslink ist nicht (mehr) gültig. Melde dich einfach erneut an, dann senden wir dir einen frischen Link." },
  error: { ok: false, title: "Etwas ist schiefgelaufen", text: "Die Bestätigung konnte nicht verarbeitet werden. Bitte versuche es später noch einmal." },
};

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const m = MESSAGES[state || "error"] || MESSAGES.error;

  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <span
        className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${
          m.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"
        }`}
      >
        {m.ok ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
      </span>
      <h1 className="mt-6 text-2xl font-bold">{m.title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-fg-muted">{m.text}</p>
      <Link href="/" className="btn-grad mt-6 inline-flex rounded-xl px-6 py-3">
        Zur Startseite
      </Link>
    </div>
  );
}
