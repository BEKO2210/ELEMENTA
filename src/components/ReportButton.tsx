"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";
import { Flag, Loader2, X } from "lucide-react";
import { databases, DB_ID, COL_REPORTS } from "@/lib/appwrite";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

type Target = "comment" | "component";

const REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam oder Werbung" },
  { value: "abuse", label: "Beleidigung, Hass oder Belästigung" },
  { value: "illegal", label: "Rechtsverletzung (z. B. Urheberrecht)" },
  { value: "other", label: "Sonstiges" },
];

export default function ReportButton({
  targetType,
  targetId,
  className,
  compact,
}: {
  targetType: Target;
  targetId: string;
  className?: string;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  function start() {
    if (!user) return router.push("/login");
    setOpen(true);
  }

  async function submit() {
    if (!user) return;
    setBusy(true);
    try {
      // reports: nur create(users) — der Client kann melden, aber nichts zurücklesen.
      await databases().createDocument(DB_ID, COL_REPORTS, ID.unique(), {
        targetType,
        targetId,
        reason,
        details: details.trim().slice(0, 1000),
        reporterId: user.$id,
        reporterName: user.name || "anon",
        status: "open",
        createdAt: new Date().toISOString(),
      });
      setOpen(false);
      setDetails("");
      setReason("spam");
      toast("Danke — die Meldung ist eingegangen und wird geprüft.", "success");
    } catch {
      toast("Meldung konnte nicht gesendet werden.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={start}
        title="Melden"
        aria-label="Melden"
        className={
          className ??
          `inline-flex items-center gap-1 text-xs text-fg-dim transition hover:text-red-300 ${compact ? "" : ""}`
        }
      >
        <Flag size={compact ? 13 : 14} />
        {!compact && "Melden"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Inhalt melden"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Flag size={18} className="text-red-300" /> Inhalt melden
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="text-fg-dim transition hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-fg-muted">
              Warum meldest du {targetType === "comment" ? "diesen Kommentar" : "diese Komponente"}?
            </p>

            <fieldset className="mt-4 space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:border-white/20"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-[#8b5cf6]"
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Optional: Beschreibe kurz das Problem …"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent/50"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg-muted transition hover:text-white"
              >
                Abbrechen
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Flag size={15} />}
                Melden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
