export type Product = {
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  weight: string;
  unit: string;
};

const products: Product[] = [
  {
    barcode: '7622202852565',
    productName: 'Oreo',
    brand: 'Oreo',
    category: 'Biscuits',
    weight: '116.9',
    unit: 'g',
  },
  {
    barcode: '8908000737020',
    productName: 'Mumbai Chana',
    brand: 'Rajlaxmi',
    category: 'Pulses',
    weight: '200',
    unit: 'g',
  },
];

export function getProductByBarcode(
  barcode: string
): Product | null {
  const product = products.find(
    (item) => item.barcode === barcode
  );

  return product ?? null;
}