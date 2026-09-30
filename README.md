# Casa Ducale — Website

Premium-Website für **Casa Ducale · Cucina Italiana**, Wiesdorfer Platz, Leverkusen-Wiesdorf –
mit Cinematic-Intro, scrollgesteuerten Animationen und eigenem Reservierungssystem inkl. Admin-Bereich.

Konzept, Audit, Designsystem und offene Punkte: [`docs/KONZEPT.md`](docs/KONZEPT.md)

## Stack

| Bereich | Technik |
| --- | --- |
| Frontend | React 19 + TypeScript, Vite (Multi-Page: `/`, `/admin/`, `/impressum/`, `/datenschutz/`) |
| Motion | GSAP + ScrollTrigger, Lenis (Smooth Scroll, nur Desktop-Wheel) |
| Schriften | Cormorant Garamond + Manrope, **lokal gehostet** (keine Google-Fonts-Verbindung) |
| Backend | Eine Netlify Function (`netlify/functions/api.mts` → `server/api.ts`) |
| Speicher | Netlify Blobs (Produktion), JSON-Dateien in `.data/` (lokal) |
| E-Mail | optional über Resend (Betreiber bei neuer Anfrage, Gast bei Bestätigung/Absage) |

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:5173 – inkl. lokaler API (Admin-Passwort: casa-ducale-dev)
npm test           # 17 Integrationstests für das Reservierungs-API
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # Produktions-Build lokal inkl. API
npm run lint
```

## Deployment (Netlify)

`netlify.toml` ist fertig konfiguriert (Build, Function, Security-Header, Caching).
Unter *Site configuration → Environment variables* setzen:

| Variable | Pflicht | Zweck |
| --- | --- | --- |
| `ADMIN_PASSWORD` | ja | Passwort für `/admin/` |
| `ADMIN_SESSION_SECRET` | ja | Zufälliger String (≥ 32 Zeichen), signiert Admin-Sitzungen |
| `RESEND_API_KEY` | nein | Aktiviert E-Mail-Benachrichtigungen |
| `NOTIFY_EMAIL` | nein | Empfänger für neue Anfragen (Restaurant) |
| `MAIL_FROM` | nein | Absender, z. B. `Casa Ducale <reservierung@casa-ducale-leverkusen.de>` (Domain bei Resend verifizieren) |

Ohne Resend funktioniert alles – Anfragen erscheinen dann nur im Admin-Bereich.

## Reservierungen verwalten

`/admin/` → Passwort. Drei Bereiche:

- **Anfragen** – nach Zeitraum und Status filtern, *Bestätigen / Ablehnen / Abgeschlossen / Löschen*,
  Telefon und E-Mail direkt anklickbar, Liste aktualisiert sich jede Minute.
- **Zeitfenster** – pro Tag Auslastung je Uhrzeit sehen, einzelne Zeiten oder den ganzen Tag sperren.
- **Einstellungen** – Plätze pro Zeitfenster, max. Personen online, Buchungshorizont, Vorlaufzeit,
  Löschfrist, geöffnete Wochentage und deren Zeitfenster.

Status-Logik: Eine Online-Anfrage ist immer **Offen**, bis das Team sie bestätigt – die Website
täuscht keine verbindliche Buchung vor. Offene und bestätigte Anfragen belegen Plätze; abgelehnte geben sie frei.

## Inhalte pflegen

- **Fakten** (Adresse, Telefon, Öffnungszeiten, Texte): `src/data/content.ts`
- **Speisekarte**: `src/data/menu.ts`
- Einträge mit `⚠︎ BESTÄTIGEN` sind vor dem Launch vom Betreiber zu prüfen (siehe `docs/KONZEPT.md`).
- **Nichts erfinden**: keine Gerichte, Preise, Bewertungen oder Auszeichnungen ohne Quelle.

## Bilder & Video

Originale liegen in `assets-src/`. Die Pipeline erzeugt AVIF/WebP/JPEG in mehreren Breiten,
schneidet Fremdmarken/Personen/Overlay-Text weg (Crops in `scripts/optimize-images.mjs`) und
schreibt `src/data/images.gen.ts` inkl. Blur-Platzhalter.

```bash
npm run images    # neue Fotos: Datei in assets-src/photos/ legen, Crop/Fokus im Script ergänzen
npm run brand     # Favicon, Touch-Icon, Manifest, Lilien-Maske aus src/brand/lily.ts
npm run og        # Social-Vorschaubild (benötigt Playwright; PLAYWRIGHT_MODULE / CHROMIUM_PATH)
```

Das Hero-Video (`public/media/video/`) ist ein 8,7-s-Loop aus drei sauberen Passagen des Original-Clips
(ohne Instagram-Übergänge und Text-Overlay), farbkorrigiert, als WebM (VP9) + MP4 (H.264) ohne Ton.

## Struktur

```
src/
  components/     eine Datei pro Sektion (Hero, Story, Marchio, Kitchen, Menu, Atmosphere,
                  Events, Gallery, Reservation, Visit, Footer) + ui.tsx, Chrome.tsx (Cursor, Sticky-CTA)
  admin/          Admin-Oberfläche
  legal/          Impressum & Datenschutz
  data/           content.ts, menu.ts, images.gen.ts
  lib/            motion.ts (GSAP/Lenis), api.ts (Client)
  brand/lily.ts   Lilien-Geometrie (Logo)
shared/           Reservierungslogik (Slots, Verfügbarkeit, Validierung) – Client & Server
server/           API-Handler + Speicher-Adapter
netlify/functions Netlify-Function-Einstieg
tests/            API-Integrationstests
```
