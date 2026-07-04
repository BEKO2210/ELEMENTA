"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, Loader2, Check, Trash2, ExternalLink, X } from "lucide-react";
import { account } from "@/lib/appwrite";
import { useToast } from "./Toast";

interface Report {
  id: string;
  targetType: "comment" | "component";
  targetId: string;
  reason: string;
  details: string;
  reporterName: string;
  status: string;
  createdAt: string;
  preview: string;
  targetUrl: string;
}

const REASON_LABEL: Record<string, string> = {
  spam: "Spam / Werbung",
  abuse: "Beleidigung / Hass",
  illegal: "Rechtsverletzung",
  other: "Sonstiges",
};

async function authFetch(url: string, init?: RequestInit) {
  // Kurzlebiges JWT als Identitätsnachweis für die Admin-API
  const jwt = (await account().createJWT()).jwt;
  return fetch(url, {
    ...init,
    headers: { ...(init?.headers || {}), Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
  });
}

export default function AdminReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setReports(null);
    try {
      const res = await authFetch("/api/admin/reports?status=open");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Fehler");
      setReports(data.reports);
    } catch {
      toast("Meldungen konnten nicht geladen werden.", "error");
      setReports([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: "dismissed" | "resolved") {
    setBusyId(id);
    try {
      const res = await authFetch("/api/admin/reports", { method: "PATCH", body: JSON.stringify({ id, status }) });
      if (!res.ok) throw new Error();
      setReports((r) => (r ? r.filter((x) => x.id !== id) : r));
      toast(status === "dismissed" ? "Meldung verworfen." : "Meldung geschlossen.", "info");
    } catch {
      toast("Aktion fehlgeschlagen.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTarget(r: Report) {
    setBusyId(r.id);
    try {
      const res = await authFetch("/api/admin/reports", {
        method: "POST",
        body: JSON.stringify({ id: r.id, targetType: r.targetType, targetId: r.targetId }),
      });
      if (!res.ok) throw new Error();
      setReports((list) => (list ? list.filter((x) => x.id !== r.id) : list));
      toast(`${r.targetType === "comment" ? "Kommentar" : "Komponente"} gelöscht.`, "success");
    } catch {
      toast("Löschen fehlgeschlagen.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ShieldAlert size={18} className="text-red-300" /> Offene Meldungen
          {reports && reports.length > 0 && <span className="text-fg-muted">({reports.length})</span>}
        </h2>
        <button onClick={load} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-fg-muted transition hover:text-white">
          Aktualisieren
        </button>
      </div>

      {reports === null ? (
        <p className="py-16 text-center text-fg-muted"><Loader2 className="mx-auto animate-spin" /></p>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-white/10 py-16 text-center">
          <p className="text-fg-muted">Keine offenen Meldungen — alles sauber. 🎉</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-2xl border border-white/10 bg-panel p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-0.5 font-semibold text-red-300">
                  {REASON_LABEL[r.reason] || r.reason}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-fg-muted">
                  {r.targetType === "comment" ? "Kommentar" : "Komponente"}
                </span>
                <span className="text-fg-dim">von @{r.reporterName} · {r.createdAt?.slice(0, 10)}</span>
              </div>

              <p className="mt-2 line-clamp-3 whitespace-pre-wrap rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-fg-muted">
                {r.preview || "(kein Inhalt)"}
              </p>
              {r.details && <p className="mt-2 text-sm text-fg"><span className="text-fg-dim">Hinweis:</span> {r.details}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.targetUrl && (
                  <Link href={r.targetUrl} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-fg-muted transition hover:text-white">
                    <ExternalLink size={14} /> Ansehen
                  </Link>
                )}
                <button
                  onClick={() => deleteTarget(r)}
                  disabled={busyId === r.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Inhalt löschen
                </button>
                <button
                  onClick={() => setStatus(r.id, "dismissed")}
                  disabled={busyId === r.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-fg-muted transition hover:text-white disabled:opacity-60"
                >
                  <X size={14} /> Verwerfen
                </button>
                <button
                  onClick={() => setStatus(r.id, "resolved")}
                  disabled={busyId === r.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-fg-muted transition hover:text-white disabled:opacity-60"
                >
                  <Check size={14} /> Erledigt
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
