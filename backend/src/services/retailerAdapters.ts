/**
 * Retailer Integration Adapters — ShopTrip India-First Commerce
 *
 * Configurable, typed adapters for Indian quick-commerce and marketplace destinations:
 * - Blinkit (Quick Commerce)
 * - Zepto (Quick Commerce)
 * - Swiggy Instamart (Quick Commerce)
 * - Flipkart Minutes (Quick Commerce)
 * - Amazon Now (Quick Commerce)
 * - Amazon India (Marketplace)
 * - Flipkart (Marketplace)
 * - BigBasket (Hypermarket)
 * - DMart Ready (Hypermarket)
 * - JioMart (Hypermarket)
 * - Myntra (Marketplace — fashion)
 * - AJIO (Marketplace — fashion)
 * - Nykaa (Marketplace — beauty/personal care)
 *
 * Design principles:
 * 1. Honest capabilities: Distinguishes outbound search links from live API offers.
 * 2. Safe URL construction: Uses verified, working search URL patterns with real product metadata.
 * 3. Secrets protection: Checks credentials safely without printing values.
 * 4. Extensibility: Configurable registry allows adding more retailers without schema migrations.
 */

export type RetailerPlatformType = 'quick_commerce' | 'marketplace' | 'hypermarket';

export type RetailerIntegrationStatus =
  | 'link_only'
  | 'affiliate_link'
  | 'catalogue_api'
  | 'live_offer_api';

export interface RetailerProductQuery {
  productName: string;
  brand?: string | null;
  sizeInfo?: string | null;
  barcode?: string | null;
  category?: string | null;
}

export interface RetailerOfferResult {
  id?: string;
  retailerId: string;
  retailerName: string;
  productName: string;
  packSize?: string | null;
  price: number;
  currency: string;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'CHECK_AT_RETAILER';
  productUrl?: string;
  lastChecked: string;
  source: 'VERIFIED_DB' | 'PARTNER_API' | 'AFFILIATE_FEED' | 'MANUAL_VERIFIED';
  isVerifiedOffer: true;
  isComparableVariant?: boolean;
  variantNote?: string;
}

export interface OutboundRetailerAction {
  retailerId: string;
  retailerName: string;
  displayName: string;
  platformType: RetailerPlatformType;
  homeUrl: string;
  searchUrl: string;
  actionLabel: string;
  isLiveApiConfigured: boolean;
  integrationStatus: 'search_link_only' | 'live_offers_active';
  statusNote: string;
}

export interface RetailerComparisonPayload {
  barcode: string;
  productName: string;
  brand: string;
  sizeInfo: string | null;
  category: string;
  verifiedOffers: RetailerOfferResult[];
  retailerActions: OutboundRetailerAction[];
  hasVerifiedOffers: boolean;
  lowestVerifiedPrice: number | null;
  lowestPriceRetailer: string | null;
  disclaimer: string;
}

export interface RetailerAdapter {
  id: string;
  name: string;
  displayName: string;
  platformType: RetailerPlatformType;
  homeUrl: string;
  integrationCapability: RetailerIntegrationStatus;
  isLiveApiConfigured: () => boolean;
  getPartnerStatusNote: () => string;
  buildSearchUrl: (query: RetailerProductQuery) => string;
  getOutboundActionLabel: () => string;
}

/**
 * Clean and combine product metadata for high-precision retailer search.
 * Avoids duplicate brand mentions (e.g. "Bru Bru Instant Coffee").
 * Uses a safe, case-insensitive prefix comparison without regex-special character vulnerabilities.
 */
