"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Framework } from "@/lib/types";

interface Props {
  framework: Framework;
  html: string;
  css: string;
  js: string;
  height?: number;
  className?: string;
  /** Hintergrund im iframe-Body. "transparent" lässt den Wrapper durchscheinen (Preview-Toggle). */
  bg?: string;
  /** Skaliert zu große Inhalte herunter, damit nichts abgeschnitten wird (Karten-Thumbnails). */
  fit?: boolean;
}

/**
 * Renders untrusted, user-submitted component code inside a hardened iframe.
 *
 * Security model:
 *  - sandbox="allow-scripts" WITHOUT allow-same-origin  → opaque origin:
 *    the code cannot read our DOM, cookies, localStorage or Appwrite session.
 *  - The sandbox document (/sandbox.html) ships its own CSP via next.config.ts
 *    headers: connect-src 'none' blocks exfiltration, script-src erlaubt nur
 *    selbst gehostete Vendor-Bundles (React/Babel/Tailwind/Vue) + Inline-Code.
 *
 * Warum src statt srcDoc: srcdoc-Dokumente ERBEN die CSP der Hauptseite —
 * deren strenge script-src blockierte React/Babel/Tailwind komplett.
 * Ein per src geladenes Dokument bekommt seine eigene (Pfad-)CSP.
 * Der Code wird per postMessage übergeben, sobald die Sandbox "ready" meldet.
 */
export default function SandboxPreview({
  framework,
  html,
  css,
  js,
  height = 260,
  className,
  bg = "#0b0b12",
  fit = false,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);

  const payload = useMemo(
    () => ({ type: "elementa:render", framework, html, css, js, bg, fit }),
    [framework, html, css, js, bg, fit],
  );
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // Handshake: Sandbox meldet "ready" (auch nach einem Reload), dann Code schicken.
  // targetOrigin "*" ist hier korrekt: die Sandbox hat eine opaque origin und der
  // Payload ist ohnehin öffentlicher Komponenten-Code.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const frame = iframeRef.current;
      if (!frame || e.source !== frame.contentWindow) return;
      if (e.data?.type === "elementa:ready") {
        readyRef.current = true;
        frame.contentWindow?.postMessage(payloadRef.current, "*");
      }
    }
    window.addEventListener("message", onMessage);
    // Falls die Sandbox schon geladen ist (Hydration NACH iframe-Load),
    // ging ihr erstes "ready" verloren — direkt einmal proaktiv senden.
    iframeRef.current?.contentWindow?.postMessage(payloadRef.current, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Live-Update bei Prop-Änderungen (z. B. Hintergrund-Toggle, Editor).
  useEffect(() => {
    if (readyRef.current) {
      iframeRef.current?.contentWindow?.postMessage(payload, "*");
    }
  }, [payload]);

  return (
    <iframe
      ref={iframeRef}
      title="Vorschau"
      src="/sandbox.html"
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      loading="lazy"
      className={className}
      style={{ width: "100%", height, border: 0, background: "transparent", display: "block" }}
    />
  );
}
