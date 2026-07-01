interface MarkProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * Elementa-Markenzeichen: eine Verlaufs-Kachel mit drei gestapelten „Element"-Balken
 * (Sinnbild für Komponenten/Bausteine). Balken pulsieren gestaffelt, die Kachel schwebt sanft.
 */
export function LogoMark({ size = 36, animated = true, className = "" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`${animated ? "logo-anim" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="el-g" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="0.5" stopColor="#d946ef" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <clipPath id="el-clip">
          <rect width="40" height="40" rx="11" />
        </clipPath>
      </defs>
      <g clipPath="url(#el-clip)">
        <rect width="40" height="40" rx="11" fill="url(#el-g)" />
        <rect className={animated ? "logo-bar-1" : ""} x="10" y="11" width="20" height="4.4" rx="2.2" fill="#0b0b0e" opacity="0.9" />
        <rect className={animated ? "logo-bar-2" : ""} x="10" y="17.8" width="12.5" height="4.4" rx="2.2" fill="#0b0b0e" opacity="0.9" />
        <rect className={animated ? "logo-bar-3" : ""} x="10" y="24.6" width="16.5" height="4.4" rx="2.2" fill="#0b0b0e" opacity="0.9" />
      </g>
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
      <span className="wordmark-grad text-[1.35rem] font-extrabold tracking-tight">
        Elementa
      </span>
    </span>
  );
}
