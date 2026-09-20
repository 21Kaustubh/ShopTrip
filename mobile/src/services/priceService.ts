export type RetailerName =
  | 'Blinkit'
  | 'Zepto'
  | 'Amazon'
  | 'BigBasket'
  | 'Flipkart'
  | 'Flipkart Minutes'
  | 'Instamart';

export type OfferSource =
  | 'demo'
  | 'retailer-api'
  | 'affiliate'
  | 'merchant-api';

export type RetailerPrice = {
  retailer: RetailerName;
  price: number;
  deliveryTime: string;

  // Used when the user chooses where to buy.
  buyUrl: string;

  // Tells ShopTrip whether actual cart/order
  // synchronization is available.
  supportsCartSync: boolean;

  // Where this price came from.
  source: OfferSource;
};

const prices: Record<string, RetailerPrice[]> = {
  // BRU Instant Coffee
  '8901030974625': [
    {
      retailer: 'Blinkit',
      price: 45,
      deliveryTime: '10–15 min',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
    {
      retailer: 'Zepto',
      price: 47,
      deliveryTime: '10–15 min',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
    {
      retailer: 'Amazon',
      price: 49,
      deliveryTime: '1–2 days',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
    {
      retailer: 'Flipkart Minutes',
      price: 46,
      deliveryTime: '10–20 min',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
  ],

  // Knorr Tomato Chatpata Cup-a-Soup
  '8909106048553': [
    {
      retailer: 'Blinkit',
      price: 20,
      deliveryTime: '10–15 min',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
    {
      retailer: 'Zepto',
      price: 20,
      deliveryTime: '10–15 min',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
    {
      retailer: 'Amazon',
      price: 22,
      deliveryTime: '1–2 days',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
    {
      retailer: 'BigBasket',
      price: 21,
      deliveryTime: '30–60 min',
      buyUrl: '',
      supportsCartSync: false,
      source: 'demo',
    },
  ],
};

export function getPricesByBarcode(
  barcode: string
): RetailerPrice[] {
  return prices[barcode] ?? [];
}

export function getCheapestPrice(
  offers: RetailerPrice[]
): RetailerPrice | null {
  if (offers.length === 0) {
    return null;
  }

  return offers.reduce((cheapest, current) =>
    current.price < cheapest.price ? current : cheapest
  );
}