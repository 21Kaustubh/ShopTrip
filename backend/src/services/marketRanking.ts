/**
 * Market Ranking Service — India-First Configuration & Relevance Scoring
 *
 * Provides market-aware prioritization for external product discovery.
 * Prioritizes India-tagged catalogue records and recognized Indian-market brands
 * over unrelated international records.
 *
 * Grounding & Safety Principles:
 * 1. Open Food Facts country metadata (e.g. en:india) provides India-prioritized catalogue signals,
 *    distinguishable from independently confirmed merchant availability.
 * 2. GS1 "890" barcode prefix is NOT proof of sale in India — it indicates company registration
 *    origin, and is treated only as a weak supplementary ranking signal.
 * 3. Familiar Indian brand names are useful hints, but do not guarantee retailer stock.
 * 4. Transparent status: Products are categorized into India-tagged, Indian-brand, unknown, or international.
 * 5. Strict product-type relevance: Searching for "Tata Coffee" must never return "Tata Salt".
 */

export type MarketAvailability =
  | 'india_confirmed'
  | 'india_likely'
  | 'international'
  | 'unknown';

export interface MarketInfo {
  availability: MarketAvailability;
  badge: string;
  isIndiaRelevant: boolean;
  reason: string;
}

export interface CategoryDefinition {
  key: string;
  name: string;
  categoryKeyword: string;
  aliases: string[];
  tags: string[];
  priorityBrands: string[];
  productTypeModifiers: string[];
}

/**
 * Reusable category definitions for common Indian grocery searches.
 * Extensible to new categories without schema changes or database migrations.
 */
