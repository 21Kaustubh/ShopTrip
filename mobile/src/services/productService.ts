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
    barcode: '8901030974625',
    productName: 'BRU Instant Coffee – New Rich Aroma',
    brand: 'BRU',
    category: 'Coffee',
    weight: '',
    unit: '',
  },
  {
    barcode: '8909106048553',
    productName: 'Knorr Tomato Chatpata Cup-a-Soup',
    brand: 'Knorr',
    category: 'Instant Soup',
    weight: '13.5',
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

/*
 * SEARCH PRODUCTS
 *
 * Searches through:
 * - Product name
 * - Brand
 * - Category
 * - Barcode
 */
export function searchProducts(
  query: string
): Product[] {
  const searchQuery = query
    .trim()
    .toLowerCase();

  if (!searchQuery) {
    return [];
  }

  return products.filter((product) => {
    return (
      product.productName
        .toLowerCase()
        .includes(searchQuery) ||
      product.brand
        .toLowerCase()
        .includes(searchQuery) ||
      product.category
        .toLowerCase()
        .includes(searchQuery) ||
      product.barcode.includes(searchQuery)
    );
  });
}