# SEO- & Google-Discover-Leitfaden für Elementa

Praxis-Anleitung, um mit **Elementa** (ui.it-handwerk-stuttgart.de) bei Google weit oben zu
ranken und für **Google Discover** in Frage zu kommen. Aufgeteilt in: was schon umgesetzt ist,
was du regelmäßig tun musst, und die Discover-Sonderregeln.

---

## 0. TL;DR — die 8 Hebel mit der größten Wirkung

1. **Jede Komponente = eine indexierbare Seite** mit eigenem Title, Description & Bild.
2. **Schnelle Ladezeit** (Core Web Vitals grün) — Google rankt schnelle Seiten höher.
3. **Strukturierte Daten** (schema.org) für Rich Results — bereits eingebaut.
4. **Große, hochwertige Bilder** (≥ 1200 px breit) → Voraussetzung für Discover.
5. **Einzigartiger, hilfreicher Content** (E-E-A-T) statt dünner Seiten.
6. **Interne Verlinkung** (ähnliche Komponenten, Kategorien) — schon eingebaut.
7. **Backlinks & Erwähnungen** aufbauen (GitHub, Dev-Communities, Reddit, Twitter/X).
8. **Google Search Console** einrichten und Sitemap einreichen (Pflicht-Schritt).

---

## 1. Was in Elementa bereits SEO-technisch umgesetzt ist

| Baustein | Datei | Nutzen |
|----------|-------|--------|
| Dynamische Sitemap | `src/app/sitemap.ts` | Alle Komponenten/Autoren/Seiten/Guides + `/stats` für Google |
| robots.txt | `src/app/robots.ts` | Steuert Crawling, verweist auf Sitemap; sperrt `/profil`, `/login`, `/c/*/edit` |
| `max-image-preview:large` | `src/app/layout.tsx` | **Discover-Voraussetzung** (große Bildvorschau) |
| Canonical-URLs | in jeder `generateMetadata` | Verhindert Duplicate Content |
| OpenGraph + Twitter Cards | `layout.tsx`, Detailseiten | Klickstarke Social-/Discover-Vorschauen |
| JSON-LD `WebSite` + `SearchAction` | `page.tsx` | Sitelinks-Searchbox in Google |
| JSON-LD `SoftwareApplication` | `page.tsx` | Rich Result für die App |
| JSON-LD `SoftwareSourceCode` | `c/[slug]/page.tsx` | Rich Result je Komponente |
| JSON-LD `BreadcrumbList` | `c/[slug]/page.tsx` | Breadcrumb in den Suchergebnissen |
| OG-Image pro Komponente | `c/[slug]/opengraph-image.tsx` | Individuelles Vorschaubild |
| Semantische Struktur | überall | 1× H1/Seite, `main`/`nav`/`footer`, Skip-Link |
| Saubere URLs | `/c/[slug]`, `/explore?cat=` | Lesbar, keyword-reich |

> **Wichtig:** Diese Technik ist die Basis. Rankings entstehen aber durch **Content + Autorität +
> Nutzersignale** obendrauf.

---

## 2. Einmalige Pflicht-Schritte (jetzt erledigen)

1. **Google Search Console (GSC)** einrichten → https://search.google.com/search-console
   - Property `ui.it-handwerk-stuttgart.de` per DNS-TXT verifizieren (Cloudflare-DNS).
   - Sitemap einreichen: `https://ui.it-handwerk-stuttgart.de/sitemap.xml`.
   - Unter „Indexierung → Seiten" prüfen, welche Seiten indexiert sind.
2. **Bing Webmaster Tools** ebenfalls anlegen (Bing + ChatGPT-Suche ziehen daraus).
3. **Google-Konto-Verknüpfung**: GA4 **nicht** nötig (wir haben eigene, DSGVO-Analytik). GSC reicht
   fürs Monitoring.
4. **Rich Results Test** je Seitentyp prüfen: https://search.google.com/test/rich-results
5. **PageSpeed Insights** je Seitentyp prüfen: https://pagespeed.web.dev

---

## 3. On-Page-SEO pro Komponente (der wichtigste laufende Hebel)

Jede hochgeladene Komponente ist eine Landingpage. Für Top-Rankings gilt pro Komponente:

- **Title** (50–60 Zeichen): `[Name] – [Framework]-Komponente zum Kopieren` (bereits automatisch).
- **Description** (140–160 Zeichen): konkret, mit Keyword + Nutzen. Beispiel:
  „Animierter Glow-Button in reinem CSS — barrierefrei, 0 Dependencies, per Copy-&-Paste eingebaut."
- **Beschreibungstext auf der Seite**: mindestens 2–3 Sätze *echter* Mehrwert (wofür, wie einbauen,
  Besonderheit). Dünne Seiten ranken nicht.
