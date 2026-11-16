# Venezia – Webseite & digitale Speisekarte

Statische, sehr schnelle Webseite (gehostet auf **GitHub Pages**) mit Speisekarte (DE/EN/AR), Suche, Filtern, Allergenen und
Tischreservierung per WhatsApp. Gepflegt wird über eine Admin-Oberfläche **ohne Code**.

---

## Pflege in 5 Zeilen

> Einmalig: `npm install`. Danach immer: **`npm run admin`** → Browser öffnet `localhost:4321/keystatic`.

### Neues Gericht
1. `npm run admin` → **Kategorien & Gerichte** → Kategorie anklicken.
2. Unten bei „Gerichte / Getränke" auf **Add**.
3. Name, Beschreibung, Preis (z. B. `13,50`), Menge, Allergene ankreuzen.
4. Mit ⠿ an die gewünschte Stelle ziehen → **Done** → **Save**.
5. Kontrolle unter `localhost:4321`, dann veröffentlichen (siehe unten).

### Neue Kategorie
1. **Kategorien & Gerichte** → **Add** (oben rechts).
2. Name (DE/EN/optional AR) und **Reihenfolge** eintragen (10, 20, 30 … – kleinere Zahl = weiter oben).
3. Art wählen: Speisen oder Getränke (Getränke werden kompakt als Liste gezeigt).
4. Gerichte hinzufügen wie oben → **Save**.
5. Ausblenden statt löschen: Häkchen „Kategorie ausblenden".

### Bild austauschen
1. Gericht öffnen → **Foto** → **Choose file** → beliebiges Handy-Foto wählen.
2. **Done** → **Save**. Größe ist egal: beim Veröffentlichen wird automatisch verkleinert (AVIF/WebP).
3. Ohne Admin: Datei mit Gerichtsnamen in `src/assets/images/dishes/` legen, z. B. `prosciutto.jpg`, `penne-al-tonno.jpg`.
4. Kategoriebild, Logo, Startbild, Galerie: gleiches Prinzip unter „Restaurant-Daten" bzw. Kategorie.
5. Ausverkauft / Empfehlung: Häkchen beim Gericht setzen → **Save**.

### Preis ändern
1. **Kategorien & Gerichte** → Kategorie → Gericht anklicken.
2. Feld **Preis in Euro** ändern (Komma oder Punkt, z. B. `14,90`). Zweite Größe: „2. Preis".
3. **Done** → **Save**.
4. Alternativ direkt in `src/content/menu/<kategorie>.json` den Wert bei `"price"` ändern.
5. `npm run check` meldet Tippfehler (falscher Preis, unbekanntes Allergen, fehlendes Bild).

### Seite veröffentlichen
1. Änderungen speichern (Admin → **Save**).
2. `git add -A && git commit -m "Speisekarte aktualisiert"`
3. `git push` → GitHub baut und veröffentlicht automatisch (ca. 2 Minuten, Fortschritt im Tab **Actions**).
4. Live unter **https://jalal-sarokhan.github.io/beit-alshami/**
5. Bei Fehlern zeigt der Actions-Log eine deutsche Meldung der Inhaltsprüfung. Einrichtung: siehe „Hosting“ unten.

**Restaurantdaten** (Adresse, Telefon, **WhatsApp-Nummer**, Öffnungszeiten, Farben, Impressum):
Admin → **Restaurant-Daten**, oder direkt `src/content/site.json`. Die WhatsApp-Nummer steht
**nur dort** (`"whatsapp": "436641234567"`: Ländervorwahl, ohne `+`, ohne Leerzeichen).

---

## Analyse: Referenz & PDF

**Referenz (qr.secret-it.eu/marrusch).** Stärken: drei Schnellaktionen (Anrufen, Route, Reservieren), Kategorie-Tabs mit Anzahl,
klare Preis-/Mengenangaben, Allergen-Legende A–R. Schwächen: keine Fotos, nur Deutsch, keine Suche und keine Filter,
keine Öffnungszeiten, Allergene nur am Seitenende auflösbar, wenig Atmosphäre.

**PDF.** Stärken: schöne Fotos, zweisprachig, Allergene vollständig vorhanden. Schwächen: Allergene als Zahlen statt der Buchstaben
aus der eigenen Legende, Tippfehler, falsch kopierte Übersetzungen, versteckte alte Preise, Doppelungen.
Details und alle offenen Fragen stehen in **[docs/PDF-PRUEFUNG.md](docs/PDF-PRUEFUNG.md)**.

