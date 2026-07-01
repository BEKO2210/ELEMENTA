"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil, Loader2, LockKeyhole } from "lucide-react";
import { fetchComponent } from "@/lib/data";
import type { UIComponent } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import ComponentForm from "@/components/ComponentForm";

export default function EditComponentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user, loading: authLoading } = useAuth();

  const [comp, setComp] = useState<UIComponent | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetchComponent(slug).then((c) => {
      if (active) setComp(c ?? null);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (authLoading || comp === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center text-fg-muted">
        <Loader2 className="mx-auto animate-spin" /> <span className="mt-3 block">Lädt …</span>
      </div>
    );
  }

  const notAllowed = !user || !comp || !comp.authorId || comp.authorId !== user.$id;

  if (notAllowed) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-fg-muted">
          <LockKeyhole size={24} />
        </span>
        <h1 className="mt-6 text-2xl font-bold">Kein Zugriff</h1>
        <p className="mx-auto mt-3 max-w-sm text-fg-muted">
          {!user
            ? "Bitte melde dich an, um deine Komponenten zu bearbeiten."
            : "Du kannst nur deine eigenen Komponenten bearbeiten."}
        </p>
        <Link href={comp ? `/c/${comp.slug}` : "/explore"} className="btn-grad mt-6 inline-flex rounded-xl px-6 py-3">
          Zurück
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl btn-grad">
          <Pencil size={19} />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Komponente bearbeiten</h1>
          <p className="mt-0.5 text-fg-muted">
            Du bearbeitest <span className="text-fg">{comp!.title}</span>.
          </p>
        </div>
      </div>

      <ComponentForm user={user!} mode="edit" initial={comp!} />
    </div>
  );
}
