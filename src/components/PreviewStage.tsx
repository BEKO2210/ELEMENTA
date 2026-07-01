"use client";

import { useState } from "react";
import { Moon, Sun, Grid3x3, Blend } from "lucide-react";
import type { Framework } from "@/lib/types";
import SandboxPreview from "./SandboxPreview";

type Mode = "dark" | "light" | "grid" | "transparent";

const MODES: { id: Mode; label: string; icon: typeof Moon; bg: string; wrapper: string }[] = [
  { id: "dark", label: "Dunkel", icon: Moon, bg: "#0b0b12", wrapper: "bg-[#0b0b12]" },
  { id: "light", label: "Hell", icon: Sun, bg: "#ffffff", wrapper: "bg-white" },
  { id: "grid", label: "Raster", icon: Grid3x3, bg: "transparent", wrapper: "checker" },
  { id: "transparent", label: "Transparent", icon: Blend, bg: "transparent", wrapper: "alpha-grid" },
];

export default function PreviewStage({
  framework,
  html,
  css,
  js,
  height = 380,
}: {
  framework: Framework;
  html: string;
  css: string;
  js: string;
  height?: number;
}) {
  const [mode, setMode] = useState<Mode>("dark");
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
          </span>
          <span className="hidden text-xs font-medium text-fg-muted sm:inline">Live-Vorschau</span>
        </span>

        {/* Hintergrund-Toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                title={m.label}
                aria-label={`Hintergrund: ${m.label}`}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition ${
                  active ? "bg-white/10 text-white" : "text-fg-muted hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={current.wrapper}>
        <SandboxPreview
          framework={framework}
          html={html}
          css={css}
          js={js}
          height={height}
          bg={current.bg}
        />
      </div>
    </div>
  );
}
