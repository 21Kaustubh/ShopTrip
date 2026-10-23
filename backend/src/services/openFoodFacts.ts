/**
 * Open Food Facts API service with India-First Market Prioritization
 *
 * Uses the official OFF v3 product-by-barcode endpoint:
 *   https://world.openfoodfacts.org/api/v3/product/<barcode>
 *
 * And the official OFF full-text Search service (Search-a-licious)
 * combined with targeted Indian market category retrieval:
 *   https://search.openfoodfacts.org/search?q=<query>&page_size=<n>
 *   https://world.openfoodfacts.net/api/v2/search?...&countries_tags_en=india
 *
 * Attribution: Product information sourced from Open Food Facts
 * (https://world.openfoodfacts.org), an open, collaborative database
 * of food products worldwide. Data is licensed under the
 * Open Database License (ODbL). Individual contents are available under
 * the Database Contents License (DbCL).
 * See: https://world.openfoodfacts.org/terms-of-use
 */

import {
  determineMarketAvailability,
  normalizeSearchQuery,
  scoreProductForIndiaMarket,
  type MarketAvailability,
} from './marketRanking.js';

const OFF_BASE = 'https://world.openfoodfacts.org';
const OFF_SEARCH_BASE = 'https://search.openfoodfacts.org';
const OFF_V2_BASE = 'https://world.openfoodfacts.net';
const USER_AGENT = 'ShopTrip/0.1 (https://github.com/21Kaustubh/ShopTrip)';
const REQUEST_TIMEOUT_MS = 10_000;
const SEARCH_TIMEOUT_MS = 14_000;

/** Fields requested from Open Food Facts */
const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'quantity',
  'categories_tags',
  'countries_tags',
  'countries',
  'image_front_small_url',
  'image_front_url',
].join(',');

// ─── Internal types ─────────────────────────────────────────────────────────

interface OffRawProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string | string[];
  quantity?: string;
  categories_tags?: string[];
  countries_tags?: string[];
  countries?: string;
  image_front_small_url?: string;
  image_front_url?: string;
}

/** Normalised product metadata returned by this service */
export interface OFFProduct {
  barcode: string;
  productName: string;
  brand: string;
  sizeInfo: string | null;
  /** Broadest human-readable category */
  category: string;
  imageUrl: string | null;
  /** Attribution note that must be surfaced to the user */
  attribution: string;
  /** Market availability confirmation based strictly on metadata */
  marketAvailability: MarketAvailability;
  marketBadge: string;
  marketReason: string;
  countries: string[];
}

