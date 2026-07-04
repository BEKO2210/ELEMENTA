"use client";

import { useEffect, useState } from "react";

/**
 * Animiertes Hero-Hintergrundvideo. Wird NUR gerendert, wenn keine reduzierte
 * Bewegung gewünscht ist — reduced-motion-Nutzer (und JS-lose Clients) laden die
 * Videodateien gar nicht erst; sichtbar bleibt das statische Hero-Bild dahinter.
 *
 * Performance: KEIN `poster` (das war die rohe 1,1-MB-PNG und damit das
 * LCP-Element auf Mobil) — als Fallback dient das optimierte <Image> direkt
 * dahinter. Das Video wird zudem erst nach dem ersten Paint (Idle) eingehängt,
 * damit es nicht mit dem LCP um die Bandbreite konkurriert.
 */
type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function HeroVideo() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Erst laden, wenn der Hauptinhalt gepaint ist (Idle-Callback, Fallback Timeout).
    const w = window as IdleWindow;
    const start = () => setPlay(true);
    const handle = w.requestIdleCallback
      ? w.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1500);

    const onChange = () => mq.matches && setPlay(false);
    mq.addEventListener?.("change", onChange);
    return () => {
      mq.removeEventListener?.("change", onChange);
      if (w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);

  if (!play) return null;

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover object-top opacity-90"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src="/brand/hero-loop.webm" type="video/webm" />
      <source src="/brand/hero-loop.mp4" type="video/mp4" />
    </video>
  );
}
