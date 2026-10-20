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
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Look up a product in the database by its barcode via the backend API.
 * Returns null if the barcode is unknown, the catalogue is empty, or if an error occurs.
 * Never fabricates or falls back to hardcoded mock products.
 */
export async function getProductByBarcode(
  barcode: string
): Promise<Product | null> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    return null;
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

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.warn(`[productService] API returned status ${response.status} for barcode ${cleanBarcode}`);
      return null;
    }

    const data = await response.json();
    if (!data.found || !data.product) {
      return null;
    }

    const p = data.product;
    return {
      id: p.id,
      barcode: p.barcode,
      productName: p.productName,
      brand: p.brand || '',
      category: p.category || 'General',
      sizeInfo: p.sizeInfo || '',
      weight: p.sizeInfo ? p.sizeInfo.split(' ')[0] : '',
      unit: p.sizeInfo ? p.sizeInfo.split(' ')[1] || '' : '',
      imageUrl: p.imageUrl,
      verificationStatus: p.verificationStatus,
    };
  } catch (err: any) {
    console.warn(`[productService] Network request failed for barcode ${cleanBarcode}:`, err?.message || err);
    return null;
  }
}

/**
 * Search the product catalogue in the database via the backend API.
 * Returns an array of matching products, or empty array if query is blank or no items match.
 * Never fabricates results when the database is empty.
 */
export async function searchProducts(
  query: string
): Promise<Product[]> {
  const searchQuery = query.trim();
  if (!searchQuery) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[productService] Search returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((p: any) => ({
      id: p.id,
      barcode: p.barcode,
      productName: p.productName,
      brand: p.brand || '',
      category: p.category || 'General',
      sizeInfo: p.sizeInfo || '',
      weight: p.sizeInfo ? p.sizeInfo.split(' ')[0] : '',
      unit: p.sizeInfo ? p.sizeInfo.split(' ')[1] || '' : '',
      imageUrl: p.imageUrl,
      verificationStatus: p.verificationStatus,
    }));
  } catch (err: any) {
    console.warn('[productService] Search request failed:', err?.message || err);
    return [];
  }
}
