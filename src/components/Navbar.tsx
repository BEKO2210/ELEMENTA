import Link from "next/link";
import UserMenu from "./UserMenu";
import CommandTrigger from "./CommandTrigger";
import { Logo } from "./Logo";
import { GithubIcon } from "./BrandIcons";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/70 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center">
          <Logo size={32} />
        </Link>

        <NavLinks />

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/BEKO2210/ELEMENTA"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Elementa auf GitHub (öffnet neuen Tab)"
            title="GitHub"
            className="hidden h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-fg-muted transition hover:border-accent/40 hover:text-white sm:grid"
          >
            <GithubIcon size={16} />
          </a>
          <CommandTrigger />
          {/* Auf Desktop volle Aktionen; auf Mobile ins Hamburger-Menü verlagert (kein Overflow). */}
          <span className="hidden items-center gap-2 md:flex">
            <UserMenu />
          </span>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
