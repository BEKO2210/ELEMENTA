import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von Elementa gemäß § 5 TMG.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Impressum</h1>
      <p className="mt-3 text-fg-muted">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz).</p>

      <section className="mt-10 space-y-8 text-[15px] leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-fg">Diensteanbieter</h2>
          <address className="mt-3 not-italic text-fg-muted">
            Belkis Aslani
            <br />
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-accent" aria-hidden="true" />
              Vogelsangstraße 32, 71691 Freiberg am Neckar, Deutschland
            </span>
          </address>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-fg">Kontakt</h2>
          <div className="mt-3 space-y-1 text-fg-muted">
            <p className="inline-flex items-center gap-2">
              <Mail size={15} className="text-accent" aria-hidden="true" />
              E-Mail:{" "}
              <a href="mailto:belkis.aslani@gmail.com" className="text-fg underline-offset-4 hover:text-white hover:underline">
                belkis.aslani@gmail.com
              </a>
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-accent" aria-hidden="true" />
              Telefon / WhatsApp:{" "}
              <a href="tel:+4917681462526" className="text-fg underline-offset-4 hover:text-white hover:underline">
                017681462526
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-fg">Verantwortlich für den Inhalt</h2>
          <p className="mt-3 text-fg-muted">
            Verantwortlich im Sinne des § 18 Abs. 2 MStV: Belkis Aslani, Anschrift wie oben.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-fg">Umsatzsteuer</h2>
          <p className="mt-3 text-fg-muted">
            Elementa ist ein privates, nicht-kommerzielles Open-Source-Projekt. Eine
            Umsatzsteuer-Identifikationsnummer nach § 27a UStG besteht daher nicht.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-fg">Streitschlichtung</h2>
          <p className="mt-3 text-fg-muted">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
            bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg underline-offset-4 hover:text-white hover:underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            . Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-fg">Haftung für Inhalte</h2>
          <p className="mt-3 text-fg-muted">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen
            Seiten nach den allgemeinen Gesetzen verantwortlich. Von Nutzern hochgeladene
            Komponenten sind fremde Inhalte; nach §§ 8–10 DDG sind wir nicht verpflichtet,
            diese zu überwachen. Bei Bekanntwerden von Rechtsverletzungen entfernen wir
            entsprechende Inhalte umgehend.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-fg">Urheberrecht &amp; Lizenz</h2>
          <p className="mt-3 text-fg-muted">
            Die von der Community geteilten Komponenten stehen unter der MIT-Lizenz. Details
            findest du auf der{" "}
            <Link href="/lizenz" className="text-fg underline-offset-4 hover:text-white hover:underline">
              Lizenz-Seite
            </Link>
            . Der Quellcode des Projekts ist auf{" "}
            <a
              href="https://github.com/BEKO2210/ELEMENTA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg underline-offset-4 hover:text-white hover:underline"
            >
              GitHub
            </a>{" "}
            einsehbar.
          </p>
        </div>
      </section>

      <p className="mt-12 text-sm text-fg-muted">
        Siehe auch:{" "}
        <Link href="/datenschutz" className="text-accent underline-offset-4 hover:underline">
          Datenschutzerklärung
        </Link>
      </p>
    </div>
  );
}