- **Tags** = Long-Tail-Keywords: `glassmorphism`, `neon`, `loader`, `dark-mode`, `tailwind` …
- **Alt-Texte** für alle Bilder (Vorschau-iframes brauchen keinen, aber echte `<img>` schon).

**Keyword-Muster, auf die Entwickler suchen** (bewusst bedienen):
`css button hover effect`, `tailwind card component`, `html loader animation`,
`react toggle switch`, `glassmorphism card css`, `neon button`, `gradient border css`,
`animated background css`, „ui komponenten kostenlos", „css effekte kopieren".

---

## 4. Content-Strategie (bringt die meisten Besucher)

Reine Komponenten-Seiten reichen für Spitzenplätze oft nicht — **redaktioneller Content** zieht
Traffic und Backlinks. Empfehlung: einen `/blog` oder `/guides`-Bereich aufbauen mit Artikeln wie:

- „10 CSS-Button-Effekte zum Kopieren (2026)"
- „Glassmorphism in reinem CSS — Schritt-für-Schritt"
- „Barrierefreie Toggles: Was WCAG 2.2 wirklich verlangt"
- „Warum node_modules aufgebläht sind — und die Copy-&-Paste-Alternative"

Jeder Artikel verlinkt intern auf passende Komponenten → verteilt „Link Juice" und hält Nutzer.
Solche How-to-Artikel sind auch der **Haupttreiber für Google Discover** (siehe §6).

---

## 5. Technisches SEO & Performance (Ranking-Faktor)

- **Core Web Vitals grün halten** (LCP < 2,5 s, INP < 200 ms, CLS < 0,1). Messen: GSC → „Core Web
  Vitals" und PageSpeed Insights.
- **Bilder**: `next/image` nutzen (liefert AVIF/WebP, ist konfiguriert), immer `width`/`height`
  setzen → kein Layout-Shift (CLS).
- **Lazy Loading** für Vorschauen unterhalb der Falz (bereits per `loading="lazy"` im iframe).
- **Keine Render-Blocker**: kein großes JS im kritischen Pfad (Startseite ist leichtgewichtig).
- **Mobile-first**: Google indexiert die mobile Version. Alles muss auf dem Handy funktionieren
  (Touch-Targets ≥ 44 px, kein horizontales Scrollen).
- **HTTPS + saubere Header**: bereits via `next.config.ts` (HSTS, CSP, nosniff).
- **Interne Links**: „Ähnliche Komponenten" + Kategorie-Verlinkung (eingebaut) — weiter ausbauen.

---

## 6. Google Discover — die Sonderregeln

Discover ist der personalisierte Feed in der Google-App / auf Android-Startseiten. Man kann sich
**nicht** aktiv bewerben — Google wählt Inhalte automatisch. Voraussetzungen, damit Elementa
überhaupt in Frage kommt:

1. **`max-image-preview:large`** muss gesetzt sein → **erledigt** (`layout.tsx`).
2. **Große, hochwertige Bilder**: mindestens **1200 px breit**, kein Logo/Platzhalter. → OG-Images
   und Blog-Titelbilder entsprechend groß und ansprechend gestalten (Higgsfield eignet sich dafür).
3. **Mobilfreundlich & schnell** (Core Web Vitals grün).
4. **E-E-A-T** — Experience, Expertise, Authoritativeness, Trust:
   - Klare **Autoren** (Autor-Profile `/u/[slug]` vorhanden), Impressum, Datenschutz → erledigt.
   - Über-uns/About-Seite mit echter Geschichte stärkt Vertrauen (empfohlen zu ergänzen).
5. **Aktualität & Relevanz**: Discover bevorzugt **frische, trendige** Themen. Regelmäßig neue
   Komponenten + Artikel zu aktuellen UI-Trends (2026, neue CSS-Features etc.).
6. **Fesselnde, aber ehrliche Titel** — **kein Clickbait**, keine übertriebenen Versprechen
   (Google straft Clickbait in Discover ab).
7. **Keine „News"-Pflicht**: Discover ist nicht nur für News — Evergreen-How-tos funktionieren gut.

**Discover-Checkliste pro Artikel/Seite:**
- [ ] Titelbild ≥ 1200 px, hochwertig, thematisch passend
- [ ] `max-image-preview:large` aktiv (global gesetzt)
- [ ] Mobil schnell (LCP < 2,5 s)
- [ ] Klarer Autor + Veröffentlichungsdatum
- [ ] Ehrlicher, neugierig machender Titel ohne Clickbait
- [ ] Einzigartiger Mehrwert, kein dünner/aggregierter Inhalt

---

