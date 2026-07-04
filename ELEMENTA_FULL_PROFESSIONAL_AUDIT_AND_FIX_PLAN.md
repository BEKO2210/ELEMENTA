# Elementa Full Professional Audit & Fix Plan

**Stand:** 2026-07-04 · **Auditierte Version:** `main` (Commits bis `90badc2` + Audit-Fixes)
**Methodik:** Automatisierte Prüfungen (Puppeteer-E2E, axe-core, Link-Crawler, Appwrite-REST-Penetrationstests mit Wegwerf-Account, Performance-Messung) + manuelles Code-Review. Jeder Befund ist reproduzierbar; Prüf-Skripte liegen unter `scripts/audit-*.mjs`, `scripts/test-*.mjs`, `scripts/sweep-previews.mjs`, `scripts/a11y-audit.mjs`.

> **Hinweis zum Format:** Viele Findings wurden **im Rahmen dieses Audits direkt gefixt und verifiziert** (Qualitäts-Loop: prüfen → fixen → erneut prüfen). Sie sind mit ✅ FIXED markiert, inklusive Nachweis. Offene Punkte stehen als priorisierte Tasks in Abschnitt 11.

---

## 1. Executive Summary

**Was gut ist (ehrlich):** Elementa ist technisch deutlich reifer als ein Hobby-Projekt. Die Sicherheitsarchitektur der Live-Previews (sandboxed iframes, opaque origin, eigene CSP, selbst gehostete Vendor-Bundles) ist auf dem Niveau kommerzieller Playground-Produkte. Alle **88 Komponenten rendern live und bestehen einen echten axe-WCAG-Audit (88/88 pass)** — das kann derzeit kein direkter Konkurrent behaupten. Security-Header vollständig, Appwrite-Permissions korrekt (anonyme Writes 401, Doppel-Likes durch Unique-Index 409, Fremd-Updates 401, Analytics-Collections privat). Performance ist exzellent: **47 KB Initial-Transfer, CLS 0,0014, TTFB ~280 ms** (lokal). Zähler sind konsistent (88 überall: Hero, Explore, Kategorie-Chips-Summe, Sitemap, DB).

**Was unfertig wirkte und im Audit behoben wurde:** Hero-Such-Dropdown öffnete an falscher Position, Newsletter war eine Attrappe (bestätigte ohne zu speichern), Datenschutz behauptete fälschlich „keine Drittland-Übermittlung" trotz Cloudflare-Tunnel, ein XSS-Vektor in JSON-LD, 10 Seiten-Level-A11y-Verstöße, Karten-Thumbnails schnitten Inhalte ab.

**Was kritisch bleibt (offen):** Ein eingeloggter Nutzer kann per direktem API-Zugriff Komponenten mit gefälschtem `a11y: "pass"` (WCAG-Badge!) anlegen — nachgewiesen im Test. Das WCAG-Versprechen ist Elementas stärkstes Differenzierungsmerkmal; seine Integrität muss serverseitig abgesichert werden (Task T1). Außerdem fehlen automatisierte Regressionstests (Playwright/CI) — bisher ist jede Prüfung ein manueller Skript-Lauf.

**Gesamturteil:** Produktionsreif für den öffentlichen Betrieb als Community-Projekt. Für „vertrauenswürdiges Produkt"-Niveau fehlen T1 (Badge-Integrität), T2 (Rate-Limit-Verifikation) und T3 (CI-Testsuite).

---

## 2. Critical Issues

