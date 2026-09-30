# Casa Ducale – Konzept, Audit & Umsetzung

## 1. Audit (Phase 1–3)

### Bestehendes Projekt
Das Repository enthielt eine React-19/Vite/GSAP-Website eines **anderen Betriebs** (Burger-Restaurant
„Der dicke Bub“). Übernommen wurde nur der technische Unterbau (React, TypeScript, Vite, GSAP, oxlint);
Inhalte, Komponenten und Assets wurden vollständig ersetzt.

### Bestehende Casa-Ducale-Website (eatbu.com)
- Die offizielle Seite und die meisten Verzeichnisse waren aus der Build-Umgebung **nicht abrufbar**
  (Netzwerk-Policy). Die Fakten stammen daher aus öffentlichen Suchergebnissen mehrerer Quellen
  (Das Örtliche, Gelbe Seiten, gastroguide, TripAdvisor, quandoo, Uber Eats, Restaurant-Verzeichnisse).
- Visuell/technisch typisch für Baukasten-Seiten: generisches Template, keine eigene Markenwirkung,
  keine Online-Reservierung mit Verfügbarkeit, eingeschränkte SEO-Struktur.

### Gesicherte Fakten
| Fakt | Wert | Status |
| --- | --- | --- |
| Name | Casa Ducale – Cucina Italiana (Schild), auch „Café Casa Ducale“ | ✓ |
| Adresse | Wiesdorfer Platz 30 **bzw. 30a**, 51373 Leverkusen (in den Luminaden) | ⚠︎ 30 vs. 30a |
| Telefon | 0214 43444 | ✓ |
| Öffnungszeiten | Mo–Sa 08:30–22:00 | ✓ (mehrere Quellen) |
| Sonntag | „geschlossen“ **vs.** „09:30–22:00“ | ⚠︎ Konflikt → „Bitte telefonisch erfragen“ |
| Küche | Pizza & Pasta nach original italienischen Rezepten, maritime Spezialitäten, Fleisch, Salate, Desserts, Frühstück | ✓ |
| Feiern | private Feiern bis 60 Personen; Catering für Geburtstage, Firmenfeiern, Hochzeiten, Kommunionen | ✓ |
| Instagram / E-Mail | nicht gefunden | offen |

## 2. Designsystem (Phase 4)

**Markenkern:** Das schwarz-goldene Schild mit Lilie („Casa Ducale · Cucina Italiana“) und das
Piazza-Wandbild im Gastraum. Daraus: *Italian Hospitality + Premium Dining + Contemporary Editorial.*

- **Farben:** Ink `#14110e`, Ivory `#f5f0e7`, Linen `#ebe3d5`, Gold `#b8914f` (sparsam, nie glänzend),
  Olive, Terracotta nur für Zustände. Hell/Dunkel-Rhythmus der Sektionen.
- **Typografie:** Cormorant Garamond (Display, Kursiv für Akzentwörter) + Manrope (UI, Preise, Labels
  in gesperrten Versalien). Große Editorial-Headlines, viel Weißraum.
- **Logo:** Die Lilie wurde als eigenes, flaches Vektor-Emblem nachgezeichnet (`src/brand/lily.ts`),
  angelehnt an das Schild – statt der gelieferten glänzenden 3D-Stockgrafik (Lizenz-/Stilrisiko).
- **Bogen-Motiv:** Das Hero-Video sitzt in einem Rundbogen (Arkaden einer Piazza) – das Motiv kehrt
  in Atmosphäre-Sektion und Social-Bild wieder.

## 3. Informationsarchitektur (Phase 5)

Die Seite erzählt einen Besuch – nicht Navbar→Speisekarte→Kontakt:

1. **Intro** – Lilie zeichnet sich in Gold, Wortmarke, Vorhang öffnet sich (≈1,6 s, überspringbar)
2. **Hero** – „Casa Ducale“, Gambas-Video im Bogen → wächst beim Scrollen bildschirmfüllend: *„Direkt aus unserer Küche.“*
3. **Il Ristorante** – Manifest „Ein Ort für gutes Essen. Für gute Momente.“ (Wort-für-Wort), echte Fakten, Kennzahlen
4. **Il Marchio** – Logo-Bühne: Lilie zeichnet sich, Goldschimmer, Neigung zur Maus, echtes Schild-Foto
5. **La Cucina** – horizontal gepinnte Food-Reise (6 Kategorien, unterschiedliche Formate)
6. **La Carta** – digitale Speisekarte mit Kategorien, „Della Casa“-Hausspezialitäten
7. **L’Atmosfera** – Bild wächst aus einem Bogen zum Vollbild
8. **Feste & Catering** – Anlässe, Collage aus echten Feier-/Buffet-Fotos, „Feier anfragen“
9. **Momenti** – Galerie in drei Parallax-Spalten + Cinematic Lightbox
10. **Prenotazione** – Reservierung
11. **Vieni a trovarci** – Adresse, Öffnungszeiten mit Live-Status, Kontakt
12. **Footer** – große Wortmarke, Lilien-Wasserzeichen