## 7. Off-Page — Autorität & Backlinks

Rankings hängen stark von **externen Signalen** ab:

- **GitHub**: Repo pflegen, README mit Screenshots, Topics setzen (`ui-components`, `css`,
  `tailwind`, `react`). Sterne = Sichtbarkeit + Backlink.
- **Dev-Communities**: Komponenten auf Reddit (r/webdev, r/css), Hacker News, dev.to, Twitter/X
  teilen. Jede Erwähnung ist ein potenzieller Link.
- **Verzeichnisse**: In UI-Bibliotheks-Listen eintragen (awesome-lists auf GitHub, „CSS resources").
- **Kein Linkkauf** — Google straft unnatürliche Linkmuster ab.

---

## 8. Monitoring & Iteration

- **Wöchentlich**: GSC → „Leistung" prüfen (Impressions, Klicks, Position, Discover-Tab separat).
- Seiten mit vielen Impressions aber wenig Klicks → **Title/Description verbessern** (CTR steigern).
- Seiten auf Position 5–15 → mit mehr Content/internen Links nach oben schieben.
- **Core Web Vitals** grün halten; bei Regressionen sofort nachbessern.
- Neue Suchtrends aufgreifen und dafür Komponenten/Artikel erstellen.

---

## 8b. Google Ads — das 400-€-Startguthaben sinnvoll einsetzen

Stand 2026-07: 400 € Werbeguthaben verfügbar. Wichtig: Guthaben-Aktionen verlangen meist,
dass du **selbst erst einen Betrag ausgibst** (Bedingungen im Angebot prüfen!) und das
Guthaben innerhalb ~60 Tagen nach Freischaltung verbraucht wird.

**Setup (einmalig, vor der ersten Kampagne):**
1. Google-Ads-Konto mit demselben Google-Konto wie die Search Console anlegen und beide verknüpfen.
2. **Conversion-Tracking definieren**, sonst optimiert Google ins Blaue. Für Elementa sinnvolle
   Conversions: Copy-Klick auf einer Komponente, Registrierung, Newsletter-Anmeldung.
   Achtung DSGVO: Google-Tag nur mit Consent-Banner laden — oder zunächst auf
   „Klicks/engagierte Sitzungen" optimieren und Conversions über `/stats` (First-Party) beobachten.
3. **Expertenmodus** verwenden (nicht „Smart-Kampagne") — sonst verbrennt das Budget.

**Kampagnen-Empfehlung (Suche, kein Display):**
- 1 Suchkampagne, Sprache Deutsch, Region DACH, Budget ~10 €/Tag.
- Anzeigengruppen nach Intention: „ui komponenten kostenlos", „tailwind komponenten deutsch",
  „css button effekte", „glassmorphism css", „barrierefreie ui komponenten".
- **Wortgruppen-/exakte Übereinstimmung** statt weitgehend; auszuschließende Keywords pflegen
  (z. B. „job", „kurs", „agentur").
- Landingpages: passgenau verlinken — Kategorie-/Guide-Seiten (`/explore?cat=…`, `/guides/…`),
  nicht immer nur die Startseite.
- USPs in den Anzeigentexten: kostenlos, MIT-Lizenz, barrierefrei geprüft (echte axe-Audits!),
  DSGVO-konform in der EU gehostet, offene Statistiken.

**Nach 2 Wochen auswerten:** Suchbegriffe-Bericht prüfen, teure Keywords ohne Engagement
pausieren, CTR < 2 % → Anzeigentexte überarbeiten. Ads bringt Besucher zum Testen der
Seite — Rankings bringt es **nicht** direkt (Ads hat keinen Einfluss auf organische Ergebnisse).

---

## 9. Konkrete nächste To-dos (priorisiert)

1. **Google Search Console** einrichten + Sitemap einreichen. *(sofort)*
1b. **Google-Ads-Kampagne** mit dem 400-€-Guthaben starten (siehe § 8b). *(sofort danach)*
2. Pro Komponente **aussagekräftige Beschreibung** (≥ 2 Sätze) sicherstellen. *(laufend)*
3. **About-Seite** (`/about`) mit echter Story für E-E-A-T ergänzen. *(bald)*
4. **`/guides`-Bereich** mit 3–5 How-to-Artikeln starten (Discover-Treiber). *(Wachstum)*
5. **Große OG-/Titelbilder** (≥ 1200 px) für Home + Artikel erzeugen (Higgsfield). *(Wachstum)*
6. Backlinks über GitHub + Dev-Communities aufbauen. *(laufend)*

---

*Dieser Leitfaden gehört zum Elementa-Projekt. Technik-Basis ist umgesetzt — der Rest ist
kontinuierliche Content- & Autoritätsarbeit.*
