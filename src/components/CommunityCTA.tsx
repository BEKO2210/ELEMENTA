import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteStats } from "@/lib/data";
import { Reveal } from "./Motion";

/** Ehrlicher Community-CTA — konkrete Stats statt unbewiesener Superlative. */
export default function CommunityCTA({ stats }: { stats: SiteStats }) {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-5">
      <Reveal className="glass relative overflow-hidden rounded-3xl px-8 py-14 text-center">
        <div className="aurora-blob left-1/2 top-0 h-52 w-96 -translate-x-1/2" style={{ background: "#8b5cf6" }} />
        <h2 className="relative text-3xl font-bold sm:text-4xl">
          Teile deine <span className="gradient-text">UI-Komponenten</span> mit der Community
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-fg-muted">
          Jede Komponente, die du hochlädst, wird von anderen Entwicklern entdeckt und
          genutzt. Werde als Experte sichtbar.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/submit" className="btn-grad inline-flex items-center gap-2 rounded-xl px-6 py-3">
            Jetzt beitragen <ArrowRight size={18} />
          </Link>
          <Link
            href="/docs/contribute"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-fg-muted transition hover:border-white/20 hover:text-white"
          >
            Contributor-Guidelines
          </Link>
        </div>
        <p className="relative mt-6 text-sm text-fg-muted">
          Bereits {stats.contributors} Contributor · {stats.components} Komponenten · {stats.likes} Likes
        </p>
      </Reveal>
    </section>
  );
}
