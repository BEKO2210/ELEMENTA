"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { ID, Query, Permission, Role } from "appwrite";
import { databases, DB_ID, COL_FAVORITES } from "@/lib/appwrite";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

export default function FavoriteButton({
  componentId,
  compact = false,
}: {
  componentId: string;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [fav, setFav] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    // Bei Komponentenwechsel (oder Login-Wechsel) Status frisch aufsetzen.
    touched.current = false;
    setFav(false);
    setDocId(null);
    if (!user) return;
    let active = true;
    databases()
      .listDocuments(DB_ID, COL_FAVORITES, [
        Query.equal("userId", user.$id),
        Query.equal("componentId", componentId),
        Query.limit(1),
      ])
      .then((r) => {
        if (!active || touched.current) return;
        if (r.documents.length) {
          setFav(true);
          setDocId(r.documents[0].$id);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, componentId]);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (busy) return;
    touched.current = true;
    setBusy(true);
    try {
      if (fav && docId) {
        await databases().deleteDocument(DB_ID, COL_FAVORITES, docId);
        setFav(false);
        setDocId(null);
        toast("Aus Favoriten entfernt", "info");
      } else {
        const doc = await databases().createDocument(
          DB_ID,
          COL_FAVORITES,
          ID.unique(),
          { userId: user.$id, componentId, createdAt: new Date().toISOString() },
          [Permission.read(Role.user(user.$id)), Permission.delete(Role.user(user.$id))],
        );
        setFav(true);
        setDocId(doc.$id);
        toast("Zu Favoriten hinzugefügt", "success");
      }
    } catch {
      toast("Aktion fehlgeschlagen", "error");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={fav}
        title={fav ? "Aus Favoriten entfernen" : "Zu Favoriten"}
        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-fg-muted transition hover:text-white disabled:opacity-60"
      >
        <Star size={16} className={fav ? "fill-amber-400 text-amber-400" : ""} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={fav}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition disabled:opacity-60 ${
        fav ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/5 text-fg hover:border-white/20"
      }`}
    >
      <Star size={16} className={fav ? "fill-amber-400 text-amber-400" : ""} />
      {fav ? "Gemerkt" : "Merken"}
    </button>
  );
}
