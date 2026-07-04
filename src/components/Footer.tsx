import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { GithubIcon } from "./BrandIcons";
import { Logo } from "./Logo";
import NewsletterSignup from "./NewsletterSignup";

const GITHUB = "https://github.com/BEKO2210/ELEMENTA";

export default function Footer() {
  return (
    <footer className="relative mt-28">
      <hr className="glow-line" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Logo size={30} animated={false} />
            <p className="mt-2 text-sm text-fg-muted">
              Der offene Baukasten für effektreiche UI-Komponenten. Gebaut von Entwicklern,
              für Entwickler. In der EU gehostet. Immer kostenlos.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
                <ShieldCheck size={13} /> DSGVO · Made &amp; hosted in EU
              </span>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-muted transition hover:border-white/20 hover:text-white"
              >
                <Star size={13} /> Star on GitHub
              </a>
            </div>
            <div className="mt-6">
              <NewsletterSignup />
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-10 gap-y-8 text-sm sm:grid-cols-4"
          >
            <div className="space-y-2">
              <p className="font-medium text-fg">Plattform</p>
              <Link href="/explore" className="block text-fg-muted hover:text-white">Entdecken</Link>
              <Link href="/submit" className="block text-fg-muted hover:text-white">Hochladen</Link>
              <Link href="/about" className="block text-fg-muted hover:text-white">Über uns</Link>
              <Link href="/stats" className="block text-fg-muted hover:text-white">Statistiken</Link>
              <Link href="/login" className="block text-fg-muted hover:text-white">Anmelden</Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-fg">Frameworks</p>
              <Link href="/explore" className="block text-fg-muted hover:text-white">React · Vue · Svelte</Link>
              <Link href="/explore" className="block text-fg-muted hover:text-white">Tailwind · HTML/CSS</Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-fg">Rechtliches</p>
              <Link href="/impressum" className="block text-fg-muted hover:text-white">Impressum</Link>
              <Link href="/datenschutz" className="block text-fg-muted hover:text-white">Datenschutz</Link>
              <Link href="/lizenz" className="block text-fg-muted hover:text-white">Lizenz (MIT)</Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-fg">Community</p>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-fg-muted hover:text-white"
              >
                <GithubIcon size={14} /> GitHub
              </a>
              <Link href="/guides" className="block text-fg-muted hover:text-white">Guides</Link>
              <Link href="/docs/contribute" className="block text-fg-muted hover:text-white">Mitmachen</Link>
              <Link href="/docs/guidelines" className="block text-fg-muted hover:text-white">Guidelines</Link>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-fg-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Elementa · Ein Projekt von Belkis Aslani</p>
          <p className="font-mono text-[11px] tracking-wider text-fg-dim">
            Die Elemente, aus denen Interfaces entstehen
          </p>
        </div>
      </div>
    </footer>
  );
}
