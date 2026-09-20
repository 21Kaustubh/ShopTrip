import {
    createContext,
    useContext,
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
  onlinePrice: number;
  cheapestRetailer: string;
  savings: number;

  quantity: number;

  /*
   * RETAILER TRACKING
   *
   * This records what the user selected.
   * It does NOT claim that the retailer cart
   * has actually been updated.
   */
  selectedRetailer: string | null;

  /*
   * Number of units the user says they purchased.
   *
   * 0 means ShopTrip does not yet know
   * how many were actually purchased.
   */
  purchasedQuantity: number;

  /*
   * Current known state of this product.
   */
  purchaseStatus: PurchaseStatus;

  /*
   * Whether the user pressed the Buy button.
   */
  retailerBuyClicked: boolean;

  /*
   * Timestamp of the first Buy click.
   */
  retailerOpenedAt: string | null;
};

type TripContextType = {
  products: TripProduct[];

  addProduct: (product: TripProduct) => void;
  increaseQuantity: (barcode: string) => void;
  decreaseQuantity: (barcode: string) => void;
  removeProduct: (id: string) => void;
  clearTrip: () => void;

  /*
   * RETAILER TRACKING ACTIONS
   */
  markRetailerSelected: (
    barcode: string,
    retailer: string
  ) => void;

  markRetailerOpened: (
    barcode: string
  ) => void;

  markPurchased: (
    barcode: string,
    purchasedQuantity: number
  ) => void;

  updatePurchaseStatus: (
    barcode: string,
    status: PurchaseStatus
  ) => void;

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
  const [products, setProducts] = useState<TripProduct[]>(
    []
  );

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

          /*
           * New tracking defaults.
           */
          selectedRetailer:
            product.selectedRetailer ?? null,

          purchasedQuantity:
            product.purchasedQuantity ?? 0,

          purchaseStatus:
            product.purchaseStatus ??
            'PLANNED',

          retailerBuyClicked:
            product.retailerBuyClicked ?? false,

          retailerOpenedAt:
            product.retailerOpenedAt ?? null,
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
   * MARK RETAILER SELECTED
   *
   * This records the user's retailer choice.
   */
  const markRetailerSelected = (
    barcode: string,
    retailer: string
  ) => {
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

  /*
   * MARK RETAILER OPENED
   *
   * This means the user pressed the Buy button
   * and ShopTrip attempted to open the retailer.
   *
   * It does NOT mean the product was added
   * to the retailer cart.
   */
  const markRetailerOpened = (
    barcode: string
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              retailerBuyClicked: true,
              retailerOpenedAt:
                product.retailerOpenedAt ??
                new Date().toISOString(),
              purchaseStatus: 'RETAILER_OPENED',
            }
          : product
      )
    );
  };

  /*
   * MARK PURCHASED
   *
   * This will later be used when we have an
   * official retailer integration or when the
   * user confirms the purchased quantity.
   */
  const markPurchased = (
    barcode: string,
    purchasedQuantity: number
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.barcode === barcode
          ? {
              ...product,
              purchasedQuantity: Math.max(
                0,
                purchasedQuantity
              ),
              purchaseStatus:
                purchasedQuantity > 0
                  ? 'ORDERED'
                  : 'PLANNED',
            }
          : product
      )
    );
  };

  /*
   * UPDATE PURCHASE STATUS
   */
  const updatePurchaseStatus = (
    barcode: string,
    status: PurchaseStatus
  ) => {
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
   */
  const productCount = products.length;

  /*
   * TOTAL NUMBER OF ITEMS
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

        markRetailerSelected,
        markRetailerOpened,
        markPurchased,
        updatePurchaseStatus,

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