export function buildCleanSearchTerm(product: RetailerProductQuery): string {
  const brand = (product.brand || '').trim();
  let name = (product.productName || '').trim();
  const size = (product.sizeInfo || '').trim();

  // If brand is not already the leading prefix of the product name, prepend it safely
  if (brand && brand.toLowerCase() !== 'unknown') {
    const brandLower = brand.toLowerCase();
    const nameLower = name.toLowerCase();

    const alreadyStartsWithBrand =
      nameLower === brandLower ||
      (nameLower.startsWith(brandLower) &&
        (name.length === brand.length || /[\s\-_]/.test(name.charAt(brand.length))));

    if (!alreadyStartsWithBrand) {
      name = `${brand} ${name}`;
    }
  }

  // Append package size if present and not already mentioned
  if (size && !name.toLowerCase().includes(size.toLowerCase())) {
    name = `${name} ${size}`;
  }

  return name.trim();
}

// ─── Concrete Adapters ────────────────────────────────────────────────────────

export const BlinkitAdapter: RetailerAdapter = {
  id: 'blinkit',
  name: 'Blinkit',
  displayName: 'Blinkit',
  platformType: 'quick_commerce',
  homeUrl: 'https://blinkit.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.BLINKIT_PARTNER_API_KEY);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Blinkit Partner API'
      : 'Outbound search link active. Live pricing requires authorized merchant partner access.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://blinkit.com/s/?q=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string {
    return 'Check on Blinkit';
  },
};

export const ZeptoAdapter: RetailerAdapter = {
  id: 'zepto',
  name: 'Zepto',
  displayName: 'Zepto',
  platformType: 'quick_commerce',
  homeUrl: 'https://www.zeptonow.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.ZEPTO_PARTNER_API_KEY);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Zepto Partner API'
      : 'Outbound search link active. Live pricing requires Zepto partner credentials.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.zeptonow.com/search?query=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string {
    return 'Check on Zepto';
  },
};

export const InstamartAdapter: RetailerAdapter = {
  id: 'instamart',
  name: 'Swiggy Instamart',
  displayName: 'Swiggy Instamart',
  platformType: 'quick_commerce',
  homeUrl: 'https://www.swiggy.com/instamart',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.SWIGGY_INSTAMART_API_KEY);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Swiggy Partner API'
      : 'Outbound search link active. Live pricing requires Swiggy Instamart partner access.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string {
    return 'Check on Instamart';
  },
};

export const AmazonIndiaAdapter: RetailerAdapter = {
  id: 'amazon_in',
  name: 'Amazon India',
  displayName: 'Amazon India',
  platformType: 'marketplace',
  homeUrl: 'https://www.amazon.in',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.AMAZON_PAAPI_KEY && process.env.AMAZON_PAAPI_SECRET);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Amazon Product Advertising API'
      : 'Outbound search link active. Live pricing requires Amazon PA-API credentials & associate tag.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.amazon.in/s?k=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string {
    return 'Check on Amazon';
  },
};

export const FlipkartAdapter: RetailerAdapter = {
  id: 'flipkart',
  name: 'Flipkart',
  displayName: 'Flipkart',
  platformType: 'marketplace',
  homeUrl: 'https://www.flipkart.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Flipkart Affiliate API'
      : 'Outbound search link active. Live pricing requires Flipkart Affiliate credentials.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.flipkart.com/search?q=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string {
    return 'Check on Flipkart';
  },
};

export const BigBasketAdapter: RetailerAdapter = {
  id: 'bigbasket',
  name: 'BigBasket',
  displayName: 'BigBasket',
  platformType: 'hypermarket',
  homeUrl: 'https://www.bigbasket.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean { return false; },
  getPartnerStatusNote(): string {
    return 'Outbound search link active. Live pricing requires BigBasket partner access.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.bigbasket.com/ps/?q=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string { return 'Check on BigBasket'; },
};

export const FlipkartMinutesAdapter: RetailerAdapter = {
  id: 'flipkart_minutes',
  name: 'Flipkart Minutes',
  displayName: 'Flipkart Minutes',
  platformType: 'quick_commerce',
  homeUrl: 'https://www.flipkart.com/minutes',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Flipkart Affiliate API (Minutes)'
      : 'Outbound search link active. Live pricing requires Flipkart Affiliate credentials.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.flipkart.com/search?q=${encodeURIComponent(term)}&marketplace=FLIPKART`;
  },
  getOutboundActionLabel(): string { return 'Check on Flipkart Minutes'; },
};

