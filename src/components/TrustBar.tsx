import { Boxes, Users, Heart, Layers } from "lucide-react";
import type { SiteStats } from "@/lib/data";
import CountUp from "./CountUp";

/** Social-Proof-Leiste mit dynamischen Kennzahlen aus der Datenbank. */
export default function TrustBar({ stats }: { stats: SiteStats }) {
  const items = [
    { icon: Boxes, value: stats.components, suffix: "+", label: "Komponenten" },
    { icon: Users, value: stats.contributors, suffix: "", label: "Contributors" },
    { icon: Heart, value: stats.likes, suffix: "", label: "Likes gesamt" },
    { icon: Layers, value: stats.frameworks, suffix: "", label: "Frameworks" },
  ];

  return (
    <dl className="glass grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center gap-1 bg-white/[0.015] px-4 py-6 text-center">
          <it.icon size={18} className="text-accent" aria-hidden="true" />
          <dd className="text-2xl font-bold text-fg">
            <CountUp value={it.value} suffix={it.suffix} />
          </dd>
          <dt className="text-xs text-fg-muted">{it.label}</dt>
        </div>
      ))}
    </dl>
  );
}
