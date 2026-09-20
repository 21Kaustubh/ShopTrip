export type RetailerPrice = {
  retailer: string;
  price: number;
  deliveryTime: string;
};

export function getPricesByBarcode(
  barcode: string
): RetailerPrice[] {
  const prices: Record<string, RetailerPrice[]> = {
    // BRU Instant Coffee – New Rich Aroma
    '8901030974625': [
      {
        retailer: 'Blinkit',
        price: 2,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Zepto',
        price: 2,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Amazon',
        price: 2,
        deliveryTime: '1–2 days',
      },
      {
        retailer: 'Flipkart Minutes',
        price: 2,
        deliveryTime: '10–20 min',
      },
    ],

    // Knorr Tomato Chatpata Cup-a-Soup
    '8909106048553': [
      {
        retailer: 'Blinkit',
        price: 61,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Zepto',
        price: 61,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Amazon',
        price: 22,
        deliveryTime: '1–2 days',
      },
      {
        retailer: 'BigBasket',
        price: 21,
        deliveryTime: '30–60 min',
      },
    ],
  };

  return prices[barcode] ?? [];
}

export function getCheapestPrice(
  prices: RetailerPrice[]
): RetailerPrice | null {
  if (prices.length === 0) {
    return null;
  }

  return prices.reduce((cheapest, current) =>
    current.price < cheapest.price ? current : cheapest
  );
}