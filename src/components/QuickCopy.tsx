"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "./Toast";

/**
 * Kompakter Icon-Copy-Button für Komponenten-Karten (immer sichtbar, auch auf Touch).
 * Stoppt die Event-Propagation, damit der umgebende Karten-Link nicht navigiert.
 */
export default function QuickCopy({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else throw new Error("no clipboard");
      setCopied(true);
      toast("Code kopiert", "success");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Kopieren fehlgeschlagen", "error");
    }
  }

  return (
    <button
      onClick={copy}
      aria-label="Code kopieren"
      title="Code kopieren"
      className={`grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/40 text-fg-muted backdrop-blur transition hover:border-white/25 hover:text-white ${className}`}
    >
      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
    </button>
  );
}