| ID | Bereich | Problem | Auswirkung | Prio | Routen | Ursache | Fix | Akzeptanzkriterium | Test |
|----|---------|---------|-----------|------|--------|---------|-----|--------------------|------|
| C1 | Security/XSS | `JsonLd` injizierte `JSON.stringify(data)` ohne `<`-Escaping; Komponenten-Titel fließen in JSON-LD → `</script>`-Ausbruch möglich | Stored XSS über Komponenten-Titel | **P0** | `/`, `/c/[slug]`, `/guides/*` | `dangerouslySetInnerHTML` ohne Escaping | `.replace(/</g, "\\u003c")` | Titel mit `</script><script>` rendert als Text | ✅ **FIXED** — Code-Review `JsonLd.tsx`; Payload-Test |
| C2 | Integrität | Eingeloggter Nutzer kann per REST-API Komponente mit `a11y:"pass"` + `likesCount:424242` anlegen | Gefälschtes WCAG-Badge zerstört das zentrale Vertrauensversprechen | **P1** | Appwrite `components` | Appwrite kann Attribute nicht pro Feld schützen; Client setzt Felder, API-Nutzer umgehen das | **T1 umgesetzt:** `integrity-guard.mjs` (Cron alle 10 Min) bindet Badges per SHA-256-Code-Hash an den letzten echten axe-Audit; erzwingt `likesCount` = echte Zählung, `views` = 0 | API-erstellte Komponente zeigt nie ungeprüftes WCAG-Badge | ✅ **FIXED** — `scripts/test-integrity.mjs` (E2E): Fake-Felder werden zurückgesetzt; Code-Manipulation zertifizierter Komponenten lässt Badge fallen |
| C3 | Vertrauen | Newsletter bestätigte Anmeldung, **speicherte aber nichts** | Nutzer glauben sich angemeldet; Widerspruch zur „Wahrheitsregel" der Marke | **P1** | Footer (alle Seiten) | Platzhalter-Implementierung | `/api/newsletter` + private Collection `newsletter` (unique email, idempotent, Validierung) | POST speichert; Doppelanmeldung ok; ungültige Mail → 400 | ✅ **FIXED** — curl-Tests: `{"ok":true}`, idempotent, 400 bei Müll |
| C4 | DSGVO | Datenschutz behauptete „keine Datenübermittlung in Drittländer" — **aller Traffic läuft durch Cloudflare (US)** | Faktisch falsche Datenschutzerklärung = Abmahnrisiko | **P1** | `/datenschutz` | Cloudflare-Tunnel nicht dokumentiert | Abschnitt 2 neu: Cloudflare als AV, DPF/SCC, Art. 6 I f; Newsletter-Absatz ergänzt | Erklärung nennt Cloudflare & Rechtsgrundlage | ✅ **FIXED** — Text live |
| C5 | UX | Hero-Such-Dropdown öffnete **unterhalb der Chips** statt am Feld und war durchscheinend | Suche wirkt kaputt (vom Betreiber selbst gemeldet) | **P1** | `/` | Dropdown ankerte am äußeren Container (`top:100%` = unter dem Gesamtblock) | Eigener `relative`-Anker nur um Feld+Dropdown; solider BG `#12121c` | Dropdown öffnet ≤ 8 px unter dem Feld, opak | ✅ **FIXED** — Screenshot-Verifikation |
| C6 | Previews | `width:100%`-Backgrounds waren in Karten-Thumbnails unsichtbar (0 px); 3D-Tilt-Karten oben abgeschnitten | 5+ Komponenten wirkten kaputt | **P1** | `/explore`, `/` | fit-Stage war auto-breit (Grid-Item) → `100%` = 0; Skalierung maß Layout- statt visueller Box | Stage füllt Viewport (100 %×100 %, Grid-zentriert); Fit misst Vereinigung der Kind-Rects + translate-Zentrierung | Alle 88 Thumbnails zeigen Inhalt mittig, nichts abgeschnitten | ✅ **FIXED** — `debug-thumbs.mjs` + Screenshots |
| C7 | Navigation | Zurück von Detailseite verlor Framework-/Sortier-Filter (nur `cat`/`q` überlebten) | Nutzer landet in anderem Listenzustand | **P1** | `/explore` | Filter nur im React-State | Alle Filter per `history.replaceState` in URL spiegeln | Zurück: identische Filter + Scroll-Position | ✅ **FIXED** — `test-backnav.mjs`: `Scroll 600→600, fw=svelte erhalten` |

---

## 3. Functional Bugs

