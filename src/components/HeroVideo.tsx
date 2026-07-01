"use client";

import { useEffect, useState } from "react";

/**
 * Animiertes Hero-Hintergrundvideo. Wird NUR gerendert, wenn keine reduzierte
 * Bewegung gewünscht ist — so laden reduced-motion-Nutzer (und JS-lose Clients)
 * die Videodateien gar nicht erst; sichtbar bleibt das statische Poster-Bild.
 */
export default function HeroVideo() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlay(!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  if (!play) return null;

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover object-top opacity-90"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/brand/hero-aurora.png"
      aria-hidden="true"
    >
      <source src="/brand/hero-loop.webm" type="video/webm" />
      <source src="/brand/hero-loop.mp4" type="video/mp4" />
    </video>
  );
}