## 4. Motion-System (Phase 6)

| Ebene | Umsetzung |
| --- | --- |
| Page Load | SVG-Stroke-Draw der Lilie → Wortmarke → Clip-Path-Vorhang → Bogen-Reveal des Videos → Headline zeilenweise |
| Scroll | Masken-Text-Reveals, Wort-Scrub, Clip-Path-Bildreveals, Gegen-Parallax, Pinning (Hero, Küche, Atmosphäre), horizontaler Scroll mit `containerAnimation` |
| Hover | Button-Füllung + Pfeil-Tausch, magnetische Buttons (nur Desktop), Unterstrich-Animation, Bild-Zoom |
| Navigation | Transparenter Header → Blur-Leiste, Ausblenden beim Runterscrollen, aktiver Abschnitt, Fullscreen-Menü mit gestaffelten Links |
| Cursor | Punkt → „View“/„Reserve“-Label (nur Maus, nativer Cursor bleibt) |

Nur `transform`, `opacity`, `clip-path`. `prefers-reduced-motion`: kein Intro, kein Pinning, keine Parallaxe,
kein Autoplay-Video; alle Inhalte sofort sichtbar (geprüft). Video pausiert außerhalb des Viewports und
hat einen Pause-Button (WCAG 2.2.2).

## 5. Reservierungsarchitektur (Phase 7)

```
Browser ── GET /api/availability?month= / ?date=  ──┐
        ── POST /api/reservations                   ├── netlify/functions/api.mts → server/api.ts ── Netlify Blobs
Admin   ── /api/admin/* (Bearer-Token, HMAC, 12 h)  ┘                                   └── Resend (optional)
```

- **Status:** `pending → confirmed / declined → completed`. Online-Anfragen sind nie automatisch verbindlich.
- **Kapazität:** Plätze pro Zeitfenster; offene + bestätigte Anfragen belegen Plätze. Tageszustände
  *verfügbar / wenige Plätze / ausgebucht / nicht verfügbar* werden aus echten Daten berechnet.
- **Schutz:** Serverseitige Validierung, Honeypot, Doppelanfragen-Sperre (gleiche E-Mail + Uhrzeit),
  Vorlaufzeit, Buchungshorizont, Sperren pro Zeitfenster/Tag, verzögerte Antwort bei falschem Passwort.
- **DSGVO:** Datenminimierung, HTTPS, Admin passwortgeschützt, **automatische Löschung 30 Tage** nach
  Reservierungsdatum (einstellbar), keine Cookies, kein Tracking, Fonts lokal, Google Maps nur als Link.
- **Fehlerzustände:** verständliche Texte für Validierung, belegte Zeit, Netzwerk- und Serverfehler;
  niemals technische Fehlermeldungen im UI; Timeout nach 12 s statt endlosem Spinner.

## 6. Qualitätssicherung (Phase 9–14)

- `npm test`: 17 Integrationstests (Verfügbarkeit, Validierung, Kapazität, Duplikate, Sperren, Admin-Auth,
  Statuswechsel, Einstellungen, Löschkonzept) – alle grün.
- End-to-End im Browser: Validierung → Datum → Uhrzeit → Personen → Absenden → „Anfrage gesendet“ →
  Admin-Login → Bestätigen.
- Kein horizontales Überlaufen bei 360 / 390 / 768 / 1024 / 1920 px. Formularfelder 16 px (kein iOS-Zoom),
  Touch-Ziele ≥ 44 px, `svh`-Einheiten und Safe-Areas für iPhone Safari.
- Build: ≈ 140 KB JS (gzip), Bilder als AVIF/WebP mit `srcset`/`sizes`, Lazy Loading, Blur-Platzhalter.

## 7. Vor dem Launch zu klären (Betreiber)

1. **Adresse**: Wiesdorfer Platz 30 oder 30a?
2. **Sonntag**: geöffnet (ggf. Uhrzeiten) oder geschlossen? → `src/data/content.ts` + Admin-Einstellungen
3. **Speisekarte**: aktuelle vollständige Karte mit Preisen (Foto/PDF) – bisher ein Auszug aus Drittquellen
4. **Impressum/Datenschutz**: Inhaber/Rechtsform, USt-IdNr., E-Mail aus dem bestehenden Impressum übernehmen;
   Datenschutz rechtlich prüfen lassen (Platzhalter sind gelb markiert)
5. **Domain** für Canonical/Sitemap/Open Graph (derzeit `casa-ducale-leverkusen.de` angenommen)
6. **Instagram-Handle** (falls vorhanden) → erscheint automatisch in Kontakt & Footer
7. **Bildrechte** für alle Fotos bestätigen; das Hero-Video idealerweise als Original ohne Schnitt-Effekte in 1080p/4K
8. **Kapazität**: Plätze pro Zeitfenster und Reservierungszeiten im Admin einstellen (Standard: 24 Plätze, 12:00–21:00, So geschlossen)
9. **Innenraumfotos** ohne Deko/Neonlicht für die Atmosphäre-Sektion (derzeit Piazza-Wandbild mit Käsekuchen)
