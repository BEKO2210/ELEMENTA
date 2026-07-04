import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { GithubIcon } from "@/components/BrandIcons";

export const metadata: Metadata = {
  title: "Lizenz (MIT)",
  description:
    "Elementa und alle geteilten Komponenten stehen unter der MIT-Lizenz — frei für kommerzielle und private Nutzung.",
  alternates: { canonical: "/lizenz" },
};

const YES = ["Kommerzielle Nutzung", "Modifikation", "Verteilung", "Private Nutzung"];
const NO = ["Keine Haftung", "Keine Garantie"];

export default function LizenzPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 text-[15px] leading-relaxed">
      <h1 className="text-3xl font-bold sm:text-4xl">MIT-Lizenz</h1>
      <p className="mt-3 text-fg-muted">
        Elementa und alle hier veröffentlichten Komponenten stehen unter der MIT-Lizenz —
        einer der freiesten Open-Source-Lizenzen. Kurz gesagt: Du darfst den Code frei
        verwenden, anpassen und weitergeben.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-fg">Das darfst du</h2>
          <ul className="mt-3 space-y-2">
            {YES.map((t) => (
              <li key={t} className="flex items-center gap-2 text-fg-muted">
                <Check size={16} className="shrink-0 text-emerald-400" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-fg">Ausschlüsse</h2>
          <ul className="mt-3 space-y-2">
            {NO.map((t) => (
              <li key={t} className="flex items-center gap-2 text-fg-muted">
                <X size={16} className="shrink-0 text-red-400" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-fg">Voller Lizenztext</h2>
      <pre className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-[#0b0b12] p-5 font-mono text-[13px] leading-relaxed text-fg-muted">
{`MIT License

Copyright (c) 2026 Belkis Aslani und die Elementa-Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
      </pre>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href="https://github.com/BEKO2210/ELEMENTA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:border-white/20 hover:text-white"
        >
          <GithubIcon size={16} /> Quellcode auf GitHub
        </a>
        <Link
          href="/docs/contribute"
          className="text-sm text-accent underline decoration-white/30 underline-offset-4 transition hover:decoration-accent"
        >
          Contributor-Guidelines ansehen
        </Link>
      </div>
    </div>
  );
}
