import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type PurchaseStatus =
  | 'PLANNED'
  | 'RETAILER_SELECTED'
  | 'RETAILER_OPENED'
  | 'IN_CART'
  | 'ORDERED'
  | 'DELIVERED'
  | 'REMOVED'
  | 'CANCELLED'
  | 'ABANDONED';

export type TripProduct = {
  id: string;
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  weight: string;
  unit: string;

  storePrice: number;
  onlinePrice: number; // 0 if unavailable
  cheapestRetailer: string;
  savings: number;

  quantity: number;

  selectedRetailer: string | null;
  purchasedQuantity: number;
  purchaseStatus: PurchaseStatus;
  retailerBuyClicked: boolean;
  retailerOpenedAt: string | null;
};

type TripContextType = {
  products: TripProduct[];
  addProduct: (product: TripProduct) => void;
  increaseQuantity: (barcode: string) => void;
  decreaseQuantity: (barcode: string) => void;
  removeProduct: (id: string) => void;
  clearTrip: () => void;

  markRetailerSelected: (barcode: string, retailer: string) => void;
  markRetailerOpened: (barcode: string) => void;
  markPurchased: (barcode: string, purchasedQuantity: number) => void;
  updatePurchaseStatus: (barcode: string, status: PurchaseStatus) => void;

  totalSavings: number;
  totalStorePrice: number;
  totalOnlinePrice: number;
  productCount: number;
  totalItems: number;
};

const GUEST_TRIP_KEY = '@shoptrip_guest_trip';

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<TripProduct[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Restore guest trip from local storage on mount
  useEffect(() => {
    async function loadStoredTrip() {
      try {
        const stored = await AsyncStorage.getItem(GUEST_TRIP_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load stored shopping trip:', err);
      } finally {
        setHasLoaded(true);
      }
    }

    loadStoredTrip();
  }, []);

  // Persist trip to local storage on change (after initial load)
  useEffect(() => {
    if (!hasLoaded) return;

    async function saveTrip() {
      try {
        await AsyncStorage.setItem(GUEST_TRIP_KEY, JSON.stringify(products));
      } catch (err) {
        console.warn('Failed to persist shopping trip:', err);
      }
    }

    saveTrip();
  }, [products, hasLoaded]);

  const addProduct = (product: TripProduct) => {
    setProducts((currentProducts) => {
      const existingProduct = currentProducts.find(
        (item) => item.barcode === product.barcode
      );

      if (existingProduct) {
        return currentProducts.map((item) =>
          item.barcode === product.barcode
            ? {
                ...item,
                quantity: (item.quantity ?? 1) + 1,
              }
            : item
        );
      }

      return [
        ...currentProducts,
        {
          ...product,
          quantity: product.quantity || 1,
          selectedRetailer: product.selectedRetailer ?? null,
          purchasedQuantity: product.purchasedQuantity ?? 0,
          purchaseStatus: product.purchaseStatus ?? 'PLANNED',
          retailerBuyClicked: product.retailerBuyClicked ?? false,
          retailerOpenedAt: product.retailerOpenedAt ?? null,
        },
      ];
    });
  };

  const increaseQuantity = (barcode: string) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              quantity: (product.quantity ?? 1) + 1,
            }
          : product
      )
    );
  };

  const decreaseQuantity = (barcode: string) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              quantity: Math.max(1, (product.quantity ?? 1) - 1),
            }
          : product
      )
    );
  };

  const removeProduct = (id: string) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );
  };

  const clearTrip = () => {
    setProducts([]);
  };

  const markRetailerSelected = (barcode: string, retailer: string) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              selectedRetailer: retailer,
              purchaseStatus: 'RETAILER_SELECTED',
            }
          : product
      )
    );
  };

  const markRetailerOpened = (barcode: string) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              retailerBuyClicked: true,
              retailerOpenedAt: product.retailerOpenedAt ?? new Date().toISOString(),
              purchaseStatus: 'RETAILER_OPENED',
            }
          : product
      )
    );
  };

  const markPurchased = (barcode: string, purchasedQuantity: number) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              purchasedQuantity: Math.max(0, purchasedQuantity),
              purchaseStatus: purchasedQuantity > 0 ? 'ORDERED' : 'PLANNED',
            }
          : product
      )
    );
  };

  const updatePurchaseStatus = (barcode: string, status: PurchaseStatus) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              purchaseStatus: status,
            }
          : product
      )
    );
  };

  // Price Integrity Calculations
  // Total Savings: only calculated when online price is valid (> 0) and savings > 0
  const totalSavings = products.reduce((total, product) => {
    const qty = product.quantity ?? 1;
    const savingPerUnit = typeof product.savings === 'number' && product.savings > 0 ? product.savings : 0;
    return total + savingPerUnit * qty;
  }, 0);

  // Total Store Price: sum of shelf price * quantity
  const totalStorePrice = products.reduce((total, product) => {
    const qty = product.quantity ?? 1;
    const price = typeof product.storePrice === 'number' && product.storePrice > 0 ? product.storePrice : 0;
    return total + price * qty;
  }, 0);

  // Total Online Price: only includes items where a valid online offer exists (> 0)
  const totalOnlinePrice = products.reduce((total, product) => {
    const qty = product.quantity ?? 1;
    const price = typeof product.onlinePrice === 'number' && product.onlinePrice > 0 ? product.onlinePrice : 0;
    return total + price * qty;
  }, 0);

  const productCount = products.length;

  const totalItems = products.reduce(
    (total, product) => total + (product.quantity ?? 1),
    0
  );

  return (
    <TripContext.Provider
      value={{
        products,
        addProduct,
        increaseQuantity,
        decreaseQuantity,
        removeProduct,
        clearTrip,
        markRetailerSelected,
        markRetailerOpened,
        markPurchased,
        updatePurchaseStatus,
        totalSavings,
        totalStorePrice,
        totalOnlinePrice,
        productCount,
        totalItems,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used inside TripProvider');
  }
  return context;
}
