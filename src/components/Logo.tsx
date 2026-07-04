interface MarkProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * Elementa-Markenzeichen: „Der Baustein" — ein isometrischer Würfel aus drei
 * Flächen in den drei Markenfarben, mit leicht abgehobenem Deckel (Explosions-
 * zeichnung). Sinnbild: UI-Elemente, die sich zu Interfaces zusammensetzen.
 * Abstraktes Symbol ohne Buchstaben — funktioniert von 16 px bis Plakat.
 */
export function LogoMark({ size = 36, animated = true, className = "" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="elm-top" x1="10" y1="6" x2="38" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#e879f9" />
        </linearGradient>
        <linearGradient id="elm-left" x1="10" y1="18" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="elm-right" x1="24" y1="18" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Linke Fläche */}
      <path
        d="M10.5 17.5 L23 24.4 V39.5 L10.5 32.6 Z"
        fill="url(#elm-left)"
        stroke="url(#elm-left)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Rechte Fläche */}
      <path
        d="M37.5 17.5 L25 24.4 V39.5 L37.5 32.6 Z"
        fill="url(#elm-right)"
        stroke="url(#elm-right)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Deckel — leicht abgehoben (der „Klick"-Moment des Zusammensetzens) */}
      <path
        className={animated ? "logo-lid" : ""}
        d="M24 6.5 L36.8 13.6 L24 20.7 L11.2 13.6 Z"
        fill="url(#elm-top)"
        stroke="url(#elm-top)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Volles Logo: Mark + animierter Wortmarken-Text. */
export function Logo({
  size = 34,
  animated = true,
  className = "",
}: MarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="logo-tile inline-flex">
        <LogoMark size={size} animated={animated} />
      </span>
      <span className="wordmark-grad font-display text-[1.35rem] font-bold tracking-tight">
        Elementa
      </span>
    </span>
  );
}
