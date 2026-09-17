export type RetailerPrice = {
  retailer: string;
  price: number;
  deliveryTime: string;
};

export function getPricesByBarcode(
  barcode: string
): RetailerPrice[] {
  const prices: Record<string, RetailerPrice[]> = {
    '7622202852565': [
      {
        retailer: 'Blinkit',
        price: 45,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Zepto',
        price: 47,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Amazon',
        price: 49,
        deliveryTime: '1–2 days',
      },
      {
        retailer: 'Flipkart Minutes',
        price: 46,
        deliveryTime: '10–20 min',
      },
    ],

    '8908000737020': [
      {
        retailer: 'Blinkit',
        price: 58,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Zepto',
        price: 60,
        deliveryTime: '10–15 min',
      },
      {
        retailer: 'Amazon',
        price: 62,
        deliveryTime: '1–2 days',
      },
      {
        retailer: 'BigBasket',
        price: 59,
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