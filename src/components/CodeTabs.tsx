"use client";

import { useState } from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import CopyButton from "./CopyButton";
import type { Framework, UIComponent } from "@/lib/types";

interface Section {
  label: string;
  code: string;
  lang: Language;
}

const FW_LABEL: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  tailwind: "HTML + Tailwind",
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
};

// Prism-Sprache je nach Framework der Hauptsektion.
function mainLang(fw: Framework): Language {
  switch (fw) {
    case "react":
      return "jsx";
    case "vue":
    case "svelte":
    case "tailwind":
    case "html":
      return "markup";
    case "css":
      return "css";
    default:
      return "markup";
  }
}

export default function CodeTabs({ c }: { c: UIComponent }) {
  const sections: Section[] = [];
  sections.push({ label: FW_LABEL[c.framework] ?? "Code", code: c.html, lang: mainLang(c.framework) });
  if (c.css.trim()) sections.push({ label: "CSS", code: c.css, lang: "css" });
  if (c.js.trim()) sections.push({ label: "JS", code: c.js, lang: "javascript" });

  const [active, setActive] = useState(0);
  const current = sections[active];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex gap-1">
          {sections.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActive(i)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                i === active ? "bg-white/10 text-white" : "text-fg-muted hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <CopyButton text={current.code} />
      </div>

      <Highlight theme={themes.vsDark} code={current.code.trimEnd()} language={current.lang}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="max-h-[440px] overflow-auto py-3 text-[13px] leading-relaxed">
            <code className="font-mono text-fg">
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                return (
                  <div key={i} {...lineProps} className={`${lineProps.className ?? ""} flex`}>
                    <span className="sticky left-0 w-12 shrink-0 select-none bg-[#0b0b12] pr-4 text-right text-fg-dim">
                      {i + 1}
                    </span>
                    <span className="pr-5">
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        return <span key={key} {...tokenProps} />;
                      })}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
