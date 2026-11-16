/** Die 14 Hauptallergene nach EU-Verordnung 1169/2011, Kennzeichnung A–R gemäß österreichischer Codex-Empfehlung. */
export const ALLERGENS = {
  A: { de: 'Glutenhaltiges Getreide', en: 'Cereals containing gluten', ar: 'الحبوب المحتوية على الغلوتين' },
  B: { de: 'Krebstiere', en: 'Crustaceans', ar: 'القشريات' },
  C: { de: 'Eier', en: 'Eggs', ar: 'البيض' },
  D: { de: 'Fisch', en: 'Fish', ar: 'السمك' },
  E: { de: 'Erdnüsse', en: 'Peanuts', ar: 'الفول السوداني' },
  F: { de: 'Soja', en: 'Soybeans', ar: 'الصويا' },
  G: { de: 'Milch & Laktose', en: 'Milk & lactose', ar: 'الحليب واللاكتوز' },
  H: { de: 'Schalenfrüchte (Nüsse)', en: 'Tree nuts', ar: 'المكسرات' },
  L: { de: 'Sellerie', en: 'Celery', ar: 'الكرفس' },
  M: { de: 'Senf', en: 'Mustard', ar: 'الخردل' },
  N: { de: 'Sesam', en: 'Sesame', ar: 'السمسم' },
  O: { de: 'Schwefeldioxid & Sulfite', en: 'Sulphur dioxide & sulphites', ar: 'ثاني أكسيد الكبريت والكبريتات' },
  P: { de: 'Lupinen', en: 'Lupin', ar: 'الترمس' },
  R: { de: 'Weichtiere', en: 'Molluscs', ar: 'الرخويات' },
} as const;

export type AllergenCode = keyof typeof ALLERGENS;
export const ALLERGEN_CODES = Object.keys(ALLERGENS) as AllergenCode[];