**Was diese Seite besser macht:** Fotos und Kategorie-Bilder, Volltextsuche (findet auch „mushroom"),
Filter (vegetarisch, scharf, Empfehlungen, *ohne* bestimmte Allergene), Allergene direkt am Gericht
antippbar, „Jetzt geöffnet"-Anzeige, Reservierungsformular mit Ruhetag-Erkennung, DE/EN/AR inkl.
Rechts-nach-links, Hell/Dunkel-Modus, druckbarer QR-Code, Schema.org-Speisekarte für Google.

## Entscheidung: Keystatic (Git-basiert) statt Decap oder Supabase

Keystatic speichert alles als JSON-Dateien und Bilder direkt im Projekt. Dadurch bleibt die Seite rein statisch
(schnell, kostenlos hostbar, kein Server und keine Datenbank, die gewartet oder abgesichert werden müssten),
und jede Änderung ist über Git versioniert und rückgängig machbar. Gegenüber Decap CMS hat es eine modernere,
typsichere Oberfläche mit Drag-&-Drop-Sortierung und Bild-Upload ohne Netlify-Identity-Abhängigkeit. Supabase
wäre nur nötig, wenn mehrere Personen ohne PC (z. B. per Handy) gleichzeitig pflegen sollen; das kostet
Komplexität und Performance ohne Mehrwert für eine Speisekarte.

*Ausbaustufe:* Keystatic kann später auf `storage: { kind: 'github' }` umgestellt werden, dann ist
die Pflege auch online über `/keystatic` möglich (erfordert Server-Adapter + GitHub-App).

## Stack & Bibliotheken

| Bibliothek | Warum |
|---|---|
| **Astro 5** (`astro`) | Erzeugt reines HTML ohne JS-Ballast → Lighthouse > 90 auf dem Handy; läuft mit Node 20. |
| **Tailwind CSS 4** (`tailwindcss`, `@tailwindcss/vite`) | Utility-Klassen für Layout; Design-Tokens zentral in `src/styles/global.css`. |
| **Keystatic** (`@keystatic/core`, `@keystatic/astro`) | Admin-Oberfläche für Speisekarte & Restaurantdaten, speichert als JSON im Repo. |
| **React** (`react`, `react-dom`, `@astrojs/react`) | Nur für die Admin-Oberfläche (lokal); auf der öffentlichen Seite wird kein React geladen. |
| **sharp** | Automatische Bildoptimierung (AVIF/WebP, mehrere Größen, Lazy Loading). |
| **@astrojs/sitemap** | Sitemap inkl. Sprachvarianten für Google. |
| **qrcode** | Erzeugt beim Build den druckbaren QR-Code (`/qr/`). |
| **@fontsource-variable/…** | Schriften lokal eingebunden (DSGVO, keine Google-Fonts-Verbindung). |

*Bewusst nicht verwendet:* **Framer Motion**. Es bräuchte React im Browser (ca. 50 KB+). Die sanften
Animationen (Einblenden, rotierender Teller, Dialog) sind mit CSS und einem 3-KB-Skript umgesetzt.

## Design

- **Schrift:** *Cormorant Garamond* (elegante italienische Antiqua für Überschriften und Gerichtsnamen) +
  *Inter* (sehr gut lesbar auf kleinen Displays, Preise mit gleich breiten Ziffern) + *Noto Kufi Arabic* für AR.
- **Farben** aus dem Logo abgeleitet: Espresso `#2b1a12` (Wärme, Holzofen), Gold `#c49a52` (Logo-Akzent,
  Buttons), Terrakotta `#a8432a` (Tomate/Ziegel, für „scharf" und Hinweise), Creme `#f7f1e7` als Papiergrund.
  Änderbar in `site.json` (`colorBrand`, `colorAccent`, `colorHighlight`).
- Mobile-first, Hell/Dunkel-Umschalter (folgt sonst der Handy-Einstellung), feste „Tisch reservieren"-Leiste unten auf dem Handy.

## Projektstruktur

```
src/content/site.json          ← Restaurantdaten (EINZIGE Stelle für WhatsApp-Nummer)
src/content/menu/*.json        ← je Kategorie eine Datei mit allen Gerichten
src/assets/images/…            ← Bilder (werden automatisch optimiert)
src/components/                ← Bausteine der Seite (Hero, Menu, DishItem, …)
src/i18n/ui.ts                 ← Texte der Oberfläche in DE/EN/AR
src/pages/                     ← /, /en/, /ar/, /impressum/, /datenschutz/, /qr/
scripts/validate-content.mjs   ← Inhaltsprüfung vor jedem Build
keystatic.config.ts            ← Felder der Admin-Oberfläche
```

## Befehle

| Befehl | Wirkung |
|---|---|
| `npm install` | Einmalig: Abhängigkeiten installieren |
| `npm run admin` | Pflege-Oberfläche + Vorschau starten |
| `npm run dev` | Nur Vorschau unter `localhost:4321` |
| `npm run check` | Inhalte prüfen (Preise, Allergene, Bilder, WhatsApp-Nummer) |
| `npm run build` | Fertige Seite nach `dist/` bauen |
| `npm run preview` | Gebaute Seite lokal ansehen |

Empfohlen: **Node 22 LTS** (`.nvmrc`). Node 20.11 funktioniert, zeigt aber Hinweise „EBADENGINE".

## Hosting: GitHub Pages (einmalig einrichten)

Die Seite wird bei jedem Push auf `main` durch `.github/workflows/deploy.yml` gebaut und veröffentlicht.

1. Auf GitHub ein Repo **`beit-alshami`** anlegen (öffentlich, wie `civi_plus`).
2. Im Projektordner:
   ```bash
   git init -b main
   git add -A && git commit -m "Venezia Webseite"
   git remote add origin https://github.com/Jalal-Sarokhan/beit-alshami.git
   git push -u origin main
   ```
3. Im Repo: **Settings → Pages → Build and deployment → Source: „GitHub Actions“** auswählen.
4. Unter **Actions** den Lauf abwarten (grüner Haken). Danach ist die Seite unter
   `https://jalal-sarokhan.github.io/beit-alshami/` erreichbar.

**Unterpfad und Domain** ergeben sich automatisch aus `"url"` in `src/content/site.json`:
- anderer Repo-Name → `"url": "https://jalal-sarokhan.github.io/<repo-name>/"`
- später eigene Domain → `"url": "https://www.venezia-pizzeria.at/"` und in GitHub unter Settings → Pages → *Custom domain* eintragen.

Alle internen Links laufen über `withBase()` (`src/lib/paths.ts`), funktionieren also unter jedem Unterpfad.
Lokal (`npm run dev`/`admin`) läuft die Seite ohne Unterpfad unter `localhost:4321/`, `npm run preview`
zeigt sie wie auf GitHub unter `localhost:4321/beit-alshami/`.

> Hinweis: Den QR-Code (`/qr/`) erst drucken, wenn die endgültige Adresse feststeht. Er zeigt auf `"url"`.

## Recht & Datenschutz

- Keine Cookies, kein Tracking → **kein Cookie-Banner nötig**. Das Hell/Dunkel-Design wird nur im Browser gespeichert.
- Schriften lokal; **Google Maps wird erst nach Klick** auf „Karte laden" eingebettet.
- Reservierung: Die Seite speichert nichts; WhatsApp öffnet sich erst auf Klick des Gastes.
- `Impressum` und `Datenschutz` sind ausfüllbare Vorlagen (gelb markierte Stellen; Daten aus `site.json` → `legal…`).
  Keine Rechtsberatung, im Zweifel bei der WKO prüfen lassen.
- **Bildrechte:** Die Fotos stammen aus dem PDF. Bitte klären, ob die Nutzungsrechte auch fürs Web gelten
  (oft Stockfotos des Druckdienstleisters), und Bildnachweis im Impressum eintragen.

## Qualitätsprüfung (Stand der Auslieferung)

- Lighthouse mobil (simuliertes 4G): **DE 93 · EN 92 · AR 91** Performance (auch unter `/beit-alshami/` gemessen: 93), jeweils **100** Barrierefreiheit, Best Practices, SEO.
- WhatsApp-Link getestet: `https://wa.me/<nummer>?text=…` mit Name, Personen, Datum (mit Wochentag), Uhrzeit, Anmerkung;
  Sonderzeichen korrekt kodiert; Ruhetage sperren das Formular; Uhrzeiten richten sich nach den Öffnungszeiten.
- Pflege-Test im Admin: Preis geändert, Foto hochgeladen, gespeichert → sofort auf der Seite sichtbar.
