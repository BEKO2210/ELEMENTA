"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes, Heart, ShieldCheck, Pencil, Trash2, Plus, LogOut, Loader2,
  User, Settings, ExternalLink, LogIn, Star, ImagePlus,
} from "lucide-react";
import { Query, ID, Permission, Role } from "appwrite";
import {
  account, databases, storage, DB_ID, COL_COMPONENTS, COL_FAVORITES,
  BUCKET_AVATARS, fileViewUrl,
} from "@/lib/appwrite";
import { fetchByAuthorId, fetchComponents, attachLikeCounts } from "@/lib/data";
import { getProfileById, saveMyProfile } from "@/lib/profile";
import type { UIComponent } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import ComponentCard from "@/components/ComponentCard";
import PasswordInput from "@/components/PasswordInput";
import { CATEGORIES } from "@/lib/mock-data";

const FW_LABEL: Record<string, string> = {
  html: "HTML", css: "CSS", tailwind: "Tailwind", react: "React", vue: "Vue", svelte: "Svelte",
};

export default function ProfilPage() {
  const { user, loading, logout, refresh } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [tab, setTab] = useState<"comps" | "favs" | "settings">("comps");
  const [comps, setComps] = useState<UIComponent[] | null>(null);
  const [favs, setFavs] = useState<UIComponent[] | null>(null);
  const [toDelete, setToDelete] = useState<UIComponent | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // Settings-Felder
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const profileLoadedRef = useRef(false);
  const [email, setEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name ?? "");
    setEmail(user.email ?? "");
    fetchByAuthorId(user.$id).then(attachLikeCounts).then(setComps);
    getProfileById(user.$id).then((p) => {
      profileLoadedRef.current = true;
      if (p) {
        setBio(p.bio);
        if (p.displayName) setDisplayName(p.displayName);
        if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
      }
    });
    // Favoriten: fav-Dokumente → componentIds → passende Komponenten
    (async () => {
      try {
        const r = await databases().listDocuments(DB_ID, COL_FAVORITES, [
          Query.equal("userId", user.$id),
          Query.limit(100),
        ]);
        const ids = new Set(
          r.documents.map((d) => (d as unknown as { componentId: string }).componentId),
        );
        if (ids.size === 0) return setFavs([]);
        const all = await fetchComponents();
        setFavs(await attachLikeCounts(all.filter((c) => ids.has(c.id))));
      } catch {
        setFavs([]);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center text-fg-muted">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl btn-grad">
          <LogIn size={24} />
        </span>
        <h1 className="mt-6 text-2xl font-bold">Bitte melde dich an</h1>
        <p className="mx-auto mt-3 max-w-sm text-fg-muted">
          Dein Profil und deine Komponenten siehst du nach dem Login.
        </p>
        <Link href="/login" className="btn-grad mt-6 inline-flex rounded-xl px-6 py-3">
          Anmelden / Registrieren
        </Link>
      </div>
    );
  }

  const initial = (displayName || user.email).charAt(0).toUpperCase();
  const totalLikes = comps?.reduce((s, c) => s + c.likes, 0) ?? 0;
  const verified = comps?.filter((c) => c.a11y === "pass").length ?? 0;

  async function doDelete() {
    if (!toDelete) return;
    const c = toDelete;
    setToDelete(null);
    try {
      await databases().deleteDocument(DB_ID, COL_COMPONENTS, c.id);
      setComps((list) => (list ? list.filter((x) => x.id !== c.id) : list));
      toast(`„${c.title}" gelöscht`, "success");
    } catch {
      toast("Löschen fehlgeschlagen", "error");
    }
  }

  async function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("Bild ist zu groß (max. 5 MB)", "error");
      return;
    }
    setUploadingAvatar(true);
    try {
      const created = await storage().createFile(
        BUCKET_AVATARS,
        ID.unique(),
        file,
        [Permission.read(Role.any()), Permission.delete(Role.user(user.$id))],
      );
      const url = fileViewUrl(BUCKET_AVATARS, created.$id);
      setAvatarUrl(url);
      // Race vermeiden: falls das Profil noch nicht geladen ist, bestehende Werte
      // frisch holen, damit der Avatar-Save Bio/Anzeigename nicht mit "" überschreibt.
      let nextBio = bio.trim();
      let nextName = displayName.trim();
      if (!profileLoadedRef.current) {
        const existing = await getProfileById(user.$id);
        nextBio = (existing?.bio ?? "").trim();
        nextName = (existing?.displayName || user.name || "").trim();
      }
      await saveMyProfile(user, { bio: nextBio, displayName: nextName, avatarUrl: url });
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: url }));
      toast("Profilbild aktualisiert", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload fehlgeschlagen", "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingGeneral(true);
    try {
      if (displayName.trim() && displayName.trim() !== user.name) {
        await account().updateName(displayName.trim());
      }
      await saveMyProfile({ ...user, name: displayName.trim() || user.name }, {
        bio: bio.trim(),
        displayName: displayName.trim(),
        avatarUrl,
      });
      await refresh();
      toast("Profil aktualisiert", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Speichern fehlgeschlagen", "error");
    } finally {
      setSavingGeneral(false);
    }
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await account().updateEmail(email.trim(), emailPw);
      await refresh();
      setEmailPw("");
      toast("E-Mail geändert", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "E-Mail-Änderung fehlgeschlagen", "error");
    } finally {
      setSavingEmail(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 8) {
      toast("Neues Passwort braucht mind. 8 Zeichen", "error");
      return;
    }
    setSavingPw(true);
    try {
      await account().updatePassword(newPw, oldPw);
      setOldPw("");
      setNewPw("");
      toast("Passwort geändert", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Passwort-Änderung fehlgeschlagen", "error");
    } finally {
      setSavingPw(false);
    }
  }

  async function deactivate() {
    setDeactivateOpen(false);
    try {
      await account().updateStatus();
      toast("Konto deaktiviert", "success");
      await logout();
      router.push("/");
    } catch {
      toast("Deaktivieren fehlgeschlagen", "error");
    }
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent/50";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel p-8">
        <div className="aurora-blob left-0 top-0 h-40 w-72" style={{ background: "#8b5cf6" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-20 w-20 shrink-0 rounded-[1.4rem] object-cover" />
            ) : (
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.4rem] btn-grad text-3xl font-extrabold">
                {initial}
              </span>
            )}
            <div>
              <h1 className="text-3xl font-bold">{displayName || "Mein Profil"}</h1>
              <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Boxes size={15} className="text-accent" /> {comps?.length ?? "…"} Komponenten
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Heart size={15} className="text-rose-400" /> {totalLikes} Likes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-400" /> {verified} WCAG
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/u/${encodeURIComponent(user.name || "anon")}`} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-muted transition hover:text-white">
              <ExternalLink size={15} /> Öffentlich
            </Link>
            <button onClick={async () => { await logout(); router.push("/"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-muted transition hover:text-white">
              <LogOut size={15} /> Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Tabs — auf Mobile horizontal scrollbar statt Seiten-Overflow */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-white/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabBtn active={tab === "comps"} onClick={() => setTab("comps")} icon={<User size={15} />}>
          Meine Komponenten
        </TabBtn>
        <TabBtn active={tab === "favs"} onClick={() => setTab("favs")} icon={<Star size={15} />}>
          Favoriten
        </TabBtn>
        <TabBtn active={tab === "settings"} onClick={() => setTab("settings")} icon={<Settings size={15} />}>
          Einstellungen
        </TabBtn>
      </div>

      {/* Meine Komponenten */}
      {tab === "comps" && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Meine Komponenten</h2>
            <Link href="/submit" className="btn-grad inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm">
              <Plus size={16} /> Neue Komponente
            </Link>
          </div>

          {comps === null ? (
            <p className="py-16 text-center text-fg-muted"><Loader2 className="mx-auto animate-spin" /></p>
          ) : comps.length === 0 ? (
            <div className="rounded-2xl border border-white/10 py-16 text-center">
              <p className="text-fg-muted">Du hast noch keine Komponenten hochgeladen.</p>
              <Link href="/submit" className="btn-grad mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm">
                <Plus size={16} /> Jetzt erste hochladen
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {comps.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-panel p-4">
                  <div className="min-w-0">
                    <Link href={`/c/${c.slug}`} className="font-semibold transition hover:text-white">
                      {c.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                      <span className="rounded-md border border-white/10 px-1.5 py-0.5">{FW_LABEL[c.framework] ?? c.framework}</span>
                      <span>{CATEGORIES.find((x) => x.slug === c.category)?.label ?? c.category}</span>
                      <span className="inline-flex items-center gap-1"><Heart size={12} /> {c.likes}</span>
                      {c.a11y === "pass" && <span className="inline-flex items-center gap-1 text-emerald-400/90"><ShieldCheck size={12} /> WCAG</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/c/${c.slug}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-fg-muted transition hover:text-white">
                      <Pencil size={14} /> Bearbeiten
                    </Link>
                    <button onClick={() => setToDelete(c)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-400/10">
                      <Trash2 size={14} /> Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favoriten */}
      {tab === "favs" && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">Favoriten</h2>
          {favs === null ? (
            <p className="py-16 text-center text-fg-muted"><Loader2 className="mx-auto animate-spin" /></p>
          ) : favs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 py-16 text-center">
              <Star className="mx-auto text-fg-dim" />
              <p className="mt-3 text-fg-muted">Noch keine Favoriten. Merke dir Komponenten mit dem Stern-Button.</p>
              <Link href="/explore" className="btn-grad mt-5 inline-flex rounded-xl px-5 py-2.5 text-sm">
                Komponenten entdecken
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favs.map((c) => (
                <ComponentCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Einstellungen */}
      {tab === "settings" && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Profil */}
          <form onSubmit={saveGeneral} className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Profil</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl btn-grad text-2xl font-extrabold">
                  {initial}
                </span>
              )}
              <div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={onAvatarFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg-muted transition hover:text-white disabled:opacity-60"
                >
                  {uploadingAvatar ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  Profilbild wählen
                </button>
                <p className="mt-1 text-xs text-fg-dim">PNG/JPG/WebP, max. 5 MB.</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-fg-muted">Anzeigename</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={field} placeholder="Dein Name" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-fg-muted">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={field} placeholder="Frontend-Dev aus Stuttgart …" />
            </div>
            <button type="submit" disabled={savingGeneral} className="btn-grad inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60">
              {savingGeneral && <Loader2 size={15} className="animate-spin" />} Profil speichern
            </button>
          </form>

          {/* E-Mail */}
          <form onSubmit={changeEmail} className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-bold">E-Mail ändern</h2>
            <div>
              <label className="mb-1 block text-sm text-fg-muted">Neue E-Mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-fg-muted">Aktuelles Passwort (zur Bestätigung)</label>
              <PasswordInput value={emailPw} onChange={(e) => setEmailPw(e.target.value)} autoComplete="current-password" className={field} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={savingEmail} className="btn-grad inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60">
              {savingEmail && <Loader2 size={15} className="animate-spin" />} E-Mail aktualisieren
            </button>
          </form>

          {/* Passwort */}
          <form onSubmit={changePassword} className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Passwort ändern</h2>
            <div>
              <label className="mb-1 block text-sm text-fg-muted">Aktuelles Passwort</label>
              <PasswordInput value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" className={field} placeholder="••••••••" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-fg-muted">Neues Passwort (mind. 8 Zeichen)</label>
              <PasswordInput value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" className={field} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={savingPw} className="btn-grad inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60">
              {savingPw && <Loader2 size={15} className="animate-spin" />} Passwort aktualisieren
            </button>
          </form>

          {/* Gefahrenzone */}
          <div className="space-y-4 rounded-2xl border border-red-400/20 bg-red-400/[0.03] p-6">
            <h2 className="text-lg font-bold text-red-300">Gefahrenzone</h2>
            <p className="text-sm text-fg-muted">
              Deaktiviert dein Konto. Du wirst abgemeldet und kannst dich nicht mehr einloggen.
              Deine bereits veröffentlichten Komponenten bleiben online.
            </p>
            <button onClick={() => setDeactivateOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
              <Trash2 size={15} /> Konto deaktivieren
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        danger
        title="Komponente löschen?"
        message={toDelete ? `„${toDelete.title}" wird dauerhaft entfernt. Das kann nicht rückgängig gemacht werden.` : ""}
        confirmLabel="Endgültig löschen"
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
      <ConfirmDialog
        open={deactivateOpen}
        danger
        title="Konto deaktivieren?"
        message="Du wirst sofort abgemeldet und kannst dich mit diesem Konto nicht mehr anmelden."
        confirmLabel="Konto deaktivieren"
        onConfirm={deactivate}
        onCancel={() => setDeactivateOpen(false)}
      />
    </div>
  );
}

function TabBtn({
  active, onClick, icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        active ? "border-accent text-white" : "border-transparent text-fg-muted hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
