"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ID, Query, Permission, Role } from "appwrite";
import { databases, DB_ID, COL_LIKES } from "@/lib/appwrite";
import { useAuth } from "./AuthProvider";

export default function LikeButton({
  componentId,
  initialLikes,
}: {
  componentId: string;
  initialLikes: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [count, setCount] = useState(initialLikes);
  const [busy, setBusy] = useState(false);
  // sobald der Nutzer selbst geklickt hat, dürfen die Lade-Abfragen den Zustand nicht mehr überschreiben
  const touchedRef = useRef(false);

  // Globaler Zähler + eigener Like-Status beim Laden.
  useEffect(() => {
    let active = true;
    // Bei Komponentenwechsel (Client-Navigation, gleiche Instanz) Status frisch aufsetzen,
    // sonst zeigt die neue Komponente Like-Status/Zähler der vorherigen.
    touchedRef.current = false;
    setLiked(false);
    setLikeDocId(null);
    setCount(initialLikes);

    // Globaler, für alle Nutzer synchroner Zähler = Anzahl aller Like-Dokumente
    // dieser Komponente (+ Seed-Basiswert für die Optik).
    databases()
      .listDocuments(DB_ID, COL_LIKES, [
        Query.equal("componentId", componentId),
        Query.limit(1),
      ])
      .then((r) => {
        // Nur echte Likes: Anzahl der Like-Dokumente, kein erfundener Basiswert.
        if (active && !touchedRef.current) setCount(r.total);
      })
      .catch(() => {});

    if (user) {
      databases()
        .listDocuments(DB_ID, COL_LIKES, [
          Query.equal("userId", user.$id),
          Query.equal("componentId", componentId),
          Query.limit(1),
        ])
        .then((r) => {
          if (!active || touchedRef.current) return;
          if (r.documents.length) {
            setLiked(true);
            setLikeDocId(r.documents[0].$id);
          }
        })
        .catch(() => {});
    } else {
      setLiked(false);
      setLikeDocId(null);
    }

    return () => {
      active = false;
    };
  }, [user, componentId, initialLikes]);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (busy) return;
    touchedRef.current = true;
    setBusy(true);
    try {
      if (liked && likeDocId) {
        await databases().deleteDocument(DB_ID, COL_LIKES, likeDocId);
        setLiked(false);
        setLikeDocId(null);
        setCount((c) => Math.max(0, c - 1));
      } else {
        const doc = await databases().createDocument(
          DB_ID,
          COL_LIKES,
          ID.unique(),
          { userId: user.$id, componentId, createdAt: new Date().toISOString() },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        );
        setLiked(true);
        setLikeDocId(doc.$id);
        setCount((c) => c + 1);
      }
    } catch {
      /* z. B. schon geliked (unique index) — ignorieren */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition disabled:opacity-60 ${
        liked
          ? "border-rose-400/40 bg-rose-400/10 text-rose-300"
          : "border-white/10 bg-white/5 text-fg hover:border-white/20"
      }`}
    >
      {busy ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <motion.span
          className="inline-flex"
          animate={liked ? { scale: [1, 1.35, 0.92, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Heart size={16} className={liked ? "fill-rose-400 text-rose-400" : ""} />
        </motion.span>
      )}
      {liked ? "Gefällt dir" : "Gefällt mir"}
      <span className="relative inline-flex h-5 min-w-[1ch] items-center justify-center overflow-hidden tabular-nums text-fg-muted">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
