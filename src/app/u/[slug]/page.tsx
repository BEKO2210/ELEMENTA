import type { Metadata } from "next";
import { Heart, Boxes, ShieldCheck } from "lucide-react";
import { fetchByAuthor, attachLikeCounts } from "@/lib/data";
import ComponentCard from "@/components/ComponentCard";

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
  const comps = await attachLikeCounts(await fetchByAuthor(username));
  const totalLikes = comps.reduce((s, c) => s + c.likes, 0);
  const verified = comps.filter((c) => c.a11y === "pass").length;
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Profil-Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel p-8">
        <div className="aurora-blob left-0 top-0 h-40 w-72" style={{ background: "#8b5cf6" }} />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.4rem] btn-grad text-3xl font-extrabold">
            {initial}
          </span>
          <div>
            <h1 className="text-3xl font-bold">@{username}</h1>
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
