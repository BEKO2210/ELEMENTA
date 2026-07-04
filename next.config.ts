import type { NextConfig } from "next";

// Content-Security-Policy für die Hauptseite (nicht für die Sandbox-iframes — die haben
// ihre eigene, strengere CSP im srcdoc). 'unsafe-inline' bei script/style ist für Next.js-
// Hydration bzw. Tailwind v4 nötig; connect-src erlaubt die Appwrite-API.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self' https://appwrite.it-handwerk-stuttgart.de",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Eigene, bewusst andere CSP für das Sandbox-Dokument (/sandbox.html):
// srcdoc-iframes erben die Haupt-CSP (und die blockierte React/Babel/Tailwind),
// deshalb läuft die Vorschau als eigenes Dokument mit dieser Pfad-CSP.
// 'unsafe-eval' ist nötig für Babel-Standalone & Tailwind-Play; Skripte kommen
// ausschließlich von 'self' (/vendor/*). connect-src 'none' verhindert Exfiltration.
const sandboxCsp = [
  "default-src 'none'",
  // blob: für Svelte — die im Browser kompilierten Komponenten laden als Blob-ES-Module
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
  "style-src 'unsafe-inline'",
  "img-src data:",
  "font-src data:",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Performance: kein Verrat des Frameworks + moderne Bildformate (AVIF/WebP).
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      // Muss NACH dem Catch-all stehen: gleicher Header-Key → letzter gewinnt.
      {
        source: "/sandbox.html",
        headers: [
          { key: "Content-Security-Policy", value: sandboxCsp },
          // Catch-all setzt DENY — hier überschreiben, sonst darf die eigene
          // Seite die Sandbox nicht einbetten.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      // Vendor-Bundles (React/Babel/Tailwind/Vue/Svelte) sind versionsfest → lange cachen.
      // ACAO *: ES-Module-Fetches aus der Sandbox (opaque origin) brauchen CORS —
      // klassische <script src>-Tags nicht, die Svelte-Runtime-Module schon.
      {
        source: "/vendor/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      // Brand-/Guide-Assets (Bilder, Videos) ändern sich selten → lange cachen.
      // Bei Änderung Dateinamen wechseln (Cache-Busting), da nicht content-gehasht.
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000" }],
      },
      {
        source: "/guides/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000" }],
      },
    ];
  },
};

export default nextConfig;
