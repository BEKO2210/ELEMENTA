"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, Heart, ArrowRight, Link2, Share2, Check } from "lucide-react";
import { fetchByAuthor, attachLikeCounts } from "@/lib/data";
import { getProfileById } from "@/lib/profile";
import { useToast } from "./Toast";

export default function AuthorCard({
  username,
  authorId,
  title,
}: {
  username: string;
  authorId?: string;
  title: string;
}) {
  const { toast } = useToast();
  const [stats, setStats] = useState<{ count: number; likes: number } | null>(null);
  const [bio, setBio] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetchByAuthor(username)
      .then(attachLikeCounts)
      .then((cs) => {
        if (active) setStats({ count: cs.length, likes: cs.reduce((s, c) => s + c.likes, 0) });
      });
    if (authorId)
      getProfileById(authorId).then((p) => {
        if (!active || !p) return;
        if (p.bio) setBio(p.bio);
        if (p.avatarUrl) setAvatar(p.avatarUrl);
      });
    return () => {
      active = false;
    };
  }, [username, authorId]);

  const initial = username.charAt(0).toUpperCase();

  function shareUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      toast("Link kopiert", "success");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Kopieren fehlgeschlagen", "error");
    }
  }

  function shareX() {
    const text = encodeURIComponent(`${title} — auf Elementa`);
    const url = encodeURIComponent(shareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(shareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener");
  }

  return (
    <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-panel p-6 sm:grid-cols-[1fr_auto] sm:items-center">
      {/* Autor */}
      <div className="flex items-start gap-4">
        <Link
          href={`/u/${encodeURIComponent(username)}`}
          className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl btn-grad text-xl font-extrabold"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </Link>
        <div className="min-w-0">
          <Link href={`/u/${encodeURIComponent(username)}`} className="text-lg font-bold transition hover:text-white">
            @{username}
          </Link>
          {bio && <p className="mt-0.5 line-clamp-2 text-sm text-fg-muted">{bio}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
            <span className="inline-flex items-center gap-1.5">
              <Boxes size={13} className="text-accent" /> {stats ? stats.count : "…"} Komponenten
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart size={13} className="text-rose-400" /> {stats ? stats.likes : "…"} Likes
            </span>
          </div>
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/u/${encodeURIComponent(username)}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-muted transition hover:text-white"
        >
          Profil <ArrowRight size={14} />
        </Link>
        <button onClick={copyLink} title="Link kopieren" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-fg-muted transition hover:text-white">
          {copied ? <Check size={15} className="text-emerald-400" /> : <Link2 size={15} />}
        </button>
        <button onClick={shareX} title="Auf X teilen" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-fg-muted transition hover:text-white">
          <Share2 size={15} />
        </button>
        <button onClick={shareLinkedIn} title="Auf LinkedIn teilen" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-fg-muted transition hover:text-white">
          in
        </button>
      </div>
    </div>
  );
}