export const INDIAN_GROCERY_CATEGORIES: Record<string, CategoryDefinition> = {
  coffee: {
    key: 'coffee',
    name: 'Coffee',
    categoryKeyword: 'coffee',
    aliases: [
      'coffee',
      'coffee powder',
      'instant coffee',
      'filter coffee',
      'kaapi',
      'bru',
      'brew',
      'brew coffee',
      'brewed coffee',
      'nescafe',
      'nescafé',
      'tata coffee',
      'continental coffee',
      'chicory',
    ],
    tags: ['en:coffees', 'en:instant-coffees'],
    priorityBrands: [
      'bru',
      'nescafe',
      'nescafé',
      'tata',
      'tata coffee',
      'tata coffee grand',
      'continental',
      'continental coffee',
      'levista',
      'rage coffee',
      'blue tokai',
      'sleepy owl',
      'cothas',
      'minerva',
      'sunbean',
      'narayan',
      'colombian brew',
      'davidoff',
    ],
    productTypeModifiers: ['instant', 'powder', 'filter', 'gold', 'classic', 'sunrise', 'grand', 'xtra', 'strong', 'roast', 'beans'],
  },
  tea: {
    key: 'tea',
    name: 'Tea',
    categoryKeyword: 'tea',
    aliases: ['tea', 'chai', 'tea bags', 'green tea', 'black tea', 'assam tea', 'darjeeling'],
    tags: ['en:teas', 'en:black-teas', 'en:green-teas'],
    priorityBrands: [
      'tata tea',
      'tata',
      'tata tea gold',
      'taj mahal',
      'red label',
      'brooke bond',
      'lipton',
      'wagh bakri',
      'tetley',
      'society tea',
      'girnar',
      'chaayos',
    ],
    productTypeModifiers: ['gold', 'premium', 'dust', 'leaf', 'green', 'masala', 'bags'],
  },
  dairy: {
    key: 'dairy',
    name: 'Dairy',
    categoryKeyword: 'milk',
    aliases: ['milk', 'butter', 'ghee', 'paneer', 'cheese', 'curd', 'dahi', 'yogurt', 'cream'],
    tags: ['en:dairies', 'en:milks', 'en:butters', 'en:cheeses'],
    priorityBrands: [
      'amul',
      'mother dairy',
      'nandini',
      'gowardhan',
      'britannia',
      'milma',
      'verka',
      'aavin',
      'heritage',
      'nestle',
      'nestlé',
    ],
    productTypeModifiers: ['toned', 'full cream', 'pasteurized', 'cow', 'salted', 'unsalted'],
  },
  atta_flour: {
    key: 'atta_flour',
    name: 'Atta & Flours',
    categoryKeyword: 'atta',
    aliases: ['atta', 'flour', 'wheat flour', 'maida', 'sooji', 'rava', 'besan'],
    tags: ['en:flours', 'en:wheat-flours'],
    priorityBrands: [
      'aashirvaad',
      'fortune',
      'pillsbury',
      'shakti bhog',
      'annapurna',
      'patanjali',
      'tata sampann',
      'rajdhani',
    ],
    productTypeModifiers: ['sharbati', 'multigrain', 'whole wheat', 'chakki'],
  },
  rice: {
    key: 'rice',
    name: 'Rice & Grains',
    categoryKeyword: 'rice',
    aliases: ['rice', 'basmati', 'basmati rice', 'sona masoori', 'poha'],
    tags: ['en:rices', 'en:basmati-rices'],
    priorityBrands: [
      'daawat',
      'india gate',
      'kohinoor',
      'fortune',
      'lal qilla',
      'tata sampann',
      'patanjali',
      'aeroplane',
    ],
    productTypeModifiers: ['basmati', 'biryani', 'feast', 'super', 'classic', 'dubai'],
  },
  noodles_pasta: {
    key: 'noodles_pasta',
    name: 'Noodles & Pasta',
    categoryKeyword: 'noodle',
    aliases: ['noodles', 'maggi', 'instant noodles', 'pasta', 'vermicelli', 'yippee'],
    tags: ['en:noodles', 'en:instant-noodles'],
    priorityBrands: [
      'maggi',
      'yippee',
      'sunfeast yippee',
      'top ramen',
      'ching\'s secret',
      'chings',
      'knorr',
      'wai wai',
      'bambino',
    ],
    productTypeModifiers: ['masala', 'atta', 'instant', 'cuppa', 'spicy'],
  },
  snacks_biscuits: {
    key: 'snacks_biscuits',
    name: 'Biscuits & Snacks',
    categoryKeyword: 'biscuit',
    aliases: ['biscuits', 'cookies', 'chips', 'namkeen', 'bhujia', 'wafers'],
    tags: ['en:biscuits-and-cakes', 'en:biscuits', 'en:chips-and-fries'],
    priorityBrands: [
      'parle',
      'parle-g',
      'britannia',
      'haldiram\'s',
      'haldiram',
      'bikaji',
      'balaji',
      'lays',
      'kurkure',
      'bingo',
      'sunfeast',
    ],
    productTypeModifiers: ['marie', 'bourbon', 'good day', 'rusk', 'salted', 'cream'],
  },
  spices_oils: {
    key: 'spices_oils',
    name: 'Oils & Spices',
    categoryKeyword: 'oil',
    aliases: ['oil', 'cooking oil', 'mustard oil', 'sunflower oil', 'salt', 'masala', 'turmeric'],
    tags: ['en:edible-oils', 'en:salts', 'en:spices'],
    priorityBrands: [
      'tata salt',
      'fortune',
      'dhara',
      'saffola',
      'everest',
      'mdh',
      'catch',
      'aashirvaad',
      'patanjali',
      'gemini',
      'emami',
    ],
    productTypeModifiers: ['refined', 'kachi ghani', 'iodized', 'pure'],
  },
};

/**
 * Phonetic / common spelling expansions for search queries in Indian retail context.
 * Expands synonyms without destroying genuine queries (e.g. preserves "brew coffee" while
 * also querying "bru coffee" in parallel).
 */
