import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";
import CommandPalette from "@/components/CommandPalette";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import { Suspense } from "react";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ui.it-handwerk-stuttgart.de"),
  title: {
    default: "Elementa — Der offene Baukasten für UI-Komponenten",
    template: "%s · Elementa",
  },
  description:
    "Effektreiche, framework-übergreifende UI-Komponenten zum Kopieren. Kostenlos, barrierefrei geprüft, DSGVO-konform in der EU gehostet.",
  keywords: ["UI Komponenten", "Tailwind", "React", "Vue", "CSS", "Baukasten", "DSGVO"],
  // Für Google Discover & Rich Results: große Bildvorschau + volle Snippets erlauben.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: "Elementa",
    title: "Elementa — Der offene Baukasten für UI-Komponenten",
    description:
      "Effektreiche UI-Komponenten zum Kopieren. Kostenlos, barrierefrei, DSGVO-konform.",
    type: "website",
    locale: "de_DE",
    url: "/",
    images: [
      {
        url: "/brand/og-default.png",
        width: 1376,
        height: 768,
        alt: "Elementa — Der offene Baukasten für UI-Komponenten",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elementa — Der offene Baukasten für UI-Komponenten",
    description:
      "Effektreiche UI-Komponenten zum Kopieren. Kostenlos, barrierefrei, DSGVO-konform.",
    images: ["/brand/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-panel focus:px-4 focus:py-2 focus:text-sm focus:text-fg focus:outline focus:outline-2 focus:outline-accent"
        >
          Zum Inhalt springen
        </a>
        <AuthProvider>
          <ToastProvider>
            <CommandPalette />
            <Navbar />
            <main id="main" className="flex-1 overflow-x-clip">{children}</main>
            <Footer />
            <CookieConsent />
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
