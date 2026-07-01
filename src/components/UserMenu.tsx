"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { getProfileById } from "@/lib/profile";

export default function UserMenu() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!user) {
      setAvatar("");
      return;
    }
    getProfileById(user.$id).then((p) => p?.avatarUrl && setAvatar(p.avatarUrl));
    // Live-Update, wenn im Profil ein neues Bild hochgeladen wird
    function onAvatar(e: Event) {
      const url = (e as CustomEvent).detail;
      if (typeof url === "string") setAvatar(url);
    }
    window.addEventListener("avatar-updated", onAvatar);
    return () => window.removeEventListener("avatar-updated", onAvatar);
  }, [user]);

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-white/5" />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition hover:text-white"
        >
          Anmelden
        </Link>
        <Link href="/submit" className="btn-grad rounded-lg px-4 py-1.5 text-sm">
          Hochladen
        </Link>
      </>
    );
  }

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Link href="/submit" className="btn-grad rounded-lg px-4 py-1.5 text-sm">
        Hochladen
      </Link>
      <Link
        href="/profil"
        title="Mein Profil"
        aria-label="Mein Profil"
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-sm font-semibold transition hover:border-accent/40 hover:text-white"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </Link>
      <button
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        title="Abmelden"
        aria-label="Abmelden"
        className="grid h-8 w-8 place-items-center rounded-lg text-fg-muted transition hover:text-white"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