export function normalizeSearchQuery(query: string): {
  primary: string;
  expandedTerms: string[];
  category?: CategoryDefinition;
} {
  const clean = query.trim().toLowerCase();
  const expanded: string[] = [];

  // Colloquial synonym: "brew" or "brew coffee" in Indian grocery is frequently BRU coffee,
  // but could also be brewed coffee. Keep primary as "brew coffee" and add "bru" / "bru coffee" to expansions!
  if (clean === 'brew' || clean === 'brew coffee' || clean === 'brewed coffee') {
    expanded.push('bru coffee', 'bru');
  } else if (clean.includes('brew') && !clean.includes('bru')) {
    expanded.push(clean.replace(/\bbrew\b/g, 'bru'));
  }

  // Accent normalisation: nescafe <-> nescafé
  if (clean.includes('nescafe')) {
    expanded.push(clean.replace(/nescafe/g, 'nescafé'));
  } else if (clean.includes('nescafé')) {
    expanded.push(clean.replace(/nescafé/g, 'nescafe'));
  }

  // Common descriptors: "coffee powder" or "instant coffee" -> also query "coffee"
  if (clean === 'coffee powder' || clean === 'instant coffee') {
    expanded.push('coffee');
  }

  // Find category match
  let matchedCategory: CategoryDefinition | undefined;
  for (const cat of Object.values(INDIAN_GROCERY_CATEGORIES)) {
    if (cat.aliases.some((alias) => clean === alias || clean.includes(alias))) {
      matchedCategory = cat;
      break;
    }
  }

  return {
    primary: clean,
    expandedTerms: expanded,
    category: matchedCategory,
  };
}

/**
 * Determine market availability strictly from actual product metadata.
 *
 * Rules:
 * - Country-of-sale metadata (e.g. "en:india" in countries_tags or "india" in countries)
 *   is the ONLY source that grants 'india_confirmed'.
 * - GS1 India "890" prefix is NOT proof of sale in India — it is only a supplementary signal.
 *   If a product has an 890 prefix but no country metadata and brand is unknown,
 *   its availability is 'unknown' (with an 890 annotation).
 * - Recognized Indian brand with unrecorded country is 'india_likely'.
 * - Non-India countries without India is 'international'.
 */
export function determineMarketAvailability(
  code: string,
  countriesTags?: string[],
  countries?: string,
  brandText?: string
): MarketInfo {
  const tags = Array.isArray(countriesTags) ? countriesTags : [];
  const cText = typeof countries === 'string' ? countries.toLowerCase() : '';
  const bLower = (brandText || '').toLowerCase();

  // 1. Explicit country-of-sale metadata confirmation (Strongest proof)
  const isIndiaTagged =
    tags.some((t) => t === 'en:india' || t === 'in') ||
    cText.includes('india');

  // GS1 India country prefix is 890 (registered with GS1 India, but does not prove domestic sale)
  const is890Prefix = typeof code === 'string' && code.startsWith('890') && code.length >= 8;

  if (isIndiaTagged) {
    return {
      availability: 'india_confirmed',
      badge: 'India Tagged',
      isIndiaRelevant: true,
      reason: 'Sourced from Open Food Facts country metadata (india / en:india)',
    };
  }

  // 2. Recognized Indian-market brand (country unconfirmed)
  const isKnownIndiaBrand = Object.values(INDIAN_GROCERY_CATEGORIES).some((cat) =>
    cat.priorityBrands.some((pBrand) => bLower.includes(pBrand))
  );

  if (isKnownIndiaBrand) {
    return {
      availability: 'india_likely',
      badge: 'Indian Market Brand',
      isIndiaRelevant: true,
      reason: is890Prefix
        ? 'Recognized Indian-market brand (GS1 890 registered, country of sale unrecorded)'
        : 'Recognized Indian-market brand (country of sale unrecorded)',
    };
  }

  // 3. 890 prefix alone without country metadata or recognized brand is UNKNOWN
  if (is890Prefix) {
    return {
      availability: 'unknown',
      badge: 'GS1 890 Prefix',
      isIndiaRelevant: false,
      reason: 'GS1 890 prefix registered in India; domestic availability not recorded in catalogue',
    };
  }

  // 4. Explicit foreign countries without India
  if (tags.length > 0) {
    const foreignNames = tags
      .map((t) => t.replace(/^en:/, '').replace(/-/g, ' '))
      .slice(0, 2)
      .join(', ');

    return {
      availability: 'international',
      badge: 'International',
      isIndiaRelevant: false,
      reason: `Recorded in overseas markets (${foreignNames})`,
    };
  }

  // 5. Missing country metadata
  return {
    availability: 'unknown',
    badge: 'Market Unspecified',
    isIndiaRelevant: false,
    reason: 'Country of sale not recorded in catalogue metadata',
  };
}

/**
 * Score a product candidate for relevance to Indian shoppers.
 * Transparent, weighted ranking that guards against false matches.
 */
