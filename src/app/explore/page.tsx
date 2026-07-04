import { Suspense } from "react";
import type { Metadata } from "next";
import ExploreClient from "@/components/ExploreClient";
import DataUnavailable from "@/components/DataUnavailable";
import { fetchComponents, attachLikeCounts, DataUnavailableError } from "@/lib/data";

// Immer frisch aus der DB rendern, damit neue Uploads sofort erscheinen.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Komponenten entdecken",
  description:
    "Durchstöbere effektreiche UI-Komponenten — filtern nach Kategorie und Framework, live ansehen und kopieren.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Komponenten entdecken · Elementa",
    description:
      "Durchstöbere effektreiche UI-Komponenten — filtern nach Kategorie und Framework, live ansehen und kopieren.",
    type: "website",
    url: "/explore",
    images: [{ url: "/brand/og-default.png", width: 1376, height: 768 }],
  },
};

export default async function ExplorePage() {
  let components;
  try {
    components = await attachLikeCounts(await fetchComponents());
  } catch (e) {
    if (e instanceof DataUnavailableError) {
      return <div className="mx-auto max-w-6xl px-5 py-20"><DataUnavailable /></div>;
    }
    throw e;
  }
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-5 py-20 text-fg-muted">Lädt …</div>}>
      <ExploreClient components={components} />
    </Suspense>
  );
}
