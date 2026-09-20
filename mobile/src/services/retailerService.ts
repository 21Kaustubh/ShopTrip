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
    description: 'Quick grocery delivery',
  },
  {
    name: 'Zepto',
    shortName: 'Zepto',
    description: 'Quick grocery delivery',
  },
  {
    name: 'Amazon',
    shortName: 'Amazon',
    description: 'Online shopping',
  },
  {
    name: 'BigBasket',
    shortName: 'BigBasket',
    description: 'Online grocery shopping',
  },
  {
    name: 'Flipkart',
    shortName: 'Flipkart',
    description: 'Online shopping',
  },
  {
    name: 'Flipkart Minutes',
    shortName: 'Minutes',
    description: 'Quick delivery from Flipkart',
  },
  {
    name: 'Instamart',
    shortName: 'Instamart',
    description: 'Quick grocery delivery',
  },
];

export function getRetailerInfo(
  retailerName: RetailerName
): RetailerInfo | null {
  return (
    retailers.find(
      (retailer) => retailer.name === retailerName
    ) ?? null
  );
}