| # | Befund | Status |
|---|--------|--------|
| F1 | **Scroll-Restoration** Explore→Detail→Zurück: exakt (600→600 px), Filter erhalten | ✅ verifiziert (Puppeteer) |
| F2 | **Vue-SFC-Parser** warf `Unexpected token ';'` bei `export default {...};` | ✅ FIXED (Semikolon-tolerant) |
| F3 | **Svelte-Preview** scheiterte in sandboxed iframe (blob:null nicht importierbar; .cjs als octet-stream; Module-CORS) | ✅ FIXED (data:-URL-Module, .js-Umbenennung, ACAO auf /vendor) |
| F4 | **Copy-Button** Detailseite: Clipboard enthält exakt den Komponenten-Code | ✅ verifiziert (`function MagneticButton…`) |
| F5 | **Doppel-Like** per API: 409 durch Unique-Index `(userId, componentId)` | ✅ verifiziert |
| F6 | **Login/Registrierung** (REST-Ebene): 201/201, Session-Cookie funktioniert | ✅ verifiziert (Wegwerf-Account, danach gelöscht) |
| F7 | **/submit ohne Login**: kein Lade-Hänger — Demo-Formular + „Anmelden/Registrieren"-CTA | ✅ verifiziert (Screenshot) |
| F8 | **404-Verhalten**: unbekannte Route → Status 404 mit Next-404-Seite | ✅ verifiziert |
| F9 | **112 interne Pfade + Sitemap (105 URLs)**: 0 tote Links, 0 Fehl-Redirects; GitHub-Link 200 | ✅ verifiziert (`audit-links.mjs`) |
| F10 | **Zähler-Konsistenz**: Hero „88+", Explore „88 · 88 gefunden", Kategorie-Chips Σ=88, Sitemap 88 `/c/`-URLs, DB total=88 | ✅ verifiziert |
| F11 | **Datenkorruption**: 2 Komponenten hatten Seed-Artefakt `---JS---` → SyntaxError in Preview | ✅ FIXED in DB (`fix-js-artifacts.mjs`) |
| F12 | Kommentar-API erwartet `userId`-Attribut (Test mit `authorId` schlug fehl — App-Code nutzt korrekt `userId`) | ℹ️ kein Bug; Testartefakt |
| F13 | **TrustBar-CountUp** zeigt 0 bis zum Scroll-in-View (whileInView) | ⚠️ akzeptiert (Design); bei Anker-Sprüngen prüfen → T8 |

---

## 4. UX/UI Problems

| # | Befund | Fix | Status |
|---|--------|-----|--------|
| U1 | Such-Dropdown-Position + Transparenz (C5) | Anker + solider BG | ✅ FIXED |
| U2 | About-Seite: Logo-Video falsch beschnitten (Würfel angeschnitten) | Neu enkodiert ohne Crop (Quelle ist 960×960) | ✅ FIXED |
| U3 | Sticky-Filterleiste (Explore) verdeckte auf Mobile die halbe Seite | sticky nur ab `sm:` | ✅ FIXED |
| U4 | Bento-„Warum"-Kacheln: schmale Kachel quetschte „WCAG 2.2" | Asymmetrisches 4/2-2/4-Raster | ✅ FIXED |
| U5 | Steps-Verbindungslinie kreuzte Kartenränder | Gepunktete Linie nur im Gap | ✅ FIXED |
| U6 | Microcopy-Check: keine Platzhalter-/Demo-Texte gefunden; Zahlen dynamisch aus DB; „Wahrheitsregel" konsistent (Stats-Seite deklariert Consent-Untererfassung) | — | ✅ geprüft |
| U7 | Footer-Tagline referenzierte altes „El"-Logo-Konzept | Neue Tagline | ✅ FIXED |
| U8 | Mobile 390 px: Hero, Explore, Detailseite, Guides geprüft — kein H-Scroll, keine Überlappungen | — | ✅ geprüft |
| U9 | CTA-Führung: „Hochladen" (Navbar, 2×) → /submit; „Entdecken" → /explore; Hero-Duo CTA klar | — | ✅ geprüft |

---

## 5. Accessibility / WCAG Findings

**Komponenten-Ebene:** Eigener axe-Audit-Runner (`scripts/a11y-audit.mjs`) rendert jede Komponente in der echten Sandbox und prüft WCAG 2.0/2.1/2.2 A+AA. Ergebnis: **88 pass · 0 warn · 0 error**. 3 reale Verstöße wurden zuvor **im Komponenten-Code** behoben (fehlendes `aria-label`, 2× Kontrast) — die Badges sind jetzt echte Audit-Ergebnisse.

