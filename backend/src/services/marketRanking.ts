/**
 * Market Ranking Service — India-First Configuration & Relevance Scoring
 *
 * Provides market-aware prioritization for external product discovery.
 * Prioritizes India-verified products and recognized Indian-market brands
 * over unrelated international records.
 *
 * No fake data: Every score is derived from genuine Open Food Facts source
 * metadata (countries_tags, countries, barcode prefix, brands, categories).
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
  aliases: string[];
  tags: string[];
  priorityBrands: string[];
}

/**
 * Reusable category definitions for common Indian grocery searches.
 * Extensible to new categories without schema changes or database migrations.
 */
export const INDIAN_GROCERY_CATEGORIES: Record<string, CategoryDefinition> = {
  coffee: {
    key: 'coffee',
    name: 'Coffee',
    aliases: [
      'coffee',
      'coffee powder',
      'instant coffee',
      'filter coffee',
      'bru',
      'brew',
      'brew coffee',
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
    ],
  },
  tea: {
    key: 'tea',
    name: 'Tea',
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
  },
  dairy: {
    key: 'dairy',
    name: 'Dairy',
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
  },
  atta_flour: {
    key: 'atta_flour',
    name: 'Atta & Flours',
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
  },
  rice: {
    key: 'rice',
    name: 'Rice & Grains',
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
  },
  noodles_pasta: {
    key: 'noodles_pasta',
    name: 'Noodles & Pasta',
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
  },
  snacks_biscuits: {
    key: 'snacks_biscuits',
    name: 'Biscuits & Snacks',
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
  },
  spices_oils: {
    key: 'spices_oils',
    name: 'Oils & Spices',
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
  },
};

/**
 * Phonetic / common spelling expansions for search queries in Indian retail context.
 */
export function normalizeSearchQuery(query: string): {
  primary: string;
  expandedTerms: string[];
  category?: CategoryDefinition;
} {
  const clean = query.trim().toLowerCase();
  const expanded: string[] = [];

  // Phonetic alias: 'brew' or 'brew coffee' often refers to BRU in India
  if (clean === 'brew' || clean === 'brew coffee') {
    expanded.push('bru coffee', 'bru');
  } else if (clean.includes('brew')) {
    expanded.push(clean.replace(/\bbrew\b/g, 'bru'));
  }

  // Accent normalisation: nescafe <-> nescafé
  if (clean.includes('nescafe')) {
    expanded.push(clean.replace('nescafe', 'nescafé'));
  } else if (clean.includes('nescafé')) {
    expanded.push(clean.replace('nescafé', 'nescafe'));
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
 * Does not guess or fabricate country verification.
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

  // 1. Explicit country metadata confirmation
  const isIndiaTagged =
    tags.some((t) => t === 'en:india' || t === 'in') ||
    cText.includes('india');

  // GS1 India country prefix is 890 (standard EAN-13 assigned to companies registered in India)
  const is890Prefix = typeof code === 'string' && code.startsWith('890') && code.length >= 8;

  if (isIndiaTagged) {
    return {
      availability: 'india_confirmed',
      badge: 'India Market',
      isIndiaRelevant: true,
      reason: 'Confirmed by source country metadata',
    };
  }

  if (is890Prefix) {
    return {
      availability: 'india_confirmed',
      badge: 'India Market (890 EAN)',
      isIndiaRelevant: true,
      reason: 'GS1 India registered barcode',
    };
  }

  // 2. Known Indian-market brand (country unconfirmed)
  const isKnownIndiaBrand = Object.values(INDIAN_GROCERY_CATEGORIES).some((cat) =>
    cat.priorityBrands.some((pBrand) => bLower.includes(pBrand))
  );

  if (isKnownIndiaBrand) {
    return {
      availability: 'india_likely',
      badge: 'India-Market Brand',
      isIndiaRelevant: true,
      reason: 'Brand recognized in Indian market (country unconfirmed)',
    };
  }

  // 3. Explicit foreign countries without India
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

  // 4. Missing country metadata
  return {
    availability: 'unknown',
    badge: 'Market Unspecified',
    isIndiaRelevant: false,
    reason: 'Country availability not recorded in source metadata',
  };
}

/**
 * Score a product candidate for relevance to Indian shoppers.
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

  // ── A. Market Status Priority (Crucial weighting) ──────────────────────────
  if (product.market.availability === 'india_confirmed') {
    score += 2500;
  } else if (product.market.availability === 'india_likely') {
    score += 1200;
  } else if (product.market.availability === 'international') {
    // Strongly downrank overseas items so local items appear first
    score -= 1500;
  }

  // ── B. Query Relevance ────────────────────────────────────────────────────
  // Exact matches
  if (nameLower === qLower) score += 900;
  if (brandLower === qLower) score += 700;

  // Name starts with or contains query
  if (nameLower.startsWith(qLower)) score += 500;
  else if (nameLower.includes(qLower)) score += 300;

  // Brand match
  if (brandLower.includes(qLower)) score += 400;

  // Token matching for multi-word queries
  const tokens = qLower.split(/\s+/).filter((t) => t.length > 1);
  for (const token of tokens) {
    if (nameLower.includes(token)) score += 150;
    if (brandLower.includes(token)) score += 150;
  }

  // Distinctive token check: if query has specific modifiers (e.g. "bru", "nescafe", "guatemala")
  const commonCategoryWords = new Set(['coffee', 'tea', 'chai', 'powder', 'instant', 'beans', 'filter', 'packet', 'pack']);
  const distinctiveTokens = tokens.filter((t) => !commonCategoryWords.has(t));
  if (distinctiveTokens.length > 0) {
    const hasDistinctiveMatch = distinctiveTokens.some(
      (t) => nameLower.includes(t) || brandLower.includes(t)
    );
    if (hasDistinctiveMatch) {
      score += 800;
    } else {
      // Penalize candidates that do not match the specific modifier
      score -= 600;
    }
  }

  // Priority brand boost within the matched category
  if (categoryMatch) {
    const isPriorityBrand = categoryMatch.priorityBrands.some((pBrand) =>
      brandLower.includes(pBrand)
    );
    if (isPriorityBrand) {
      score += 400;
    }
  }

  // ── C. Completeness signals ───────────────────────────────────────────────
  if (product.imageUrl) score += 60;
  if (product.sizeInfo) score += 30;
  if (product.productName.length > 3) score += 40;

  return score;
}
