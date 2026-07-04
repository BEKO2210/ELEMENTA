"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import type { UIComponent } from "@/lib/types";
import CodeTabs from "./CodeTabs";
import CopyButton from "./CopyButton";

const FRAMEWORK_TABS = [
  { key: "html", label: "HTML/CSS" },
  { key: "tailwind", label: "Tailwind" },
  { key: "react", label: "React" },
  { key: "vue", label: "Vue" },
  { key: "svelte", label: "Svelte" },
] as const;

/**
 * Framework-Umschalter über dem Code: die native Sprache der Komponente zeigt den
 * echten, kopierbaren Code (via CodeTabs). Andere Frameworks sind als „Bald verfügbar"
 * markiert — wir zeigen bewusst keinen automatisch konvertierten, ungeprüften Code.
 */
export default function CodeSection({ c }: { c: UIComponent }) {
  const nativeKey = c.framework === "css" ? "html" : c.framework;
  const [active, setActive] = useState<string>(nativeKey);
  const isNative = active === nativeKey;
  const original = [c.html, c.css && `\n<style>\n${c.css}\n</style>`].filter(Boolean).join("");

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Framework auswählen">
        {FRAMEWORK_TABS.map((t) => {
          const available = t.key === nativeKey;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                active === t.key
                  ? "border-accent/50 bg-accent/10 text-white"
                  : "border-white/10 bg-white/5 text-fg-muted hover:text-white"
              }`}
            >
              {t.label}
              {!available && (
                <span className="inline-flex items-center gap-0.5 rounded bg-white/10 px-1 py-px text-[10px] text-fg-muted">
                  <Clock size={9} aria-hidden="true" /> Bald
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isNative ? (
        <CodeTabs c={c} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0b0b12] p-8 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-accent">
            <Clock size={20} />
          </span>
          <p className="mt-4 font-medium text-fg">
            {FRAMEWORK_TABS.find((t) => t.key === active)?.label}-Version folgt in Kürze
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
            Wir portieren Komponenten schrittweise und geprüft. In der Zwischenzeit kannst du
            die Originalversion ({FRAMEWORK_TABS.find((t) => t.key === nativeKey)?.label}) kopieren.
          </p>
          <div className="mt-5 flex justify-center">
            <CopyButton text={original} label="Original kopieren" />
          </div>
        </div>
      )}
    </div>
  );
}
