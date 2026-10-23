import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

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

  isComparableOffer?: boolean;
  selectedOfferId?: string | null;

  quantity: number;

  selectedRetailer: string | null;
  purchasedQuantity: number;
  purchaseStatus: PurchaseStatus;
  retailerBuyClicked: boolean;
  retailerOpenedAt: string | null;
};

export interface CompletedTrip {
  id: string;
  name: string;
  completedAt: string;
  itemCount: number;
  totalStorePrice: number;
  totalOnlinePrice: number;
  totalSavings: number;
  items: {
    barcode: string;
    productName: string;
    quantity: number;
    shelfPrice: number;
    onlinePrice: number;
    selectedRetailer: string | null;
    savings: number;
    isComparable: boolean;
  }[];
}

type TripContextType = {
  products: TripProduct[];
  completedTrips: CompletedTrip[];
  persistedSavings: number;
  completedTripCount: number;

  addProduct: (product: TripProduct) => void;
  increaseQuantity: (barcode: string) => void;
  decreaseQuantity: (barcode: string) => void;
  removeProduct: (id: string) => void;
  clearTrip: () => void;
  completeTrip: (tripName?: string) => Promise<{ success: boolean; error?: string }>;

  markRetailerSelected: (
    barcode: string,
    retailer: string,
    onlinePrice?: number,
    isComparable?: boolean,
    savings?: number
  ) => void;
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
const COMPLETED_TRIPS_KEY = '@shoptrip_completed_trips';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { token, isGuest } = useAuth();
  const [products, setProducts] = useState<TripProduct[]>([]);
  const [completedTrips, setCompletedTrips] = useState<CompletedTrip[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Restore active trip and completed trips portfolio from local storage on mount
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedTrip = await AsyncStorage.getItem(GUEST_TRIP_KEY);
        if (storedTrip) {
          const parsed = JSON.parse(storedTrip);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        }

        const storedCompleted = await AsyncStorage.getItem(COMPLETED_TRIPS_KEY);
        if (storedCompleted) {
          const parsedCompleted = JSON.parse(storedCompleted);
          if (Array.isArray(parsedCompleted)) {
            setCompletedTrips(parsedCompleted);
          }
        }
      } catch (err) {
        console.warn('Failed to load stored shopping trip data:', err);
      } finally {
        setHasLoaded(true);
      }
    }

    loadStoredData();
  }, []);

  // For authenticated users, sync completed trips from backend
  useEffect(() => {
    if (!token || isGuest) return;

    let active = true;
    async function syncBackendTrips() {
      try {
        const res = await fetch(`${API_BASE_URL}/trips`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (res.ok && active) {
          const data = await res.json();
          if (Array.isArray(data.trips)) {
            const completedFromBackend: CompletedTrip[] = data.trips
              .filter((t: any) => t.status === 'COMPLETED')
              .map((t: any) => ({
                id: t.id,
                name: t.name,
                completedAt: t.updatedAt || t.createdAt,
                itemCount: t.itemCount || 0,
                totalStorePrice: 0,
                totalOnlinePrice: 0,
                totalSavings: typeof t.totalSavings === 'number' ? t.totalSavings : 0,
                items: [],
              }));

            // Merge with local completed trips by ID
            setCompletedTrips((current) => {
              const ids = new Set(completedFromBackend.map((b) => b.id));
              const merged = [
                ...completedFromBackend,
                ...current.filter((c) => !ids.has(c.id)),
              ];
              AsyncStorage.setItem(COMPLETED_TRIPS_KEY, JSON.stringify(merged)).catch(() => {});
              return merged;
            });
          }
        }
      } catch {
        // Fall back gracefully to local storage
      }
    }

    syncBackendTrips();

    return () => {
      active = false;
    };
  }, [token, isGuest]);

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
                quantity: (item.quantity ?? 1) + (product.quantity || 1),
                storePrice: product.storePrice > 0 ? product.storePrice : item.storePrice,
                onlinePrice: product.onlinePrice > 0 ? product.onlinePrice : item.onlinePrice,
                cheapestRetailer: product.cheapestRetailer || item.cheapestRetailer,
                selectedRetailer: product.selectedRetailer || item.selectedRetailer,
                savings: product.savings,
                isComparableOffer: product.isComparableOffer ?? item.isComparableOffer,
                selectedOfferId: product.selectedOfferId ?? item.selectedOfferId,
                purchaseStatus: product.selectedRetailer ? 'RETAILER_SELECTED' : item.purchaseStatus,
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
          purchaseStatus: product.purchaseStatus ?? (product.selectedRetailer ? 'RETAILER_SELECTED' : 'PLANNED'),
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

  const markRetailerSelected = (
    barcode: string,
    retailer: string,
    onlinePrice?: number,
    isComparable?: boolean,
    savings?: number
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.barcode !== barcode) return product;
        const newOnlinePrice = typeof onlinePrice === 'number' ? onlinePrice : product.onlinePrice;
        const newComparable = typeof isComparable === 'boolean' ? isComparable : product.isComparableOffer;
        const newSavings =
          typeof savings === 'number'
            ? savings
            : newComparable !== false && product.storePrice > 0 && newOnlinePrice > 0
              ? Math.max(0, product.storePrice - newOnlinePrice)
              : 0;

        return {
          ...product,
          selectedRetailer: retailer,
          onlinePrice: newOnlinePrice,
          isComparableOffer: newComparable,
          savings: newSavings,
          purchaseStatus: 'RETAILER_SELECTED',
        };
      })
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
  // Total Savings: max(0, enteredShelfPrice - selectedComparableOfferPrice) * quantity
  // Only calculated when isComparableOffer is not false, shelf price is valid, and online price is valid (> 0)
  const totalSavings = products.reduce((total, product) => {
    const qty = product.quantity ?? 1;
    if (
      product.isComparableOffer !== false &&
      typeof product.storePrice === 'number' &&
      product.storePrice > 0 &&
      typeof product.onlinePrice === 'number' &&
      product.onlinePrice > 0
    ) {
      const savingPerUnit = Math.max(0, product.storePrice - product.onlinePrice);
      return total + savingPerUnit * qty;
    }
    return total;
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

  // Complete Trip and Persist to Portfolio
  const completeTrip = async (tripName?: string): Promise<{ success: boolean; error?: string }> => {
    if (products.length === 0) {
      return { success: false, error: 'Cannot complete an empty trip.' };
    }

    // Calculate valid projected savings from comparable offers ONLY
    const validTripSavings = products.reduce((total, p) => {
      const qty = p.quantity ?? 1;
      if (
        p.isComparableOffer !== false &&
        typeof p.storePrice === 'number' &&
        p.storePrice > 0 &&
        typeof p.onlinePrice === 'number' &&
        p.onlinePrice > 0 &&
        p.storePrice > p.onlinePrice
      ) {
        return total + (p.storePrice - p.onlinePrice) * qty;
      }
      return total;
    }, 0);

    const tripStoreTotal = products.reduce((total, p) => {
      const qty = p.quantity ?? 1;
      return total + (p.storePrice || 0) * qty;
    }, 0);

    const tripOnlineTotal = products.reduce((total, p) => {
      const qty = p.quantity ?? 1;
      return total + (p.onlinePrice > 0 ? p.onlinePrice * qty : 0);
    }, 0);

    const newCompletedTrip: CompletedTrip = {
      id: `trip-${Date.now()}`,
      name:
        tripName?.trim() ||
        `Shopping Trip - ${new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`,
      completedAt: new Date().toISOString(),
      itemCount: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
      totalStorePrice: tripStoreTotal,
      totalOnlinePrice: tripOnlineTotal,
      totalSavings: validTripSavings,
      items: products.map((p) => ({
        barcode: p.barcode,
        productName: p.productName,
        quantity: p.quantity || 1,
        shelfPrice: p.storePrice || 0,
        onlinePrice: p.onlinePrice || 0,
        selectedRetailer: p.selectedRetailer,
        savings:
          p.isComparableOffer !== false && p.storePrice > p.onlinePrice && p.onlinePrice > 0
            ? p.storePrice - p.onlinePrice
            : 0,
        isComparable: p.isComparableOffer !== false,
      })),
    };

    // If authenticated, persist to backend FIRST
    if (!isGuest && token) {
      try {
        const res = await fetch(`${API_BASE_URL}/trips/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newCompletedTrip.name,
            totalSavings: validTripSavings,
            items: products.map((p) => ({
              barcode: p.barcode,
              productName: p.productName,
              quantity: p.quantity || 1,
              shelfPrice: p.storePrice || 0,
              selectedOfferId: p.selectedOfferId || null,
              isComparableOffer: p.isComparableOffer !== false,
              savings:
                p.isComparableOffer !== false && p.storePrice > p.onlinePrice && p.onlinePrice > 0
                  ? p.storePrice - p.onlinePrice
                  : 0,
            })),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || 'Failed to save completed trip to server.';
          return { success: false, error: errMsg };
        }

        const data = await res.json();
        if (data.trip?.id) {
          newCompletedTrip.id = data.trip.id;
        }
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Network error while saving completed trip.',
        };
      }
    }

    // Persist locally for both guest and authenticated sessions
    const updatedCompleted = [newCompletedTrip, ...completedTrips];
    setCompletedTrips(updatedCompleted);
    try {
      await AsyncStorage.setItem(COMPLETED_TRIPS_KEY, JSON.stringify(updatedCompleted));
    } catch (e) {
      console.warn('Failed to save completed trips locally:', e);
    }

    // ONLY clear active trip AFTER saving succeeds!
    setProducts([]);
    try {
      await AsyncStorage.removeItem(GUEST_TRIP_KEY);
    } catch (e) {
      console.warn('Failed to clear active trip:', e);
    }

    return { success: true };
  };

  const persistedSavings = completedTrips.reduce(
    (sum, trip) => sum + (typeof trip.totalSavings === 'number' ? trip.totalSavings : 0),
    0
  );

  const completedTripCount = completedTrips.length;

  return (
    <TripContext.Provider
      value={{
        products,
        completedTrips,
        persistedSavings,
        completedTripCount,
        addProduct,
        increaseQuantity,
        decreaseQuantity,
        removeProduct,
        clearTrip,
        completeTrip,
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
