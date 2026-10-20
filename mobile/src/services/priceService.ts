export type RetailerName =
  | 'Amazon'
  | 'BigBasket'
  | 'Blinkit'
  | 'Flipkart'
  | 'Flipkart Minutes'
  | 'Instamart'
  | 'Zepto'
  | string;

export type RetailerPrice = {
  id?: string;
  retailer: RetailerName;
  price: number;
  deliveryTime?: string;
  currency?: string;
  availability?: string;
  source?: string;
  lastChecked?: string;
};

export const DEMO_PRICE_DISCLAIMER =
  'Product offers and pricing reflect verified records stored in the ShopTrip database. Live dynamic merchant scraping is not connected.';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Fetch verified retailer offers for a product barcode from the backend API.
 * Returns an empty array if the barcode has no recorded retailer offers,
 * if the barcode is unknown, or if the API cannot be reached.
 * Never returns fabricated prices.
 */
export async function getPricesByBarcode(
  barcode: string
): Promise<RetailerPrice[]> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${API_BASE_URL}/products/barcode/${encodeURIComponent(cleanBarcode)}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.status === 404 || !response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.found || !Array.isArray(data.offers)) {
      return [];
    }

    return data.offers.map((offer: any) => ({
      id: offer.id,
      retailer: offer.retailer,
      price: typeof offer.price === 'number' ? offer.price : 0,
      deliveryTime: offer.deliveryTime || 'Standard delivery',
      currency: offer.currency || 'INR',
      availability: offer.availability || 'IN_STOCK',
      source: offer.source || 'Verified Offer',
      lastChecked: offer.lastChecked,
    }));
  } catch (err: any) {
    console.warn(`[priceService] Failed to fetch offers for barcode ${cleanBarcode}:`, err?.message || err);
    return [];
  }
}

/**
 * Identify the lowest priced valid retailer offer.
 * Returns null if no offers are available or prices are empty.
 */
export function getCheapestPrice(
  prices: RetailerPrice[]
): RetailerPrice | null {
  if (!prices || prices.length === 0) {
    return null;
  }

  const validPrices = prices.filter((p) => typeof p.price === 'number' && p.price > 0);
  if (validPrices.length === 0) {
    return null;
  }

  return validPrices.reduce((cheapest, current) =>
    current.price < cheapest.price ? current : cheapest
  );
}
