"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ID, Query, Permission, Role } from "appwrite";
import { MessageSquare, ThumbsUp, Trash2, Loader2, Send } from "lucide-react";
import { databases, DB_ID, COL_COMMENTS, COL_COMMENT_HELPFUL } from "@/lib/appwrite";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

interface Comment {
  id: string;
  userId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Comments({ componentId }: { componentId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    // Bei Komponentenwechsel Ladezustand zurücksetzen, sonst bleiben kurz die
    // Kommentare der vorherigen Komponente sichtbar.
    setLoading(true);
    setComments([]);
    setCounts({});
    setMyVotes({});
    databases()
      .listDocuments(DB_ID, COL_COMMENTS, [
        Query.equal("componentId", componentId),
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ])
      .then(async (r) => {
        if (!active) return;
        const list: Comment[] = r.documents.map((d: any) => ({
          id: d.$id,
          userId: d.userId,
          authorUsername: d.authorUsername || "anon",
          body: d.body,
          createdAt: d.createdAt || d.$createdAt,
        }));
        setComments(list);
        setLoading(false);

        const ids = list.map((c) => c.id);
        if (ids.length) {
          const hv = await databases()
            .listDocuments(DB_ID, COL_COMMENT_HELPFUL, [Query.equal("commentId", ids), Query.limit(1000)])
            .catch(() => null);
          if (hv && active) {
            const cnt: Record<string, number> = {};
            const mine: Record<string, string> = {};
            hv.documents.forEach((d: any) => {
              cnt[d.commentId] = (cnt[d.commentId] || 0) + 1;
              if (user && d.userId === user.$id) mine[d.commentId] = d.$id;
            });
            setCounts(cnt);
            setMyVotes(mine);
          }
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [componentId, user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const doc = await databases().createDocument(
        DB_ID,
        COL_COMMENTS,
        ID.unique(),
        {
          componentId,
          userId: user.$id,
          authorUsername: user.name || "anon",
          body: body.trim(),
          createdAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      );
      setComments((c) => [
        { id: doc.$id, userId: user.$id, authorUsername: user.name || "anon", body: body.trim(), createdAt: new Date().toISOString() },
        ...c,
      ]);
      setBody("");
      toast("Kommentar veröffentlicht", "success");
    } catch {
      toast("Kommentar fehlgeschlagen", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function del(id: string) {
    try {
      await databases().deleteDocument(DB_ID, COL_COMMENTS, id);
      setComments((c) => c.filter((x) => x.id !== id));
      toast("Kommentar gelöscht", "info");
    } catch {
      toast("Löschen fehlgeschlagen", "error");
    }
  }

  async function toggleHelpful(commentId: string) {
    if (!user) return router.push("/login");
    const mineId = myVotes[commentId];
    try {
      if (mineId) {
        await databases().deleteDocument(DB_ID, COL_COMMENT_HELPFUL, mineId);
        setMyVotes((m) => {
          const n = { ...m };
          delete n[commentId];
          return n;
        });
        setCounts((c) => ({ ...c, [commentId]: Math.max(0, (c[commentId] || 1) - 1) }));
      } else {
        const doc = await databases().createDocument(
          DB_ID,
          COL_COMMENT_HELPFUL,
          ID.unique(),
          { userId: user.$id, commentId, createdAt: new Date().toISOString() },
          [Permission.read(Role.any()), Permission.delete(Role.user(user.$id))],
        );
        setMyVotes((m) => ({ ...m, [commentId]: doc.$id }));
        setCounts((c) => ({ ...c, [commentId]: (c[commentId] || 0) + 1 }));
      }
    } catch {
      toast("Aktion fehlgeschlagen", "error");
    }
  }

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <MessageSquare size={18} className="text-accent" />
        Kommentare {comments.length > 0 && <span className="text-fg-muted">({comments.length})</span>}
      </h2>

      {/* Neuer Kommentar */}
      {user ? (
        <form onSubmit={submit} className="mt-4 flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full btn-grad text-sm font-bold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Schreib etwas Nettes oder Hilfreiches …"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent/50"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="btn-grad inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Kommentieren
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-muted">
          <Link href="/login" className="text-[#a78bfa] underline decoration-[#a78bfa]/40 underline-offset-2 transition hover:decoration-[#a78bfa]">Melde dich an</Link>, um zu kommentieren.
        </p>
      )}

      {/* Liste */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-fg-muted"><Loader2 className="mx-auto animate-spin" /></p>
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-fg-muted">Noch keine Kommentare — sei die/der Erste!</p>
        ) : (
          comments.map((c) => {
            const voted = Boolean(myVotes[c.id]);
            return (
              <div key={c.id} className="flex gap-3">
                <Link
                  href={`/u/${encodeURIComponent(c.authorUsername)}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold transition hover:border-accent/40"
                >
                  {c.authorUsername.charAt(0).toUpperCase()}
                </Link>
                <div className="flex-1 rounded-2xl border border-white/10 bg-panel px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/u/${encodeURIComponent(c.authorUsername)}`} className="text-sm font-semibold transition hover:text-white">
                      @{c.authorUsername}
                    </Link>
                    <span className="text-xs text-fg-dim">{c.createdAt?.slice(0, 10)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-fg-muted">{c.body}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => toggleHelpful(c.id)}
                      className={`inline-flex items-center gap-1.5 text-xs transition ${
                        voted ? "text-accent" : "text-fg-dim hover:text-fg"
                      }`}
                    >
                      <ThumbsUp size={13} className={voted ? "fill-current" : ""} />
                      Hilfreich {counts[c.id] ? `(${counts[c.id]})` : ""}
                    </button>
                    {user && c.userId === user.$id && (
                      <button onClick={() => del(c.id)} className="inline-flex items-center gap-1 text-xs text-fg-dim transition hover:text-red-300">
                        <Trash2 size={13} /> Löschen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