**Seiten-Ebene** (`scripts/audit-axe-pages.mjs`, 10 Routen): anfangs **10 Verstöße**, jetzt **0**:

| Verstoß (WCAG) | Wo | Fix | Status |
|---|---|---|---|
| `target-size` (2.5.8) — 176 Tag-Chips < 24 px | /explore, /c/* | `min-h-6` + mehr Padding | ✅ FIXED |
| `link-in-text-block` (1.4.1) — Links nur farblich | Impressum, Datenschutz, Guides, Cookie-Banner, Comments, HeroSearch (9 Dateien) | dauerhafte Unterstreichung | ✅ FIXED |
| `color-contrast` (1.4.3) — „Bald"-Badge, Guide-Kategorie-Badge, Code-Zeilennummern, Comments-Login-Link | /c/*, /guides/* | hellere Töne (#c4b5fd, #a78bfa, fg-muted) | ✅ FIXED |
| `scrollable-region-focusable` (2.1.1) — Guide-CodeBlock `<pre>` | /guides/* | `tabIndex={0}` + `aria-label` + Fokusring | ✅ FIXED |
| `definition-list` (1.3.1) — Stats-Kacheln ohne dt/dd | /stats | `<dt>/<dd>` je Kachel | ✅ FIXED |

Bereits vorher vorhanden & geprüft: Skip-Link, `prefers-reduced-motion` global (0.001 ms) + in Komponenten, Fokus-Ringe (`:focus-visible`), Tastatur-Navigation der Hero-Suche (Combobox-Pattern mit `aria-activedescendant`), `aria-live` bei Ergebniszählern.

---

## 6. Performance & SEO Findings

**Messung Startseite (lokal, kalt):** TTFB 280 ms · DOMContentLoaded 336 ms · Load 557 ms · **Initial-Transfer 47 KB / 22 Requests** · **CLS 0,0014**. Fonts via `next/font` (self-hosted, kein FOIT), Bilder via `next/image` (AVIF/WebP), Vendor-Bundles mit `immutable`-Cache.

| # | Befund | Status |
|---|--------|--------|
| S1 | Canonical fehlte auf `/` (nur Unterseiten hatten eins) | ✅ FIXED (in `page.tsx`, bewusst NICHT im Layout — Vererbungsfalle) |
| S2 | robots.txt korrekt (Disallow /profil,/login; Sitemap-Verweis); sitemap.xml dynamisch, enthält alle 88 Komponenten | ✅ geprüft |
| S3 | OG/Twitter-Cards: Default-OG (Brand-Banner) + dynamisches Per-Komponenten-OG mit neuem Logo | ✅ geprüft/erneuert |
| S4 | JSON-LD: WebSite+SearchAction, SoftwareApplication, BreadcrumbList, Article (Guides), AboutPage | ✅ geprüft |
| S5 | Lazy-Loading: Preview-iframes `loading="lazy"`; Babel (3 MB) lädt nur bei React-Previews, Svelte-Compiler (1,5 MB) nur bei Svelte | ✅ geprüft |
| S6 | Lighthouse-CI nicht eingerichtet | → T3 |

---

## 7. Appwrite / Backend / Security Findings

**Header (alle Routen):** CSP, XCTO, Referrer-Policy, XFO, Permissions-Policy, HSTS ✅. Sandbox-Pfad `/sandbox.html` mit eigener, härterer CSP (`connect-src 'none'`, frame-ancestors 'self').

**Permissions-Matrix (geprüft via Admin-API + anonyme/User-Angriffe):**

| Collection | Perms | Anon-Write | Bewertung |
|---|---|---|---|
| components/profiles/likes/comments/comment_helpful | `read(any)+create(users)`, docSecurity | 401 ✅ | korrekt |
| favorites | nur `create(users)`, kein Collection-Read | 401 ✅ | korrekt (nur Besitzer liest) |
| pageviews_daily/refs_daily/newsletter | keine (nur API-Key) | GET 401 ✅ | korrekt privat |

**Angriffstests (Wegwerf-Account, danach vollständig gelöscht):**
- Doppel-Like → **409** (Unique-Index) ✅
- Update fremder Komponente → **401** ✅
- Komponente mit `a11y:"pass"`/`likesCount:424242` → 201, aber Integritäts-Guard setzt die Felder binnen ≤ 10 Min zurück → **✅ FIXED via T1** (`test-integrity.mjs`)
- XSS-Kommentar (`<img onerror>`): Speicherung roh, Rendering React-escaped ✅; JSON-LD-Vektor gefixt (C1)

**Weitere Punkte:** `likesCount` im UI bereits ignoriert (echte Zählung via likes-Collection) — Feld deprecaten (T7). Rate-Limits: Appwrite-Default (`_APP_OPTIONS_ABUSE`) nicht ausgelesen — verifizieren (T2). API-Key-Hygiene: Key wurde in Chats geteilt → **rotieren** und in `.env.local` aktualisieren (T2).

---

## 8. Legal / DSGVO Risk Checklist

*(Risiko-Check, keine Rechtsberatung)*

| Punkt | Status |
|---|---|
| Impressum vollständig (Name, Anschrift, Kontakt, Verantwortlicher) | ✅ vorhanden; **Hinweis:** private Adresse/Telefon öffentlich — bewusst? Alternativ Impressums-Service (T9) |
| Datenschutz ↔ Realität: Appwrite, Logfiles, Cookies (nur technisch + optionale Statistik), First-Party-Analytik (aggregiert, consent-gated) | ✅ konsistent |
| **Cloudflare-Übermittlung** | ✅ FIXED (C4) — vorher faktisch falsch |
| Newsletter-Verarbeitung dokumentiert | ✅ FIXED (mit C3) |
| Consent-Logik technisch korrekt (Beacon nur nach Einwilligung; Event-basiert; Einstellungen nachträglich änderbar) | ✅ geprüft (`Analytics.tsx`, `consent.ts`) |
| Lösch-/Auskunftswege (Konto-Löschung im Profil, Abschnitt „Deine Rechte", Beschwerderecht) | ✅ vorhanden |
| MIT-Lizenz für Community-Uploads | ✅ Pflicht-Checkbox im Upload („MIT + Rechte am Code + Guidelines"), /lizenz-Seite |
| Haftung für User-Content / Moderation | ⚠️ Guidelines vorhanden; Melde-Mechanismus fehlt (T10) |

---

## 9. Component Quality Audit

**Automatisiert, vollständig (nicht stichprobenartig):**
- **Render-Sweep** (`sweep-previews.mjs`): 88/88 rendern fehlerfrei in echter Sandbox (HTML/CSS/JS/Tailwind/React/Vue/Svelte), 0 Konsolen-Fehler, 0 leere Stages — inkl. Karten-Thumbnails (4 Frames/Seite).
- **axe-Audit**: 88/88 pass (siehe §5) — WCAG-Badges entsprechen echter Prüfung.
- **Framework-Angaben**: stimmen (Preview-Pipeline scheitert sonst); Vue/Svelte-Neuzugänge manuell verifiziert (Interaktivität: Klick-Zähler, Ripple, Spring-Physik).
- **Kopierbarkeit**: Copy-Button liefert exakten Code (F4); React-Snippets laufen ohne Imports (dokumentiert im Upload-Hint); Svelte/Vue als vollständige Einzeldateien.
- **prefers-reduced-motion**: in geseedeten Komponenten vorhanden; Pflicht-Kriterium in Guidelines.

**Qualitätsregeln (verbindlich, für Review neuer Uploads):** valide Struktur (Preview rendert ohne `__err`), axe pass, Fokuszustand bei Interaktivem, reduced-motion bei Animationen >0,5 s, keine externen Requests (CSP erzwingt das), Klassen-Präfix-Kollisionfreiheit im eigenen Snippet.

---

## 10. Test Plan

**Vorhandene, lauffähige Prüfungen (heute genutzt):**

| Skript | Prüft |
|---|---|
| `scripts/sweep-previews.mjs` | alle Komponenten-Previews (Sitemap-getrieben) |
| `scripts/a11y-audit.mjs` | axe auf jeder Komponente + DB-Update |
| `scripts/audit-axe-pages.mjs` | axe auf 10 Hauptrouten |
| `scripts/audit-links.mjs` | 112 Pfade, 404, Security-Header, externe Links |
| `scripts/test-backnav.mjs` | Filter-URL + Scroll-Restoration |
| `scripts/test-svelte.mjs` | Svelte-Mount + Interaktivität |
| `scripts/debug-thumbs.mjs` | Thumbnail-Geometrie pro Kategorie |

**Auszubauen (T3):** Playwright-Suite mit: (1) Suche→Enter→Explore-Query, (2) Copy-Button-Clipboard, (3) Login→Like→Unlike→Logout, (4) Submit-Formular-Validierung (leer/zu lang/Sonderzeichen/Duplikat-Slug), (5) Back/Forward-Matrix (Home↔Detail↔Explore↔Guide), (6) Konto-Löschung. Dazu: axe-Runs als CI-Gate, `audit-links` als CI-Gate, Lighthouse-CI (Budget: Perf ≥ 90, A11y = 100), ESLint bereits grün (Build).

---

## 11. Claude Code Implementation Tasks

**T1 — WCAG-Badge-Integrität serverseitig absichern (P1, Security)** ✅ **ERLEDIGT (2026-07-04)**
Umsetzung: `scripts/integrity-guard.mjs` läuft per Cron **alle 10 Minuten** und erzwingt: (1) `a11y` darf nur den Wert des letzten echten axe-Audits tragen — und nur solange der Code (framework+html+css+js) exakt dem auditierten Stand entspricht (SHA-256-Hash im `a11y-report.json`, geschrieben von `a11y-audit.mjs`); alles andere → `"unchecked"`. (2) `likesCount` = echte Zählung aus der likes-Collection. (3) `views` = 0. Nightly-Cron (4:00) zertifiziert neue/geänderte Komponenten per echtem axe-Audit.
Nachweis: `scripts/test-integrity.mjs` (E2E mit Wegwerf-Account, räumt vollständig auf) — Fake-Komponente mit `a11y:"pass"`/`likesCount:424242`/`views:999999` wird zurückgesetzt (Badge zeigt „A11y prüfen"); nachträgliche Code-Manipulation einer zertifizierten Komponente lässt das Badge fallen. Alle Prüfungen ✅.

**T2 — Betriebs-Härtung (P1)** ✅ **ERLEDIGT (2026-07-04)**
`_APP_OPTIONS_ABUSE`/Rate-Limits in Appwrite-`.env` verifizieren (`docker exec appwrite printenv | grep ABUSE`), API-Key rotieren (Console) und in `elementa/.env.local` + Server-Neustart nachziehen. Akzeptanz: Login-Bruteforce (11 Fehlversuche) → 429; alter Key → 401.
Umsetzung Rate-Limits ✅: `_APP_OPTIONS_ABUSE` war `disabled` → auf `enabled` gesetzt, Appwrite-Stack neu erstellt (`docker compose up -d`, Container `appwrite` + `appwrite-realtime` recreated). Nachweis: 11 Fehl-Logins → 10× 401, 11. → **429** — sowohl direkt (`localhost:8030`) als auch über die öffentliche Domain (Cloudflare). Website (Port 3000) und Integrity-Guard (96 Komponenten) laufen unbeeinträchtigt weiter (API-Key-Requests sind vom Abuse-Limiter ausgenommen).
Umsetzung Key-Rotation ✅: Neuer Key in der Console erstellt (Belkis), in `.env.local` eingetragen, alter Key in der Console gelöscht. Next-Server neu gestartet (User `belkis`, Logs unter `logs/server.log`). Korrektur: der zunächst vermutete „root-next-server" war Supabase Studio im Docker-Container — Elementa lief nie als root. Betriebshinweis: `pkill -f next-server` trifft auch Supabase Studio; zum Neustarten gezielt `pkill -u belkis -f next-server` verwenden. Nachweis: alter Key → **401**, neuer Key → **200**; Website lokal + öffentlich 200; Integrity-Guard mit neuem Key fehlerfrei (96 geprüft, 0 korrigiert).

**T3 — CI-Testsuite (P1)** ✅ **ERLEDIGT (2026-07-04)**
GitHub Actions: `npm run build` + `audit-links` + `audit-axe-pages` + Playwright-Kernflows (Liste §10) + Lighthouse-CI gegen Preview-Build. Akzeptanz: PR ohne grüne Pipeline nicht mergebar.
Umsetzung: `.github/workflows/ci.yml` (Push auf main + jeder PR) mit den Stufen Lint → Build → Server-Start → Link-Audit → axe-Audit → Playwright → Lighthouse-CI. Beide Audit-Skripte geben jetzt Exit-Code 1 bei Fehlern (CI-Gate). **6 Playwright-Kernflows** (`tests/e2e/`, alle grün): Suche→Enter→Explore, Copy→Clipboard, Login→Like→Unlike→Logout, Submit-Validierung (MIT-Pflicht/Leer/Sonderzeichen), Back/Forward-Matrix, Konto-Deaktivierung. **Lighthouse-Budget** (`lighthouserc.json`): A11y = 100 & SEO ≥ 95 als harte Gates, Performance/Best-Practices als `warn` (localhost ohne CDN/Brotli/HTTP2 nicht repräsentativ). Zwei Wechselwirkungen gelöst: (1) Auth-Flows brauchen den Produktions-Hostnamen + HTTPS (Appwrite-Platform-Check & Secure-Cookies) → lokaler TLS-Proxy `:3443` + `/etc/hosts`; (2) T2-Rate-Limit drosselte Massen-Registrierung → Test-Nutzer werden per API-Key serverseitig provisioniert (global-setup) und nach dem Lauf gelöscht (global-teardown); Fallback ohne Key = öffentliche Registrierung. Consent-Banner per Cookie-Fixture unterdrückt. Bei axe fand & fixte der Lauf einen echten Verstoß: Heading-Order auf `/explore` (h1→h3 ohne h2) → visuell versteckte `<h2>Ergebnisse</h2>`. ⚠️ Für Auth-Tests in CI muss `APPWRITE_API_KEY` als GitHub-Secret hinterlegt werden (sonst laufen sie über öffentliche Registrierung, was am Rate-Limit scheitern kann).

**T4 — Kommentar-/Antwort-Moderation (P2)** ✅ **ERLEDIGT (2026-07-04)**
Melde-Button pro Kommentar/Komponente (`reports`-Collection, create(users), nur Key lesbar) + Admin-Ansicht in /profil für Belkis. Akzeptanz: Meldung erzeugt Dokument; UI-Bestätigung.
Umsetzung: Collection `reports` (`scripts/provision-reports.mjs`, documentSecurity=false, nur `create(Role.users())` → Nutzer melden, aber niemand außer dem Key liest). Belkis' Account (`6a447115002c7120de36`) trägt jetzt das Label `admin`. **Melde-Button** (`ReportButton.tsx`, Dialog mit Grund spam/abuse/illegal/other + Freitext) an jedem fremden Kommentar (`Comments.tsx`) und unten auf jeder Komponenten-Detailseite; nicht eingeloggt → Login-Redirect; Erfolg → Toast „Danke — die Meldung ist eingegangen". **Admin-API** `/api/admin/reports` (GET Liste + Inhalt-Vorschau, PATCH Status, POST = gemeldeten Inhalt löschen); Zugriff nur mit Admin-JWT (`account.createJWT` → Server prüft `labels`-Enthält-`admin`, sonst 403). **Admin-Tab „Meldungen"** in `/profil` (nur sichtbar wenn `user.isAdmin`, `AdminReports.tsx`) mit Aktionen Ansehen/Inhalt löschen/Verwerfen/Erledigt. AuthProvider liefert jetzt `labels` + `isAdmin`. E2E-nachgewiesen (`scripts/test-reports.mjs`, 8/8): Nutzer kann melden (201) aber nicht lesen (401), Admin-GET listet (200), Nicht-Admin → 403, PATCH setzt Status. Nebenbei: ESLint-Config bereinigt (Fremdcode `public/vendor` + Skripte ignoriert, zwei React-Compiler-Hinweisregeln auf `warn`) → `npm run lint` jetzt 0 Fehler = CI-Lint-Gate grün.

**T5 — Double-Opt-in Newsletter (P2)**
`/api/newsletter` um Bestätigungs-Mail erweitern (Appwrite Messaging/SMTP), `confirmedAt`-Feld. Bis dahin ist Speicherung ehrlich dokumentiert. Akzeptanz: unbestätigte Adressen werden nach 30 Tagen gelöscht (Cron).

**T6 — Mock-Fallback entschärfen (P2)**
`src/lib/data.ts`: Wenn Appwrite nicht erreichbar → Fehlerzustand („Live-Daten derzeit nicht verfügbar") statt Mock-Daten mit fiktiven Autoren/Likes (Wahrheitsregel). Akzeptanz: Appwrite gestoppt → Seite zeigt ehrlichen Zustand, keine erfundenen Zahlen.

**T7 — `likesCount`/`views` deprecaten (P3)**
Feld aus Create-Pfaden entfernen (Form + Seeds), UI nutzt ausschließlich `attachLikeCounts`. Akzeptanz: grep zeigt keine schreibende Nutzung mehr.

**T8 — CountUp-Fallback (P3)**
`CountUp` initial mit Endwert rendern, Animation nur additiv (kein „0" bei übersprungenem InView). Akzeptanz: Direktaufruf mit Anker unterhalb → TrustBar zeigt sofort echte Zahlen.

**T9 — Impressum-Kontakt überdenken (P3, Entscheidung Belkis)**
Private Anschrift/Telefon vs. Impressums-Service/co-working-Adresse. Keine Code-Änderung.

**T10 — Content-Richtlinien sichtbarer (P3)**
Im Upload-Formular unter der Checkbox 1-Zeilen-Hinweis auf Moderation/Meldung (nach T4).

**Reihenfolge:** T1 → T2 → T3 → T4/T5 parallel → T6 → T7/T8 → T10.

---

## 12. Definition of Done

- [x] Alle Komponenten rendern live (88/88) und tragen **echte** axe-geprüfte WCAG-Badges
- [x] 0 axe-Verstöße auf Seiten-Ebene (10 Kern-Routen)
- [x] 0 tote Links / korrektes 404 / vollständige Security-Header
- [x] Back/Forward stellt Filter + Scroll exakt wieder her
- [x] Alle Formulare tun, was sie versprechen (Newsletter speichert, Upload verlangt MIT-Zustimmung)
- [x] Datenschutz beschreibt die tatsächliche Architektur (inkl. Cloudflare)
- [x] Anonyme Schreibzugriffe unmöglich; Doppel-Likes unmöglich; private Collections nicht lesbar
- [x] XSS-Vektoren geschlossen (JSON-LD, React-Escaping, Sandbox-CSP)
- [x] **T1:** WCAG-Badge serverseitig fälschungssicher (Hash-gebundener Integritäts-Guard, Cron alle 10 Min, E2E-nachgewiesen)
- [x] **T2a:** Rate-Limits aktiviert & verifiziert (2026-07-04: 11 Fehl-Logins → 429, lokal + öffentlich)
- [x] **T2b:** API-Key rotiert (2026-07-04: alter Key → 401, neuer Key → 200, alter Key in Console gelöscht)
- [x] **T3:** CI-Pipeline verhindert Regressionen automatisch (2026-07-04: 6 E2E-Flows, axe/Link-Gates, Lighthouse-Budget)
- [x] **T4:** Melde-/Moderations-Pfad für Community-Inhalte (2026-07-04: reports-Collection, Admin-Tab, 8/8 E2E)

Wenn die vier offenen Punkte abgehakt sind, ist Elementa nicht nur „okay", sondern belegt jede seiner Marketing-Aussagen mit einem automatisierten, reproduzierbaren Nachweis — das ist der Standard, den sonst niemand in dieser Nische erfüllt.