export function scoreProductForIndiaMarket(
  query: string,
  product: {
    barcode: string;
    productName: string;
    brand: string;
    market: MarketInfo;
    sizeInfo?: string | null;
    imageUrl?: string | null;
  },
  categoryMatch?: CategoryDefinition
): number {
  let score = 0;
  const qLower = query.toLowerCase().trim();
  const nameLower = (product.productName || '').toLowerCase();
  const brandLower = (product.brand || '').toLowerCase();
  const is890 = typeof product.barcode === 'string' && product.barcode.startsWith('890');

  // ── A. Market Status Priority ──────────────────────────────────────────────
  if (product.market.availability === 'india_confirmed') {
    score += 2000; // Strongest signal: genuine country-of-sale metadata
  } else if (product.market.availability === 'india_likely') {
    score += 900; // Recognized Indian brand
  } else if (product.market.availability === 'international') {
    score -= 1500; // Downrank overseas items so local items appear first
  }

  // Supplementary weak signal for GS1 890 prefix
  if (is890) {
    score += 200; // Weak boost only, never definitive
  }

  // ── B. Product-Type & Category Relevance (CRITICAL GUARD) ──────────────────
  // If the user's query specifically includes a product-type keyword (e.g. "coffee", "tea", "salt"),
  // products that do NOT match that product type must receive a severe penalty!
  const productTypeKeywords = [
    'coffee',
    'tea',
    'milk',
    'butter',
    'ghee',
    'paneer',
    'cheese',
    'atta',
    'rice',
    'noodle',
    'noodles',
    'biscuit',
    'biscuits',
    'oil',
    'salt',
    'sugar',
    'soap',
    'shampoo',
  ];

  const matchedKeywordsInQuery = productTypeKeywords.filter((kw) => qLower.includes(kw));

  if (matchedKeywordsInQuery.length > 0) {
    const candidateText = `${nameLower} ${brandLower}`;
    const matchesProductType = matchedKeywordsInQuery.some((kw) => candidateText.includes(kw));

    if (matchesProductType) {
      score += 700;
    } else {
      // Severe penalty: e.g. "Tata Salt" appearing for "Tata Coffee"
      score -= 1800;
    }
  }

  // ── C. Brand Relevance & Spelling Variants ─────────────────────────────────
  // Exact brand match
  if (brandLower === qLower) {
    score += 900;
  } else if (brandLower.includes(qLower) || qLower.includes(brandLower)) {
    score += 500;
  }

  // Exact product name match
  if (nameLower === qLower) {
    score += 900;
  } else if (nameLower.startsWith(qLower)) {
    score += 450;
  } else if (nameLower.includes(qLower)) {
    score += 250;
  }

  // Multi-word token matching
  const tokens = qLower.split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length > 1) {
    let matchedTokenCount = 0;
    for (const token of tokens) {
      if (nameLower.includes(token) || brandLower.includes(token)) {
        matchedTokenCount++;
        score += 150;
      }
    }
    // All tokens present in candidate
    if (matchedTokenCount === tokens.length) {
      score += 600;
    }
  }

  // Phonetic / Brand Synonym: "brew" <-> "bru"
  if (qLower.includes('brew') && (brandLower.includes('bru') || nameLower.includes('bru'))) {
    score += 400;
  }
  if (qLower.includes('bru') && (brandLower.includes('bru') || nameLower.includes('bru'))) {
    score += 600;
  }

  // Priority brand boost within the matched category
  if (categoryMatch) {
    const isPriorityBrand = categoryMatch.priorityBrands.some((pBrand) =>
      brandLower.includes(pBrand)
    );
    if (isPriorityBrand) {
      score += 400;
    }

    // Product type modifier match (e.g. "instant", "powder", "gold", "sunrise")
    const modifierMatch = categoryMatch.productTypeModifiers.some(
      (mod) => qLower.includes(mod) && (nameLower.includes(mod) || brandLower.includes(mod))
    );
    if (modifierMatch) {
      score += 300;
    }
  }

  // ── D. Completeness signals ───────────────────────────────────────────────
  if (product.imageUrl) score += 60;
  if (product.sizeInfo) score += 40;
  if (product.productName.length > 3) score += 40;

  return score;
}
