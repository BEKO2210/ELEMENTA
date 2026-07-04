"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Zählt beim Sichtbarwerden von 0 auf `value` hoch. Der Endwert wird SOFORT
 * gerendert (SSR + erster Client-Paint), damit nie ein falsches „0" erscheint,
 * wenn das Element schon im Viewport ist oder der InView übersprungen wird (T8).
 * Nur wenn das Element beim Laden UNTERHALB des Viewports liegt, wird auf 0
 * gesetzt und beim Reinscrollen hochgezählt. prefers-reduced-motion → sofort Endwert.
 */
export default function CountUp({
  value,
  duration = 1100,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  // Endwert als Startzustand → korrekte Zahl ab dem ersten Render (kein „0").
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    // Schon (teilweise) sichtbar oder oberhalb? Dann echte Zahl zeigen, nicht auf 0.
    const rect = el.getBoundingClientRect();
    const belowFold = rect.top >= window.innerHeight;
    if (!belowFold) {
      setDisplay(value);
      return;
    }

    // Nur wenn das Element unterhalb liegt: auf 0 und beim Reinscrollen hochzählen.
    setDisplay(0);
    started.current = false;
    let rafId = 0;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(value * eased);
            if (p < 1) rafId = requestAnimationFrame(tick);
            else setDisplay(value);
          };
          rafId = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("de-DE");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
