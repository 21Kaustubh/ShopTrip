import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTrip } from '../context/TripContext';

export default function TripScreen() {
  const {
    products,
    productCount,
    totalItems,
    totalSavings,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearTrip,
  } = useTrip();

  // TOTAL STORE PRICE
  const totalStorePrice = products.reduce(
    (total, product) =>
      total +
      product.storePrice * (product.quantity ?? 1),
    0
  );

  // TOTAL ONLINE PRICE
  const totalOnlinePrice = products.reduce(
    (total, product) =>
      total +
      product.onlinePrice * (product.quantity ?? 1),
    0
  );

  // SCAN PRODUCT
  const scanAnotherProduct = () => {
    router.push('/scan');
  };

  // SEARCH PRODUCT
  const searchProduct = () => {
    router.push('/search');
  };

  // FINISH TRIP
  const finishShoppingTrip = () => {
    clearTrip();
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSmall}>
            SHOPTRIP
          </Text>

          <Text style={styles.headerTitle}>
            Shopping Trip
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================= */}
        {/* TRIP SUMMARY */}
        {/* ========================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                CURRENT TRIP
              </Text>

              <Text style={styles.tripTitle}>
                Shopping Trip #001 🛍️
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                ACTIVE
              </Text>
            </View>
          </View>

          {/* MAIN STATS */}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {totalItems}
              </Text>

              <Text style={styles.statLabel}>
                Total Items
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                ₹{totalSavings.toFixed(0)}
              </Text>

              <Text style={styles.statLabel}>
                Potential Savings
              </Text>
            </View>
          </View>

          {/* PRICE SUMMARY */}

          {productCount > 0 && (
            <View style={styles.priceSummary}>
              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryLabel}>
                  Different Products
                </Text>

                <Text style={styles.priceSummaryValue}>
                  {productCount}
                </Text>
              </View>

              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryLabel}>
                  Store Total
                </Text>

                <Text style={styles.priceSummaryValue}>
                  ₹{totalStorePrice.toFixed(2)}
                </Text>
              </View>

              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryLabel}>
                  Cheapest Online Total
                </Text>

                <Text style={styles.priceSummaryValue}>
                  ₹{totalOnlinePrice.toFixed(2)}
                </Text>
              </View>

              <View style={styles.priceSummaryRow}>
                <Text style={styles.savingsTotalLabel}>
                  Total Potential Savings
                </Text>

                <Text style={styles.savingsTotalValue}>
                  ₹{totalSavings.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ========================= */}
        {/* SCAN + SEARCH */}
        {/* ========================= */}

        <View style={styles.actionRow}>
          {/* SCAN PRODUCT */}

          <Pressable
            style={styles.actionButton}
            onPress={scanAnotherProduct}
          >
            <View style={styles.actionIconBox}>
              <Text style={styles.actionIcon}>
                📷
              </Text>
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                Scan Product
              </Text>

              <Text style={styles.actionSubtitle}>
                Scan barcode
              </Text>
            </View>
          </Pressable>

          {/* SEARCH PRODUCT */}

          <Pressable
            style={styles.actionButton}
            onPress={searchProduct}
          >
            <View style={styles.actionIconBox}>
              <Text style={styles.actionIcon}>
                🔍
              </Text>
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                Search Product
              </Text>

              <Text style={styles.actionSubtitle}>
                Find manually
              </Text>
            </View>
          </Pressable>
        </View>

        {/* ========================= */}
        {/* PRODUCTS TITLE */}
        {/* ========================= */}

        <Text style={styles.productsHeading}>
          Trip Products
        </Text>

        {/* ========================= */}
        {/* EMPTY STATE */}
        {/* ========================= */}

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>
              🛒
            </Text>

            <Text style={styles.emptyTitle}>
              No products yet
            </Text>

            <Text style={styles.emptyDescription}>
              Scan or search for a product to start
              building your shopping trip.
            </Text>

            <View style={styles.emptyActions}>
              <Pressable
                style={styles.emptyActionButton}
                onPress={scanAnotherProduct}
              >
                <Text style={styles.emptyActionText}>
                  📷 Scan
                </Text>
              </Pressable>

              <Pressable
                style={styles.emptyActionButton}
                onPress={searchProduct}
              >
                <Text style={styles.emptyActionText}>
                  🔍 Search
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ========================= */
          /* PRODUCT LIST */
          /* ========================= */

          <View style={styles.productList}>
            {products.map((product, index) => {
              const quantity =
                product.quantity ?? 1;

              const productStoreTotal =
                product.storePrice * quantity;

              const productOnlineTotal =
                product.onlinePrice * quantity;

              const productSavingsTotal =
                product.savings * quantity;

              return (
                <View
                  key={product.id}
                  style={styles.productCard}
                >
                  {/* PRODUCT HEADER */}

                  <View style={styles.productTop}>
                    <View style={styles.productIcon}>
                      <Text style={styles.productIconText}>
                        {product.category === 'Coffee'
                          ? '☕'
                          : product.category ===
                            'Instant Soup'
                          ? '🍅'
                          : '🛒'}
                      </Text>
                    </View>

                    <View style={styles.productMain}>
                      <Text style={styles.productName}>
                        {product.productName}
                      </Text>

                      <Text style={styles.productBrand}>
                        {product.brand}
                        {product.weight
                          ? ` • ${product.weight} ${product.unit}`
                          : ''}
                      </Text>
                    </View>

                    <Text style={styles.productNumber}>
                      #{index + 1}
                    </Text>
                  </View>

                  {/* ========================= */}
                  {/* QUANTITY */}
                  {/* ========================= */}

                  <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>
                      QUANTITY
                    </Text>

                    <View style={styles.quantityControl}>
                      {/* MINUS */}

                      <Pressable
                        style={styles.quantityButton}
                        onPress={() =>
                          decreaseQuantity(
                            product.barcode
                          )
                        }
                      >
                        <Text
                          style={
                            styles.quantityButtonText
                          }
                        >
                          −
                        </Text>
                      </Pressable>

                      {/* NUMBER */}

                      <View
                        style={styles.quantityNumberBox}
                      >
                        <Text
                          style={styles.quantityNumber}
                        >
                          {quantity}
                        </Text>
                      </View>

                      {/* PLUS */}

                      <Pressable
                        style={styles.quantityButton}
                        onPress={() =>
                          increaseQuantity(
                            product.barcode
                          )
                        }
                      >
                        <Text
                          style={
                            styles.quantityButtonText
                          }
                        >
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* ========================= */}
                  {/* PRICE DETAILS */}
                  {/* ========================= */}

                  <View style={styles.productPrices}>
                    {/* STORE */}

                    <View style={styles.priceColumn}>
                      <Text style={styles.priceLabel}>
                        YOUR STORE
                      </Text>

                      <Text style={styles.storePrice}>
                        ₹{productStoreTotal.toFixed(2)}
                      </Text>

                      <Text style={styles.unitPrice}>
                        ₹{product.storePrice.toFixed(2)} each
                      </Text>
                    </View>

                    {/* ARROW */}

                    <View style={styles.priceArrow}>
                      <Text style={styles.priceArrowText}>
                        →
                      </Text>
                    </View>

                    {/* ONLINE */}

                    <View style={styles.priceColumn}>
                      <Text style={styles.priceLabel}>
                        BEST ONLINE
                      </Text>

                      <Text style={styles.onlinePrice}>
                        ₹{productOnlineTotal.toFixed(2)}
                      </Text>

                      <Text style={styles.retailerName}>
                        {product.cheapestRetailer} • ₹
                        {product.onlinePrice.toFixed(2)} each
                      </Text>
                    </View>

                    {/* SAVINGS */}

                    <View style={styles.savingBox}>
                      <Text style={styles.savingBoxLabel}>
                        SAVE
                      </Text>

                      <Text style={styles.savingBoxAmount}>
                        ₹{productSavingsTotal.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* REMOVE */}

                  <Pressable
                    style={styles.removeButton}
                    onPress={() =>
                      removeProduct(product.id)
                    }
                  >
                    <Text style={styles.removeButtonText}>
                      Remove from Trip
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* ========================= */}
        {/* FINISH SHOPPING */}
        {/* ========================= */}

        {productCount > 0 && (
          <View style={styles.finishSection}>
            <Text style={styles.finishTitle}>
              Done Shopping?
            </Text>

            <Text style={styles.finishDescription}>
              Finish this trip to save the final summary.
            </Text>

            <Pressable
              style={styles.finishButton}
              onPress={finishShoppingTrip}
            >
              <Text style={styles.finishButtonText}>
                🛑 Finish Shopping Trip
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ================================= */
/* STYLES */
/* ================================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f7f8',
  },

  /* HEADER */

  header: {
    height: 72,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f0f0f2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#111217',
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },

  headerSmall: {
    fontSize: 9,
    fontWeight: '900',
    color: '#777982',
    letterSpacing: 1.4,
  },

  headerTitle: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '900',
    color: '#111217',
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#85868d',
    letterSpacing: 1,
    marginBottom: 7,
  },

  tripTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111217',
  },

  activeBadge: {
    backgroundColor: '#e5f7e9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  activeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#28733d',
  },

  statsRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },

  stat: {
    flex: 1,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111217',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#777982',
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#dedee1',
    marginHorizontal: 20,
  },

  priceSummary: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#ededee',
  },

  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  priceSummaryLabel: {
    fontSize: 11,
    color: '#777982',
  },

  priceSummaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111217',
  },

  savingsTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111217',
  },

  savingsTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111217',
  },

  /* SCAN + SEARCH */

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    minHeight: 68,
    backgroundColor: '#111217',
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#292a2f',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIcon: {
    fontSize: 20,
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  actionTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  actionSubtitle: {
    marginTop: 3,
    color: '#aaaab0',
    fontSize: 9,
  },

  /* PRODUCTS */

  productsHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111217',
    marginBottom: 10,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111217',
  },

  emptyDescription: {
    marginTop: 5,
    fontSize: 10,
    color: '#777982',
    textAlign: 'center',
    lineHeight: 16,
  },

  emptyActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  emptyActionButton: {
    backgroundColor: '#f0f0f2',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
  },

  emptyActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111217',
  },

  productList: {
    gap: 12,
  },

  productCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    padding: 15,
  },

  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f0f2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productIconText: {
    fontSize: 23,
  },

  productMain: {
    flex: 1,
    marginLeft: 11,
  },

  productName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111217',
    lineHeight: 19,
  },

  productBrand: {
    marginTop: 3,
    fontSize: 10,
    color: '#777982',
  },

  productNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#999aa0',
    marginLeft: 8,
  },

  /* QUANTITY */

  quantitySection: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#ededee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quantityLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#85868d',
    letterSpacing: 0.8,
  },

  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcdde0',
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#f8f8fa',
  },

  quantityButton: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eeeeef',
  },

  quantityButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111217',
  },

  quantityNumberBox: {
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  quantityNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111217',
  },

  /* PRICES */

  productPrices: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#ededee',
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceColumn: {
    flex: 1,
  },

  priceLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#85868d',
    letterSpacing: 0.8,
  },

  storePrice: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '900',
    color: '#111217',
  },

  onlinePrice: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '900',
    color: '#111217',
  },

  unitPrice: {
    marginTop: 2,
    fontSize: 8,
    color: '#85868d',
  },

  retailerName: {
    marginTop: 2,
    fontSize: 8,
    color: '#777982',
    fontWeight: '700',
  },

  priceArrow: {
    paddingHorizontal: 8,
  },

  priceArrowText: {
    fontSize: 17,
    color: '#999aa0',
    fontWeight: '700',
  },

  savingBox: {
    backgroundColor: '#eef8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },

  savingBoxLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#5b7d62',
    letterSpacing: 0.7,
  },

  savingBoxAmount: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '900',
    color: '#24723a',
  },

  removeButton: {
    marginTop: 13,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 9,
  },

  removeButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777982',
  },

  /* FINISH */

  finishSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dedee1',
  },

  finishTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#111217',
  },

  finishDescription: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 10,
    color: '#777982',
  },

  finishButton: {
    minHeight: 50,
    backgroundColor: '#e7e8eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  finishButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111217',
  },
});