export const DmartReadyAdapter: RetailerAdapter = {
  id: 'dmart_ready',
  name: 'DMart Ready',
  displayName: 'DMart Ready',
  platformType: 'hypermarket',
  homeUrl: 'https://www.dmartready.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean { return false; },
  getPartnerStatusNote(): string {
    return 'Outbound search link active. DMart Ready does not currently offer a public partner API.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.dmartready.com/manage/search/result?query=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string { return 'Check on DMart Ready'; },
};

export const JioMartAdapter: RetailerAdapter = {
  id: 'jiomart',
  name: 'JioMart',
  displayName: 'JioMart',
  platformType: 'hypermarket',
  homeUrl: 'https://www.jiomart.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean { return false; },
  getPartnerStatusNote(): string {
    return 'Outbound search link active. Live pricing requires JioMart partner credentials.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.jiomart.com/search/${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string { return 'Check on JioMart'; },
};

export const MyntraAdapter: RetailerAdapter = {
  id: 'myntra',
  name: 'Myntra',
  displayName: 'Myntra',
  platformType: 'marketplace',
  homeUrl: 'https://www.myntra.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean { return false; },
  getPartnerStatusNote(): string {
    return 'Outbound search link active. Myntra primarily sells fashion; grocery products may not be listed.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.myntra.com/${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string { return 'Check on Myntra'; },
};

export const AjioAdapter: RetailerAdapter = {
  id: 'ajio',
  name: 'AJIO',
  displayName: 'AJIO',
  platformType: 'marketplace',
  homeUrl: 'https://www.ajio.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean { return false; },
  getPartnerStatusNote(): string {
    return 'Outbound search link active. AJIO primarily sells fashion; grocery products may not be listed.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.ajio.com/search/?text=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string { return 'Check on AJIO'; },
};

export const NykaaAdapter: RetailerAdapter = {
  id: 'nykaa',
  name: 'Nykaa',
  displayName: 'Nykaa',
  platformType: 'marketplace',
  homeUrl: 'https://www.nykaa.com',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean { return false; },
  getPartnerStatusNote(): string {
    return 'Outbound search link active. Nykaa primarily sells beauty/personal care; grocery products may not be listed.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.nykaa.com/search/result/?q=${encodeURIComponent(term)}`;
  },
  getOutboundActionLabel(): string { return 'Check on Nykaa'; },
};

export const AmazonNowAdapter: RetailerAdapter = {
  id: 'amazon_now',
  name: 'Amazon Now',
  displayName: 'Amazon Now',
  platformType: 'quick_commerce',
  homeUrl: 'https://www.amazon.in',
  integrationCapability: 'link_only',
  isLiveApiConfigured(): boolean {
    return Boolean(process.env.AMAZON_PAAPI_KEY && process.env.AMAZON_PAAPI_SECRET);
  },
  getPartnerStatusNote(): string {
    return this.isLiveApiConfigured()
      ? 'Connected to Amazon PA-API (Fresh/Now results where available)'
      : 'Outbound search link active. Amazon Now availability depends on serviceable PIN codes.';
  },
  buildSearchUrl(product: RetailerProductQuery): string {
    const term = buildCleanSearchTerm(product);
    return `https://www.amazon.in/s?k=${encodeURIComponent(term)}&i=nowstore`;
  },
  getOutboundActionLabel(): string { return 'Check on Amazon Now'; },
};

/**
 * Configurable list of registered retailer adapters.
 * Add new marketplace or hypermarket adapters here without modifying the database.
 */
export const REGISTERED_RETAILER_ADAPTERS: RetailerAdapter[] = [
  // Quick Commerce
  BlinkitAdapter,
  ZeptoAdapter,
  InstamartAdapter,
  FlipkartMinutesAdapter,
  AmazonNowAdapter,
  // General Marketplaces
  AmazonIndiaAdapter,
  FlipkartAdapter,
  BigBasketAdapter,
  DmartReadyAdapter,
  JioMartAdapter,
  // Fashion & Beauty (may not carry all grocery categories)
  MyntraAdapter,
  AjioAdapter,
  NykaaAdapter,
];

/**
 * Build comparison payload for a product, combining verified database offers
 * (if any exist) with transparent outbound retailer search links.
 */
export function buildRetailerComparison(
  product: RetailerProductQuery,
  verifiedOffers: Array<{
    id?: string;
    retailer: { name: string };
    price: number;
    currency?: string;
    availability?: string;
    deliveryTime?: string | null;
    source?: string;
    lastChecked?: Date | string;
  }> = []
): RetailerComparisonPayload {
  const verifiedList: RetailerOfferResult[] = verifiedOffers
    .filter((o) => typeof o.price === 'number' && o.price > 0)
    .map((o) => {
      const isDiffVariant = Boolean(
        o.deliveryTime && o.deliveryTime.toLowerCase().includes('different variant')
      );
      return {
        id: o.id,
        retailerId: o.retailer.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        retailerName: o.retailer.name,
        productName: product.productName,
        packSize: product.sizeInfo || null,
        price: o.price,
        currency: o.currency || 'INR',
        availability: (o.availability as RetailerOfferResult['availability']) || 'IN_STOCK',
        productUrl: (o as any).retailer?.searchUrl || (o as any).retailer?.websiteUrl || undefined,
        lastChecked: o.lastChecked ? new Date(o.lastChecked).toISOString() : new Date().toISOString(),
        source: (o.source as RetailerOfferResult['source']) || 'VERIFIED_DB',
        isVerifiedOffer: true,
        isComparableVariant: !isDiffVariant,
        variantNote: isDiffVariant ? (o.deliveryTime || undefined) : undefined,
      };
    });

  // Sort: exact comparable offers first (lowest price to highest), followed by non-comparable variant references
  verifiedList.sort((a, b) => {
    if (a.isComparableVariant !== false && b.isComparableVariant === false) return -1;
    if (a.isComparableVariant === false && b.isComparableVariant !== false) return 1;
    return a.price - b.price;
  });

  const actions: OutboundRetailerAction[] = REGISTERED_RETAILER_ADAPTERS.map((adapter) => {
    const isLive = adapter.isLiveApiConfigured();
    return {
      retailerId: adapter.id,
      retailerName: adapter.name,
      displayName: adapter.displayName,
      platformType: adapter.platformType,
      homeUrl: adapter.homeUrl,
      searchUrl: adapter.buildSearchUrl(product),
      actionLabel: adapter.getOutboundActionLabel(),
      isLiveApiConfigured: isLive,
      integrationStatus: isLive ? 'live_offers_active' : 'search_link_only',
      statusNote: adapter.getPartnerStatusNote(),
    };
  });

  const comparableList = verifiedList.filter((o) => o.isComparableVariant !== false);
  const lowestPrice =
    comparableList.length > 0 ? comparableList[0].price : null;
  const lowestRetailer =
    comparableList.length > 0 ? comparableList[0].retailerName : null;

  return {
    barcode: product.barcode || '',
    productName: product.productName,
    brand: product.brand || '',
    sizeInfo: product.sizeInfo || null,
    category: product.category || 'General',
    verifiedOffers: verifiedList,
    retailerActions: actions,
    hasVerifiedOffers: verifiedList.length > 0,
    lowestVerifiedPrice: lowestPrice,
    lowestPriceRetailer: lowestRetailer,
    disclaimer:
      'Retailer links open external merchant search pages. ShopTrip does not fabricate or scrape unverified prices.',
  };
}
