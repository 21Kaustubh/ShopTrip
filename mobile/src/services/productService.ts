export type Product = {
  id?: string;
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  weight?: string;
  unit?: string;
  sizeInfo?: string;
  imageUrl?: string | null;
  verificationStatus?: string;
  /** Attribution notice required when source is Open Food Facts */
  attribution?: string;
  /** Where this result came from */
  source?: 'local' | 'open_food_facts';
  /** India-First market availability status */
  marketAvailability?: 'india_confirmed' | 'india_likely' | 'international' | 'unknown';
  marketBadge?: string;
  marketReason?: string;
  countries?: string[];
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

function mapProduct(p: Record<string, unknown>, source?: string, attribution?: string): Product {
  const sizeInfo = typeof p.sizeInfo === 'string' ? p.sizeInfo : '';
  const countries = Array.isArray(p.countries) ? p.countries.map(String) : [];

  return {
    id: typeof p.id === 'string' ? p.id : undefined,
    barcode: String(p.barcode ?? ''),
    productName: String(p.productName ?? ''),
    brand: String(p.brand ?? ''),
    category: String(p.category ?? 'General'),
    sizeInfo,
    weight: sizeInfo ? sizeInfo.split(' ')[0] : '',
    unit: sizeInfo ? sizeInfo.split(' ')[1] || '' : '',
    imageUrl: typeof p.imageUrl === 'string' ? p.imageUrl : null,
    verificationStatus: typeof p.verificationStatus === 'string' ? p.verificationStatus : undefined,
    source: (source as Product['source']) ?? 'local',
    attribution: typeof attribution === 'string' ? attribution : undefined,
    marketAvailability: (p.marketAvailability as Product['marketAvailability']) ?? undefined,
    marketBadge: typeof p.marketBadge === 'string' ? p.marketBadge : undefined,
    marketReason: typeof p.marketReason === 'string' ? p.marketReason : undefined,
    countries,
  };
}

/**
 * Look up a product in the database by its barcode via the backend API.
 * Falls back to Open Food Facts automatically when the local DB has no record.
 * Returns null if genuinely unknown or if an error occurs.
 * Never fabricates or falls back to hardcoded mock products.
 */
export async function getProductByBarcode(
  barcode: string
): Promise<Product | null> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(
      `${API_BASE_URL}/products/barcode/${encodeURIComponent(cleanBarcode)}`,
      { headers: { Accept: 'application/json' }, signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.status === 404) return null;
    if (!response.ok) {
      console.warn(`[productService] API ${response.status} for barcode ${cleanBarcode}`);
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;
    if (!data.found || !data.product) return null;

    return mapProduct(
      data.product as Record<string, unknown>,
      typeof data.source === 'string' ? data.source : 'local',
      typeof data.attribution === 'string' ? data.attribution : undefined
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[productService] Network request failed for barcode ${cleanBarcode}:`, msg);
    return null;
  }
}

/**
 * Search the local product catalogue in the database via the backend API.
 * Returns an array of matching products, or empty array when nothing matches.
 * Never fabricates results when the database is empty.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const searchQuery = query.trim();
  if (!searchQuery) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);

    const response = await fetch(
      `${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}`,
      { headers: { Accept: 'application/json' }, signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[productService] Search returned status ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { results?: unknown[] };
    if (!Array.isArray(data.results)) return [];

    return data.results.map((p) => mapProduct(p as Record<string, unknown>, 'local'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[productService] Search request failed:', msg);
    return [];
  }
}

export interface CatalogueSearchResponse {
  results: Product[];
  totalMatches: number;
  indiaCount: number;
  internationalCount: number;
  hasInternationalAvailable: boolean;
  includeInternational: boolean;
  attribution?: string;
}

/**
 * User-initiated external catalogue search via Open Food Facts (through backend).
 * Defaults to India-first results. Set includeInternational: true to view all.
 * Results carry attribution metadata and must not be treated as verified DB records.
 */
export async function searchExternalCatalogue(
  query: string,
  includeInternational = false
): Promise<CatalogueSearchResponse> {
  const searchQuery = query.trim();
  if (!searchQuery) {
    return {
      results: [],
      totalMatches: 0,
      indiaCount: 0,
      internationalCount: 0,
      hasInternationalAvailable: false,
      includeInternational: false,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14_000);

    const intlParam = includeInternational ? '&includeInternational=true' : '';
    const response = await fetch(
      `${API_BASE_URL}/products/catalogue/search?q=${encodeURIComponent(searchQuery)}${intlParam}`,
      { headers: { Accept: 'application/json' }, signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[productService] Catalogue search returned status ${response.status}`);
      return {
        results: [],
        totalMatches: 0,
        indiaCount: 0,
        internationalCount: 0,
        hasInternationalAvailable: false,
        includeInternational,
      };
    }

    const data = (await response.json()) as {
      results?: unknown[];
      totalMatches?: number;
      indiaCount?: number;
      internationalCount?: number;
      hasInternationalAvailable?: boolean;
      includeInternational?: boolean;
      attribution?: string;
    };

    if (!Array.isArray(data.results)) {
      return {
        results: [],
        totalMatches: 0,
        indiaCount: 0,
        internationalCount: 0,
        hasInternationalAvailable: false,
        includeInternational,
      };
    }

    const attribution = typeof data.attribution === 'string' ? data.attribution : undefined;
    const results = data.results.map((p) =>
      mapProduct(p as Record<string, unknown>, 'open_food_facts', attribution)
    );

    return {
      results,
      totalMatches: typeof data.totalMatches === 'number' ? data.totalMatches : results.length,
      indiaCount: typeof data.indiaCount === 'number' ? data.indiaCount : 0,
      internationalCount: typeof data.internationalCount === 'number' ? data.internationalCount : 0,
      hasInternationalAvailable: Boolean(data.hasInternationalAvailable),
      includeInternational: Boolean(data.includeInternational),
      attribution,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[productService] Catalogue search failed:', msg);
    return {
      results: [],
      totalMatches: 0,
      indiaCount: 0,
      internationalCount: 0,
      hasInternationalAvailable: false,
      includeInternational,
    };
  }
}