export interface CatalogueSearchResult {
  results: OFFProduct[];
  totalMatches: number;
  indiaCount: number;
  internationalCount: number;
  hasInternationalAvailable: boolean;
  attribution: string;
  source: 'open_food_facts';
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeHeaders(): Record<string, string> {
  return {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
  };
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

function extractCategory(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return 'General';
  const enTag = tags.find((t) => t.startsWith('en:'));
  if (!enTag) return 'General';
  const raw = enTag.replace(/^en:/, '').replace(/-/g, ' ');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function safeString(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && value.length > 0) {
    return value.filter((v) => typeof v === 'string').join(', ').trim();
  }
  return '';
}

function mapRawProduct(raw: OffRawProduct, barcode: string): OFFProduct | null {
  const productName = safeString(raw.product_name_en) || safeString(raw.product_name);
  if (!productName) return null;

  const code = safeString(raw.code) || barcode;
  const brand = safeString(raw.brands) || 'Unknown Brand';
  const countriesTags = Array.isArray(raw.countries_tags) ? raw.countries_tags : [];
  const countriesStr = safeString(raw.countries);

  const market = determineMarketAvailability(code, countriesTags, countriesStr, brand);

  return {
    barcode: code,
    productName,
    brand,
    sizeInfo: safeString(raw.quantity) || null,
    category: extractCategory(raw.categories_tags),
    imageUrl: safeString(raw.image_front_small_url) || safeString(raw.image_front_url) || null,
    attribution:
      'Product information sourced from Open Food Facts (openfoodfacts.org) — Open Database License (ODbL).',
    marketAvailability: market.availability,
    marketBadge: market.badge,
    marketReason: market.reason,
    countries: countriesTags,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Look up a single product by EAN/UPC barcode using Open Food Facts v3 API.
 */
export async function fetchProductByBarcode(
  barcode: string
): Promise<OFFProduct | null> {
  const url = `${OFF_BASE}/api/v3/product/${encodeURIComponent(barcode)}?fields=${PRODUCT_FIELDS}`;

  try {
    const response = await fetch(url, {
      headers: makeHeaders(),
      signal: withTimeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      console.warn(`[OFF] Barcode ${barcode}: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { status?: string; product?: OffRawProduct };
    if (!data || data.status !== 'success' || !data.product) return null;

    return mapRawProduct(data.product, barcode);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[OFF] Barcode lookup failed for ${barcode}: ${msg}`);
    return null;
  }
}

/**
 * Search the OFF product catalogue with India-First ranking and deduplication.
 */
export async function searchOffCatalogue(
  query: string,
  options: { limit?: number; includeInternational?: boolean } = {}
): Promise<CatalogueSearchResult> {
  const limit = Math.min(Math.max(options.limit ?? 15, 1), 30);
  const includeInternational = Boolean(options.includeInternational);

  const normalized = normalizeSearchQuery(query);
  const { primary, expandedTerms, category } = normalized;

  // Bounded candidate fetches
  const fetches: Promise<{ hits?: OffRawProduct[]; products?: OffRawProduct[] } | null>[] = [];

  // 1. Primary full-text search (Search-a-licious)
  fetches.push(
    fetch(`${OFF_SEARCH_BASE}/search?q=${encodeURIComponent(primary)}&page_size=25`, {
      headers: makeHeaders(),
      signal: withTimeout(SEARCH_TIMEOUT_MS),
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ hits?: OffRawProduct[]; products?: OffRawProduct[] }>) : null))
      .catch((err) => {
        console.warn(`[OFF] Primary search failed for "${primary}":`, err?.message || err);
        return null;
      })
  );

  // 2. If phonetic expansion exists (e.g. "brew coffee" -> "bru coffee"), query expanded term
  if (expandedTerms.length > 0) {
    fetches.push(
      fetch(`${OFF_SEARCH_BASE}/search?q=${encodeURIComponent(expandedTerms[0])}&page_size=20`, {
        headers: makeHeaders(),
        signal: withTimeout(SEARCH_TIMEOUT_MS),
      })
        .then((r) => (r.ok ? (r.json() as Promise<{ hits?: OffRawProduct[]; products?: OffRawProduct[] }>) : null))
        .catch(() => null)
    );
  }

  // 3. If category is recognized, query India-specific products for that category on v2
  if (category && category.tags.length > 0) {
    const categoryTag = category.tags[0].replace(/^en:/, '');
    const v2Url = `${OFF_V2_BASE}/api/v2/search?categories_tags_en=${encodeURIComponent(
      categoryTag
    )}&countries_tags_en=india&fields=${PRODUCT_FIELDS}&page_size=25`;

    fetches.push(
      fetch(v2Url, {
        headers: makeHeaders(),
        signal: withTimeout(SEARCH_TIMEOUT_MS),
      })
        .then((r) => (r.ok ? (r.json() as Promise<{ hits?: OffRawProduct[]; products?: OffRawProduct[] }>) : null))
        .catch((err) => {
          console.warn(`[OFF] India category search failed for "${categoryTag}":`, err?.message || err);
          return null;
        })
    );
  }

  const responses = await Promise.all(fetches);

  // Deduplicate products by barcode
  const candidateMap = new Map<string, { product: OFFProduct; score: number }>();

  for (const resp of responses) {
    if (!resp) continue;
    const rawList = resp.hits || resp.products || [];
    if (!Array.isArray(rawList)) continue;

    for (const raw of rawList) {
      const code = safeString(raw.code);
      if (!code || candidateMap.has(code)) continue;

      const mapped = mapRawProduct(raw, code);
      if (!mapped) continue;

      const score = scoreProductForIndiaMarket(
        primary,
        {
          barcode: mapped.barcode,
          productName: mapped.productName,
          brand: mapped.brand,
          market: {
            availability: mapped.marketAvailability,
            badge: mapped.marketBadge,
            isIndiaRelevant:
              mapped.marketAvailability === 'india_confirmed' ||
              mapped.marketAvailability === 'india_likely',
            reason: mapped.marketReason,
          },
          sizeInfo: mapped.sizeInfo,
          imageUrl: mapped.imageUrl,
        },
        category
      );

      candidateMap.set(code, { product: mapped, score });
    }
  }

  // Sort candidates by score descending
  const sorted = Array.from(candidateMap.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  const indiaResults = sorted.filter(
    (p) => p.marketAvailability === 'india_confirmed' || p.marketAvailability === 'india_likely'
  );
  const internationalResults = sorted.filter(
    (p) => p.marketAvailability === 'international' || p.marketAvailability === 'unknown'
  );

  const indiaCount = indiaResults.length;
  const internationalCount = internationalResults.length;
  const totalMatches = sorted.length;

  let results: OFFProduct[];

  if (includeInternational) {
    // Return combined results: India-relevant first, then international
    results = sorted.slice(0, limit);
  } else {
    // India-only default mode: only show confirmed or likely India products
    results = indiaResults.slice(0, limit);
  }

  return {
    results,
    totalMatches,
    indiaCount,
    internationalCount,
    hasInternationalAvailable: internationalCount > 0,
    attribution:
      'Product information sourced from Open Food Facts (openfoodfacts.org) — Open Database License (ODbL).',
    source: 'open_food_facts',
  };
}
