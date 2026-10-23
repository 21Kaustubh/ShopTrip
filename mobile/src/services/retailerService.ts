import { Alert, Linking, Platform } from 'react-native';
import type { RetailerName } from './priceService';

export type RetailerInfo = {
  name: RetailerName;
  shortName: string;
  description: string;
};

export const retailers: RetailerInfo[] = [
  {
    name: 'Blinkit',
    shortName: 'Blinkit',
    description: 'Quick grocery delivery (delivery estimates depend on location)',
  },
  {
    name: 'Zepto',
    shortName: 'Zepto',
    description: 'Quick grocery delivery (serviceability depends on local store)',
  },
  {
    name: 'Instamart',
    shortName: 'Instamart',
    description: 'Swiggy quick grocery delivery (availability depends on dark store)',
  },
  {
    name: 'Amazon',
    shortName: 'Amazon',
    description: 'Amazon India Fresh & Marketplace (shipping varies by seller and PIN code)',
  },
  {
    name: 'BigBasket',
    shortName: 'BigBasket',
    description: 'Online grocery shopping and scheduled delivery',
  },
  {
    name: 'Flipkart',
    shortName: 'Flipkart',
    description: 'Flipkart Grocery & Marketplace (delivery depends on location)',
  },
  {
    name: 'Flipkart Minutes',
    shortName: 'Minutes',
    description: 'Quick delivery from Flipkart (location dependent)',
  },
  {
    name: 'Amazon Now',
    shortName: 'Amazon Now',
    description: 'Amazon Now quick commerce (availability depends on serviceable PIN codes)',
  },
  {
    name: 'DMart Ready',
    shortName: 'DMart Ready',
    description: 'DMart online grocery delivery (scheduled delivery)',
  },
  {
    name: 'JioMart',
    shortName: 'JioMart',
    description: 'Reliance JioMart grocery and essentials delivery',
  },
  {
    name: 'Myntra',
    shortName: 'Myntra',
    description: 'Myntra fashion marketplace (primarily fashion and lifestyle)',
  },
  {
    name: 'AJIO',
    shortName: 'AJIO',
    description: 'AJIO fashion marketplace (primarily fashion; grocery may not be listed)',
  },
  {
    name: 'Nykaa',
    shortName: 'Nykaa',
    description: 'Nykaa beauty and personal care marketplace',
  },
];

export function getRetailerInfo(
  retailerName: RetailerName
): RetailerInfo | null {
  return (
    retailers.find(
      (retailer) => retailer.name.toLowerCase() === retailerName.toLowerCase()
    ) ?? null
  );
}

// ─── Phase 2C Outbound Actions & Honest Comparison ──────────────────────────

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export type RetailerPlatformType = 'quick_commerce' | 'marketplace' | 'hypermarket';

export interface RetailerAction {
  retailerId: string;
  retailerName: string;
  displayName: string;
  platformType: RetailerPlatformType;
  badge: string;
  homeUrl: string;
  searchUrl: string;
  actionLabel: string;
  isLiveApiConfigured: boolean;
  statusNote: string;
}

export interface VerifiedOffer {
  id?: string;
  retailerId: string;
  retailerName: string;
  productName: string;
  packSize?: string | null;
  price: number;
  currency: string;
  availability: string;
  deliveryTime?: string | null;
  source: string;
  lastChecked: string;
  productUrl?: string;
  isComparableVariant?: boolean;
  variantNote?: string;
}

export interface RetailerComparisonData {
  barcode: string;
  productName: string;
  brand: string;
  sizeInfo: string | null;
  category: string;
  verifiedOffers: VerifiedOffer[];
  retailerActions: RetailerAction[];
  hasVerifiedOffers: boolean;
  lowestVerifiedPrice: number | null;
  lowestPriceRetailer: string | null;
  disclaimer: string;
}

export interface ProductDetailsParams {
  productName: string;
  brand?: string | null;
  sizeInfo?: string | null;
  barcode?: string | null;
  category?: string | null;
}

/**
 * Clean and combine product metadata for high-precision retailer search.
 * Avoids duplicate brand mentions (e.g. "Bru Bru Instant Coffee").
 * Uses a safe, case-insensitive prefix comparison without regex-special character vulnerabilities.
 */
