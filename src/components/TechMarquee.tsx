/**
 * Endlos laufende Tech-Leiste unter dem Hero: zeigt, für welche Stacks es
 * Komponenten gibt. Reines CSS-Marquee (pausiert bei Hover / reduced-motion).
 */
const TECHS = [
  { label: "React", color: "#61dafb" },
  { label: "Vue", color: "#42b883" },
  { label: "Svelte", color: "#ff3e00" },
  { label: "Tailwind CSS", color: "#38bdf8" },
  { label: "HTML5", color: "#e34f26" },
  { label: "CSS3", color: "#8b5cf6" },
  { label: "Next.js", color: "#f4f3f8" },
  { label: "TypeScript", color: "#3178c6" },
  { label: "WCAG 2.2", color: "#10b981" },
  { label: "Zero-Dependency", color: "#e879f9" },
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3.5">
      {TECHS.map((t) => (
        <span
          key={t.label}
          className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-5 py-2 text-sm font-medium text-fg-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: t.color, boxShadow: `0 0 10px ${t.color}66` }}
          />
          {t.label}
        </span>
      ))}
    </span>
  );
}

export default function TechMarquee() {
  return (
    <div className="marquee py-2" aria-label="Unterstützte Frameworks und Standards">
      <div className="marquee-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
