"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { useToast } from "./Toast";

export default function CopyButton({
  text,
  label = "Code kopieren",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const { toast } = useToast();

  async function copy() {
    setFailed(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback für unsichere (http) Kontexte, wo die Clipboard-API fehlt
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("copy failed");
      }
      setCopied(true);
      toast("In die Zwischenablage kopiert", "success");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setFailed(true);
      toast("Kopieren fehlgeschlagen", "error");
      setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
        failed
          ? "border-red-400/30 bg-red-400/5 text-red-300"
          : "border-white/10 bg-white/5 text-fg-muted hover:border-white/20 hover:text-white"
      } ${className}`}
    >
      {failed ? (
        <X size={15} className="text-red-400" />
      ) : copied ? (
        <Check size={15} className="text-emerald-400" />
      ) : (
        <Copy size={15} />
      )}
      {failed ? "Fehlgeschlagen" : copied ? "Kopiert!" : label}
    </button>
  );
}
