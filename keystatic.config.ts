import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * Admin-Oberfläche für die Pflege von Speisekarte und Restaurantdaten.
 * Start: `npm run admin` → http://localhost:4321/keystatic
 * Alle Änderungen landen als JSON-Dateien in src/content/ und Bilder in src/assets/images/.
 */

const ALLERGENS = [
  { label: 'A – Gluten', value: 'A' },
  { label: 'B – Krebstiere', value: 'B' },
  { label: 'C – Ei', value: 'C' },
  { label: 'D – Fisch', value: 'D' },
  { label: 'E – Erdnüsse', value: 'E' },
  { label: 'F – Soja', value: 'F' },
  { label: 'G – Milch / Laktose', value: 'G' },
  { label: 'H – Schalenfrüchte (Nüsse)', value: 'H' },
  { label: 'L – Sellerie', value: 'L' },
  { label: 'M – Senf', value: 'M' },
  { label: 'N – Sesam', value: 'N' },
  { label: 'O – Sulfite', value: 'O' },
  { label: 'P – Lupinen', value: 'P' },
  { label: 'R – Weichtiere', value: 'R' },
];

const dish = fields.object({
  name: fields.text({ label: 'Name (Deutsch)', validation: { isRequired: true } }),
  description: fields.text({ label: 'Beschreibung (Deutsch)', multiline: true }),
  name_en: fields.text({ label: 'Name (Englisch)', description: 'Leer lassen = deutscher Name' }),
  description_en: fields.text({ label: 'Beschreibung (Englisch)', multiline: true }),
  name_ar: fields.text({ label: 'Name (Arabisch, optional)', description: 'Leer = englischer Name' }),
  description_ar: fields.text({ label: 'Beschreibung (Arabisch, optional)', multiline: true }),
  group: fields.text({
    label: 'Zwischenüberschrift (optional)',
    description: 'z. B. "Limonaden". Gerichte mit gleicher Zwischenüberschrift werden gruppiert.',
  }),
  group_en: fields.text({ label: 'Zwischenüberschrift (Englisch)' }),
  group_ar: fields.text({ label: 'Zwischenüberschrift (Arabisch)' }),
  price: fields.text({ label: 'Preis in Euro', description: 'z. B. 13,50', validation: { isRequired: true } }),
  size: fields.text({ label: 'Menge / Portion', description: 'z. B. 0,3 l, 150 g, klein (optional)' }),
  price2: fields.text({ label: '2. Preis (optional)', description: 'für eine zweite Größe, z. B. 6,10' }),
  size2: fields.text({ label: '2. Menge (optional)', description: 'z. B. 0,5 l' }),
  allergens: fields.multiselect({ label: 'Allergene', options: ALLERGENS }),
  tags: fields.multiselect({
    label: 'Merkmale',
    options: [
      { label: 'Vegetarisch', value: 'vegetarian' },
      { label: 'Vegan', value: 'vegan' },
      { label: 'Scharf', value: 'spicy' },
    ],
  }),
  recommended: fields.checkbox({ label: '⭐ Empfehlung des Hauses' }),
  soldOut: fields.checkbox({ label: 'Ausverkauft' }),
  hidden: fields.checkbox({ label: 'Ausblenden (nicht auf der Seite zeigen)' }),
  image: fields.image({
    label: 'Foto (optional)',
    description: 'Beliebige Größe – wird beim Veröffentlichen automatisch verkleinert und optimiert.',
    directory: 'src/assets/images/dishes',
    publicPath: '/src/assets/images/dishes/',
  }),
});

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Venezia – Pflege' },
    navigation: {
      Speisekarte: ['categories'],
      Restaurant: ['site'],
    },
  },
  collections: {
    categories: collection({
      label: 'Kategorien & Gerichte',
      path: 'src/content/menu/*',
      slugField: 'name',
      format: { data: 'json' },
      columns: ['order'],
      schema: {
        name: fields.slug({ name: { label: 'Kategorie (Deutsch)' } }),
        name_en: fields.text({ label: 'Kategorie (Englisch)' }),
        name_ar: fields.text({ label: 'Kategorie (Arabisch)' }),
        order: fields.integer({
          label: 'Reihenfolge',
          description: 'Kleine Zahl = weiter oben (10, 20, 30 … lässt Platz zum Einschieben)',
          defaultValue: 100,
        }),
        hidden: fields.checkbox({ label: 'Kategorie ausblenden' }),
        kind: fields.select({
          label: 'Art',
          options: [
            { label: 'Speisen', value: 'food' },
            { label: 'Getränke', value: 'drinks' },
          ],
          defaultValue: 'food',
        }),
        image: fields.image({
          label: 'Titelbild der Kategorie (optional)',
          directory: 'src/assets/images/categories',
          publicPath: '/src/assets/images/categories/',
        }),
        note: fields.text({ label: 'Hinweis (Deutsch, optional)', description: 'z. B. "Alle Pizzen enthalten A, C, F, G, P"' }),
        note_en: fields.text({ label: 'Hinweis (Englisch)' }),
        note_ar: fields.text({ label: 'Hinweis (Arabisch)' }),
        dishes: fields.array(dish, {
          label: 'Gerichte / Getränke',
          itemLabel: (props) => {
            const v = props.fields;
            const flags = [v.soldOut.value ? '⛔' : '', v.recommended.value ? '⭐' : '', v.hidden.value ? '🙈' : ''].join('');
            return `${flags} ${v.name.value || 'Neues Gericht'} – ${v.price.value || '?'} €`.trim();
          },
        }),
      },
    }),
  },
  singletons: {
    site: singleton({
      label: 'Restaurant-Daten (Adresse, Telefon, WhatsApp, Zeiten …)',
      path: 'src/content/site',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Name des Restaurants', validation: { isRequired: true } }),
        subtitle: fields.text({ label: 'Untertitel', description: 'z. B. Pizzeria · Restaurant' }),
        tagline: fields.text({ label: 'Slogan (Deutsch)' }),
        tagline_en: fields.text({ label: 'Slogan (Englisch)' }),
        tagline_ar: fields.text({ label: 'Slogan (Arabisch)' }),
        url: fields.url({ label: 'Adresse der Webseite', description: 'z. B. https://www.venezia-pizzeria.at' }),
        street: fields.text({ label: 'Straße und Hausnummer' }),
        zip: fields.text({ label: 'PLZ' }),
        city: fields.text({ label: 'Ort' }),
        country: fields.text({ label: 'Land (Code)', defaultValue: 'AT' }),
        phone: fields.text({ label: 'Telefon', description: 'international, z. B. +43 463 123456' }),
        whatsapp: fields.text({
          label: 'WhatsApp-Nummer für Reservierungen',
          description: 'NUR Ziffern, mit Ländervorwahl, ohne + und Leerzeichen. Beispiel: 436641234567',
          validation: { isRequired: true, pattern: { regex: /^[1-9][0-9]{7,14}$/, message: 'Nur Ziffern, z. B. 436641234567' } },
        }),
        email: fields.text({ label: 'E-Mail (für Impressum)' }),
        googleMapsUrl: fields.url({ label: 'Google-Maps-Link (Route)', description: 'Leer = wird aus der Adresse erzeugt' }),
        googleReviewUrl: fields.url({ label: 'Link „Auf Google bewerten"' }),
        instagram: fields.url({ label: 'Instagram (optional)' }),
        facebook: fields.url({ label: 'Facebook (optional)' }),
        timezone: fields.text({ label: 'Zeitzone', defaultValue: 'Europe/Vienna' }),
        openingHours: fields.array(
          fields.object({
            day: fields.select({
              label: 'Tag',
              options: [
                { label: 'Montag', value: 'mo' },
                { label: 'Dienstag', value: 'tu' },
                { label: 'Mittwoch', value: 'we' },
                { label: 'Donnerstag', value: 'th' },
                { label: 'Freitag', value: 'fr' },
                { label: 'Samstag', value: 'sa' },
                { label: 'Sonntag', value: 'su' },
              ],
              defaultValue: 'mo',
            }),
            open: fields.text({ label: 'Öffnet (HH:MM)', defaultValue: '11:00' }),
            close: fields.text({ label: 'Schließt (HH:MM)', defaultValue: '22:00' }),
          }),
          {
            label: 'Öffnungszeiten',
            description: 'Ein Eintrag pro Tag (bei Mittagspause zwei). Tage ohne Eintrag = Ruhetag.',
            itemLabel: (p) => `${p.fields.day.value}: ${p.fields.open.value}–${p.fields.close.value}`,
          }
        ),
        hoursNote: fields.text({ label: 'Hinweis zu Öffnungszeiten (optional)', description: 'z. B. Küche bis 21:30' }),
        hoursNote_en: fields.text({ label: 'Hinweis zu Öffnungszeiten (Englisch)' }),
        reservationTemplate: fields.text({
          label: 'WhatsApp-Vorlagentext (Deutsch)',
          multiline: true,
          description: 'Platzhalter: {name} {persons} {date} {time} {note}',
        }),
        reservationTemplate_en: fields.text({ label: 'WhatsApp-Vorlagentext (Englisch)', multiline: true }),
        reservationTemplate_ar: fields.text({ label: 'WhatsApp-Vorlagentext (Arabisch)', multiline: true }),
        about: fields.text({ label: 'Über uns (Deutsch)', multiline: true }),
        about_en: fields.text({ label: 'Über uns (Englisch)', multiline: true }),
        about_ar: fields.text({ label: 'Über uns (Arabisch)', multiline: true }),
        logo: fields.image({ label: 'Logo', directory: 'src/assets/images/site', publicPath: '/src/assets/images/site/' }),
        heroImage: fields.image({ label: 'Großes Startbild', directory: 'src/assets/images/site', publicPath: '/src/assets/images/site/' }),
        aboutImage: fields.image({ label: 'Bild „Über uns"', directory: 'src/assets/images/site', publicPath: '/src/assets/images/site/' }),
        gallery: fields.array(
          fields.object({
            image: fields.image({ label: 'Bild', directory: 'src/assets/images/gallery', publicPath: '/src/assets/images/gallery/' }),
            alt: fields.text({ label: 'Bildbeschreibung (für Blinde & Google)' }),
          }),
          { label: 'Galerie', itemLabel: (p) => p.fields.alt.value || 'Bild' }
        ),
        colorBrand: fields.text({ label: 'Farbe: Hauptfarbe (Espresso)', defaultValue: '#2b1a12' }),
        colorAccent: fields.text({ label: 'Farbe: Akzent (Gold)', defaultValue: '#c49a52' }),
        colorHighlight: fields.text({ label: 'Farbe: Hervorhebung (Terrakotta)', defaultValue: '#a8432a' }),
        legalOwner: fields.text({ label: 'Impressum: Inhaber/in bzw. Firma' }),
        legalForm: fields.text({ label: 'Impressum: Rechtsform', description: 'z. B. Einzelunternehmen, GmbH' }),
        legalUid: fields.text({ label: 'Impressum: UID-Nummer' }),
        legalRegister: fields.text({ label: 'Impressum: Firmenbuchnummer & -gericht (falls vorhanden)' }),
        legalChamber: fields.text({ label: 'Impressum: Kammer', defaultValue: 'Wirtschaftskammer Kärnten, Fachgruppe Gastronomie' }),
        legalAuthority: fields.text({ label: 'Impressum: Gewerbebehörde' }),
        legalTrade: fields.text({ label: 'Impressum: Gewerbe', defaultValue: 'Gastgewerbe (Betriebsart Restaurant)' }),
      },
    }),
  },
});
