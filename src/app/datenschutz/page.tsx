import type { Metadata } from "next";
import Link from "next/link";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von Elementa — DSGVO-konform, EU-gehostet, kein Tracking durch Dritte, First-Party-Analytik nur mit Einwilligung.",
  alternates: { canonical: "/datenschutz" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-fg-muted">{children}</div>
    </section>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 text-[15px] leading-relaxed">
      <h1 className="text-3xl font-bold sm:text-4xl">Datenschutzerklärung</h1>
      <p className="mt-3 text-fg-muted">
        Der Schutz deiner Daten ist uns wichtig. Elementa wird vollständig in der EU
        gehostet, verzichtet auf Tracking durch Dritte und lädt Analytik ausschließlich mit
        deiner ausdrücklichen Einwilligung.
      </p>

      <Section title="1. Verantwortlicher">
        <p>
          Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:
          <br />
          Belkis Aslani, Vogelsangstraße 32, 71691 Freiberg am Neckar, Deutschland
          <br />
          E-Mail:{" "}
          <a href="mailto:belkis.aslani@gmail.com" className="text-fg underline decoration-white/30 underline-offset-4 transition hover:decoration-accent">
            belkis.aslani@gmail.com
          </a>{" "}
          · Telefon: 017681462526
        </p>
        <p>
          Weitere Angaben findest du im{" "}
          <Link href="/impressum" className="text-fg underline decoration-white/30 underline-offset-4 transition hover:decoration-accent">
            Impressum
          </Link>
          .
        </p>
      </Section>

      <Section title="2. Hosting in der EU & Auslieferung über Cloudflare">
        <p>
          Diese Website und die zugehörige Datenbank (Appwrite) werden auf einem Server
          innerhalb der Europäischen Union betrieben (Domain <em>it-handwerk-stuttgart.de</em>).
          Alle Inhalte und Nutzerdaten sind ausschließlich dort gespeichert.
        </p>
        <p>
          Für die öffentliche Erreichbarkeit und den Schutz vor Angriffen wird der
          Datenverkehr über das Netzwerk von <strong>Cloudflare, Inc.</strong> (101 Townsend St.,
          San Francisco, CA 94107, USA) geleitet (Reverse-Proxy/CDN). Cloudflare verarbeitet
          dabei technisch notwendige Verbindungsdaten (z.&nbsp;B. IP-Adresse, angefragte URL)
          als Auftragsverarbeiter. Rechtsgrundlage ist unser berechtigtes Interesse an einer
          sicheren, performanten Auslieferung (Art. 6 Abs. 1 lit. f DSGVO). Cloudflare ist
          unter dem EU-US Data Privacy Framework zertifiziert; zusätzlich bestehen
          Standardvertragsklauseln. Eine dauerhafte Speicherung von Inhalten bei Cloudflare
          findet nicht statt.
        </p>
      </Section>

      <Section title="3. Server-Logfiles">
        <p>
          Beim Aufruf der Website werden technisch notwendige Zugriffsdaten (z. B. angefragte
          Seite, Zeitpunkt, Browsertyp) temporär verarbeitet, um die Auslieferung und
          Sicherheit des Dienstes zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
          DSGVO (berechtigtes Interesse an einem stabilen, sicheren Betrieb). Diese Daten
          werden nicht mit anderen Datenquellen zusammengeführt.
        </p>
      </Section>

      <Section title="4. Cookies & lokale Speicherung">
        <p>
          Wir verwenden <strong>technisch notwendige</strong> Cookies bzw. lokalen Speicher,
          um Kern-Funktionen bereitzustellen — insbesondere deine Anmeldesitzung (Login) und
          das Speichern deiner Cookie-Entscheidung. Diese sind für den Betrieb erforderlich
          (Art. 6 Abs. 1 lit. f DSGVO, § 25 Abs. 2 TDDDG) und benötigen keine Einwilligung.
        </p>
        <p>
          <strong>Optionale</strong> Cookies bzw. Speicher (Statistik/Analytik) setzen wir nur
          nach deiner ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1
          TDDDG). Du kannst deine Auswahl jederzeit ändern:
        </p>
        <p>
          <CookieSettingsButton />
        </p>
      </Section>

      <Section title="5. Reichweitenmessung (First-Party-Analytik)">
        <p>
          Sofern du eingewilligt hast, erfassen wir anonymisierte Nutzungsstatistiken
          (z. B. aufgerufene Seiten) über einen <strong>eigenen, auf unserem EU-Server
          betriebenen</strong> Zähldienst. Es kommen <strong>keine</strong> Dienste Dritter wie
          Google Analytics zum Einsatz. Wir speichern <strong>keine</strong> vollständigen
          IP-Adressen und erstellen keine geräteübergreifenden Profile. Rechtsgrundlage ist
          deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst die Einwilligung jederzeit
          mit Wirkung für die Zukunft widerrufen.
        </p>
      </Section>

      <Section title="6. Benutzerkonto & Community-Inhalte">
        <p>
          Für das Hochladen von Komponenten, Likes, Favoriten und Kommentare ist ein Konto
          erforderlich. Dabei verarbeiten wir die von dir angegebenen Daten (Name, E-Mail,
          Passwort — verschlüsselt gespeichert) sowie die von dir erstellten Inhalte.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des Nutzungsverhältnisses).
          Öffentlich geteilte Komponenten inkl. Autoren-Anzeigename sind für andere sichtbar.
        </p>
        <p>
          Die Konto- und Inhaltsdaten werden über <strong>Appwrite</strong> (self-hosted in der
          EU) verarbeitet. Es erfolgt keine Weitergabe an Dritte zu Werbezwecken.
        </p>
        <p>
          <strong>Newsletter:</strong> Meldest du dich für Updates an, speichern wir deine
          E-Mail-Adresse und den Zeitpunkt deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
          auf unserem EU-Server. Kein Versand über Dritt-Dienste, keine Weitergabe. Du kannst
          dich jederzeit per E-Mail an uns wieder abmelden; die Adresse wird dann gelöscht.
        </p>
      </Section>

      <Section title="7. Speicherdauer">
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke
          erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Konto-Daten werden
          bei Löschung deines Kontos entfernt.
        </p>
      </Section>

      <Section title="8. Deine Rechte">
        <p>Du hast jederzeit das Recht auf:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft</li>
        </ul>
        <p>
          Zur Ausübung genügt eine formlose E-Mail an{" "}
          <a href="mailto:belkis.aslani@gmail.com" className="text-fg underline decoration-white/30 underline-offset-4 transition hover:decoration-accent">
            belkis.aslani@gmail.com
          </a>
          .
        </p>
      </Section>

      <Section title="9. Beschwerderecht">
        <p>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
          Zuständig ist u. a. der Landesbeauftragte für den Datenschutz und die
          Informationsfreiheit Baden-Württemberg.
        </p>
      </Section>

      <p className="mt-12 text-sm text-fg-dim">Stand: 1. Juli 2026</p>
    </div>
  );
}
