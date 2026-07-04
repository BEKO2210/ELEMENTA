import type { Metadata } from "next";
import { Heart, Boxes, ShieldCheck } from "lucide-react";
import { fetchByAuthor, attachLikeCounts, DataUnavailableError } from "@/lib/data";
import { getProfileById } from "@/lib/profile";
import ComponentCard from "@/components/ComponentCard";
import DataUnavailable from "@/components/DataUnavailable";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = decodeURIComponent(slug);
  return {
    title: `@${name}`,
    description: `Komponenten von @${name} auf Elementa`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const username = decodeURIComponent(slug);
  let comps;
  try {
    comps = await attachLikeCounts(await fetchByAuthor(username));
  } catch (e) {
    if (e instanceof DataUnavailableError) {
      return <div className="mx-auto max-w-6xl px-5 py-20"><DataUnavailable /></div>;
    }
    throw e;
  }
  const totalLikes = comps.reduce((s, c) => s + c.likes, 0);
  const verified = comps.filter((c) => c.a11y === "pass").length;

  // Avatar/Bio aus dem Profil laden (Profil-Doc-ID = authorId; public read).
  const authorId = comps.find((c) => c.authorId)?.authorId;
  const profile = authorId ? await getProfileById(authorId) : null;
  const displayName = profile?.displayName?.trim() || username;
  const avatarUrl = profile?.avatarUrl?.trim();
  const bio = profile?.bio?.trim();
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Profil-Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel p-8">
        <div className="aurora-blob left-0 top-0 h-40 w-72" style={{ background: "#8b5cf6" }} />
        <div className="relative flex flex-wrap items-center gap-5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={`Profilbild von @${username}`}
              className="h-20 w-20 shrink-0 rounded-[1.4rem] object-cover"
            />
          ) : (
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.4rem] btn-grad text-3xl font-extrabold">
              {initial}
            </span>
          )}
          <div>
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-sm text-fg-dim">@{username}</p>
            {bio && <p className="mt-2 max-w-md text-sm text-fg-muted">{bio}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <Boxes size={15} className="text-accent" /> {comps.length} Komponenten
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart size={15} className="text-rose-400" /> {totalLikes} Likes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-400" /> {verified} WCAG-geprüft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Komponenten */}
      <h2 className="mb-5 mt-10 text-xl font-bold">Komponenten</h2>
      {comps.length === 0 ? (
        <p className="rounded-2xl border border-white/10 py-20 text-center text-fg-muted">
          @{username} hat noch keine Komponenten veröffentlicht.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {comps.map((c) => (
            <ComponentCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