export function buildCleanSearchTerm(product: ProductDetailsParams): string {
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

/**
 * Generate client-side fallback retailer actions if backend comparison API is unreachable.
 * Never invents prices or delivery times.
 */
export function getLocalRetailerActions(product: ProductDetailsParams): RetailerAction[] {
  const term = buildCleanSearchTerm(product);
  const encoded = encodeURIComponent(term);

  return [
    {
      retailerId: 'blinkit',
      retailerName: 'Blinkit',
      displayName: 'Blinkit',
      platformType: 'quick_commerce',
      badge: 'Quick Commerce',
      homeUrl: 'https://blinkit.com',
      searchUrl: `https://blinkit.com/s/?q=${encoded}`,
      actionLabel: 'Check on Blinkit',
      isLiveApiConfigured: false,
      statusNote: 'Search catalog on Blinkit. Live price and delivery availability depend on location.',
    },
    {
      retailerId: 'zepto',
      retailerName: 'Zepto',
      displayName: 'Zepto',
      platformType: 'quick_commerce',
      badge: 'Quick Delivery',
      homeUrl: 'https://www.zeptonow.com',
      searchUrl: `https://www.zeptonow.com/search?query=${encoded}`,
      actionLabel: 'Check on Zepto',
      isLiveApiConfigured: false,
      statusNote: 'Search catalog on Zepto. Live pricing and delivery depend on local store availability.',
    },
    {
      retailerId: 'instamart',
      retailerName: 'Swiggy Instamart',
      displayName: 'Swiggy Instamart',
      platformType: 'quick_commerce',
      badge: 'Instamart',
      homeUrl: 'https://www.swiggy.com/instamart',
      searchUrl: `https://www.swiggy.com/instamart/search?query=${encoded}`,
      actionLabel: 'Check on Instamart',
      isLiveApiConfigured: false,
      statusNote: 'Search Swiggy Instamart inventory. Availability depends on dark store location.',
    },
    {
      retailerId: 'amazon_in',
      retailerName: 'Amazon India',
      displayName: 'Amazon India',
      platformType: 'marketplace',
      badge: 'Marketplace',
      homeUrl: 'https://www.amazon.in',
      searchUrl: `https://www.amazon.in/s?k=${encoded}`,
      actionLabel: 'Check on Amazon',
      isLiveApiConfigured: false,
      statusNote: 'Search Amazon.in Fresh and Pantry listings. Availability and shipping vary by address.',
    },
    {
      retailerId: 'flipkart',
      retailerName: 'Flipkart',
      displayName: 'Flipkart',
      platformType: 'marketplace',
      badge: 'Marketplace',
      homeUrl: 'https://www.flipkart.com',
      searchUrl: `https://www.flipkart.com/search?q=${encoded}`,
      actionLabel: 'Check on Flipkart',
      isLiveApiConfigured: false,
      statusNote: 'Search Flipkart Grocery and marketplace listings. Delivery estimates depend on PIN code.',
    },
    {
      retailerId: 'flipkart_minutes',
      retailerName: 'Flipkart Minutes',
      displayName: 'Flipkart Minutes',
      platformType: 'quick_commerce',
      badge: 'Quick Delivery',
      homeUrl: 'https://www.flipkart.com/minutes',
      searchUrl: `https://www.flipkart.com/search?q=${encoded}&marketplace=FLIPKART`,
      actionLabel: 'Check on Flipkart Minutes',
      isLiveApiConfigured: false,
      statusNote: 'Search Flipkart Minutes quick delivery catalog. Availability depends on location.',
    },
    {
      retailerId: 'amazon_now',
      retailerName: 'Amazon Now',
      displayName: 'Amazon Now',
      platformType: 'quick_commerce',
      badge: 'Quick Commerce',
      homeUrl: 'https://www.amazon.in',
      searchUrl: `https://www.amazon.in/s?k=${encoded}&i=nowstore`,
      actionLabel: 'Check on Amazon Now',
      isLiveApiConfigured: false,
      statusNote: 'Search Amazon Fresh/Now. Availability depends on serviceable PIN codes.',
    },
    {
      retailerId: 'bigbasket',
      retailerName: 'BigBasket',
      displayName: 'BigBasket',
      platformType: 'hypermarket',
      badge: 'Hypermarket',
      homeUrl: 'https://www.bigbasket.com',
      searchUrl: `https://www.bigbasket.com/ps/?q=${encoded}`,
      actionLabel: 'Check on BigBasket',
      isLiveApiConfigured: false,
      statusNote: 'Search BigBasket catalog. Delivery slots depend on location.',
    },
    {
      retailerId: 'dmart_ready',
      retailerName: 'DMart Ready',
      displayName: 'DMart Ready',
      platformType: 'hypermarket',
      badge: 'Hypermarket',
      homeUrl: 'https://www.dmartready.com',
      searchUrl: `https://www.dmartready.com/manage/search/result?query=${encoded}`,
      actionLabel: 'Check on DMart Ready',
      isLiveApiConfigured: false,
      statusNote: 'Search DMart Ready catalog. Scheduled delivery and pick-up point availability.',
    },
    {
      retailerId: 'jiomart',
      retailerName: 'JioMart',
      displayName: 'JioMart',
      platformType: 'hypermarket',
      badge: 'Hypermarket',
      homeUrl: 'https://www.jiomart.com',
      searchUrl: `https://www.jiomart.com/search/${encoded}`,
      actionLabel: 'Check on JioMart',
      isLiveApiConfigured: false,
      statusNote: 'Search JioMart catalog. Availability depends on local store.',
    },
    {
      retailerId: 'myntra',
      retailerName: 'Myntra',
      displayName: 'Myntra',
      platformType: 'marketplace',
      badge: 'Fashion/Lifestyle',
      homeUrl: 'https://www.myntra.com',
      searchUrl: `https://www.myntra.com/${encoded}`,
      actionLabel: 'Check on Myntra',
      isLiveApiConfigured: false,
      statusNote: 'Search Myntra catalog. Primarily fashion and lifestyle.',
    },
    {
      retailerId: 'ajio',
      retailerName: 'AJIO',
      displayName: 'AJIO',
      platformType: 'marketplace',
      badge: 'Fashion/Lifestyle',
      homeUrl: 'https://www.ajio.com',
      searchUrl: `https://www.ajio.com/search/?text=${encoded}`,
      actionLabel: 'Check on AJIO',
      isLiveApiConfigured: false,
      statusNote: 'Search AJIO catalog. Primarily fashion; grocery may not be listed.',
    },
    {
      retailerId: 'nykaa',
      retailerName: 'Nykaa',
      displayName: 'Nykaa',
      platformType: 'marketplace',
      badge: 'Beauty/Care',
      homeUrl: 'https://www.nykaa.com',
      searchUrl: `https://www.nykaa.com/search/result/?q=${encoded}`,
      actionLabel: 'Check on Nykaa',
      isLiveApiConfigured: false,
      statusNote: 'Search Nykaa catalog. Primarily beauty and personal care.',
    },
  ];
}

/**
 * Fetch comparison payload from the backend API.
 * Falls back cleanly to local configuration if offline or unavailable.
 */
export async function fetchProductComparison(
  product: ProductDetailsParams
): Promise<RetailerComparisonData> {
  const barcode = (product.barcode || '').trim();

  if (barcode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(barcode)}/comparison`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as RetailerComparisonData;
        if (Array.isArray(data.retailerActions) && data.retailerActions.length > 0) {
          const enrichedActions = data.retailerActions.map((action) => ({
            ...action,
            badge:
              action.platformType === 'quick_commerce'
                ? 'Quick Commerce'
                : action.platformType === 'hypermarket'
                  ? 'Hypermarket'
                  : 'Marketplace',
          }));
          return {
            ...data,
            retailerActions: enrichedActions,
          };
        }
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Local fallback
  return {
    barcode: product.barcode || '',
    productName: product.productName,
    brand: product.brand || '',
    sizeInfo: product.sizeInfo || null,
    category: product.category || 'General',
    verifiedOffers: [],
    retailerActions: getLocalRetailerActions(product),
    hasVerifiedOffers: false,
    lowestVerifiedPrice: null,
    lowestPriceRetailer: null,
    disclaimer:
      'Retailer links open external merchant search pages. ShopTrip does not fabricate or scrape unverified prices.',
  };
}

/**
 * Open external retailer search or offer link safely across Web, iOS, and Android.
 */
export async function openRetailerOutboundUrl(
  url: string,
  retailerName: string
): Promise<boolean> {
  if (!url) {
    Alert.alert('Link Unavailable', `No search link available for ${retailerName}.`);
    return false;
  }

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof window.open === 'function') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return true;
      }
    }

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        'Unable to Open Retailer',
        `Could not open the link for ${retailerName}. You can visit their website directly.`
      );
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (err: unknown) {
    console.warn(`[retailerService] Could not open link for ${retailerName}:`, err);
    Alert.alert(
      'Unable to Open Link',
      `An error occurred while opening ${retailerName}. Please try again.`
    );
    return false;
  }
}
