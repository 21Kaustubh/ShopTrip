import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

export type TripProduct = {
  id: string;
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  weight: string;
  unit: string;

  storePrice: number;
  onlinePrice: number;
  cheapestRetailer: string;
  savings: number;

  quantity: number;
};

type TripContextType = {
  products: TripProduct[];

  addProduct: (product: TripProduct) => void;
  increaseQuantity: (barcode: string) => void;
  decreaseQuantity: (barcode: string) => void;
  removeProduct: (id: string) => void;
  clearTrip: () => void;

  totalSavings: number;
  productCount: number;
  totalItems: number;
};

const TripContext = createContext<
  TripContextType | undefined
>(undefined);

export function TripProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] = useState<TripProduct[]>([]);

  /*
   * ADD PRODUCT
   *
   * If the same barcode already exists:
   * increase quantity instead of creating
   * another product card.
   */
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
          quantity: 1,
        },
      ];
    });
  };

  /*
   * INCREASE QUANTITY
   */
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

  /*
   * DECREASE QUANTITY
   *
   * Minimum quantity is 1.
   */
  const decreaseQuantity = (barcode: string) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              quantity: Math.max(
                1,
                (product.quantity ?? 1) - 1
              ),
            }
          : product
      )
    );
  };

  /*
   * REMOVE ENTIRE PRODUCT
   */
  const removeProduct = (id: string) => {
    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== id
      )
    );
  };

  /*
   * CLEAR CURRENT TRIP
   */
  const clearTrip = () => {
    setProducts([]);
  };

  /*
   * TOTAL SAVINGS
   *
   * Unit saving × quantity
   */
  const totalSavings = products.reduce(
    (total, product) =>
      total +
      product.savings * (product.quantity ?? 1),
    0
  );

  /*
   * NUMBER OF DIFFERENT PRODUCTS
   *
   * Example:
   * Knorr × 3
   * BRU × 2
   *
   * productCount = 2
   */
  const productCount = products.length;

  /*
   * TOTAL NUMBER OF ITEMS
   *
   * Example:
   * Knorr × 3
   * BRU × 2
   *
   * totalItems = 5
   */
  const totalItems = products.reduce(
    (total, product) =>
      total + (product.quantity ?? 1),
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
        totalSavings,
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
    throw new Error(
      'useTrip must be used inside TripProvider'
    );
  }

  return context;
}