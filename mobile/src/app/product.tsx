import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getCheapestPrice,
  getPricesByBarcode,
  type RetailerPrice,
} from '../services/priceService';

import { useTrip } from '../context/TripContext';

export default function ProductScreen() {
  const params = useLocalSearchParams<{
    barcode?: string;
    productName?: string;
    brand?: string;
    category?: string;
    weight?: string;
    unit?: string;
  }>();

  const {
    addProduct,
    products,
  } = useTrip();

  const barcode = String(params.barcode ?? '');
  const productName = String(
    params.productName ?? 'Unknown Product'
  );
  const brand = String(params.brand ?? '');
  const category = String(params.category ?? '');
  const weight = String(params.weight ?? '');
  const unit = String(params.unit ?? '');

  const [storePrice, setStorePrice] = useState('');
  const [prices, setPrices] = useState<RetailerPrice[]>([]);
  const [priceCompared, setPriceCompared] = useState(false);
  const [addedToTrip, setAddedToTrip] = useState(false);

  const storePriceNumber = Number(storePrice);

  const cheapestPrice = getCheapestPrice(prices);

  const savings =
    priceCompared &&
    cheapestPrice &&
    storePriceNumber > cheapestPrice.price
      ? storePriceNumber - cheapestPrice.price
      : 0;

  /*
   * ================================
   * COMPARE PRICES
   * ================================
   *
   * Can be triggered by:
   *
   * 1. Clicking Compare Prices
   * 2. Pressing Enter / Done in MRP field
   */

  const comparePrices = () => {
    if (
      !storePrice.trim() ||
      Number.isNaN(storePriceNumber) ||
      storePriceNumber <= 0
    ) {
      Alert.alert(
        'Enter Store Price',
        'Please enter the price you see in the physical store.'
      );

      return;
    }

    const result = getPricesByBarcode(barcode);

    setPrices(result);
    setPriceCompared(true);
    setAddedToTrip(false);
  };

  /*
   * ================================
   * ADD TO SHOPPING TRIP
   * ================================
   */

  const addToShoppingTrip = () => {
    if (!priceCompared) {
      Alert.alert(
        'Compare Prices First',
        'Please compare prices before adding this product.'
      );

      return;
    }

    if (!cheapestPrice) {
      Alert.alert(
        'No Online Price',
        'No online comparison price is available for this product.'
      );

      return;
    }

    /*
     * Prevent accidental duplicate button presses.
     */
    if (addedToTrip) {
      return;
    }

    addProduct({
      id: `${barcode}-${Date.now()}`,
      barcode,
      productName,
      brand,
      category,
      weight,
      unit,
      storePrice: storePriceNumber,
      onlinePrice: cheapestPrice.price,
      cheapestRetailer: cheapestPrice.retailer,
      savings,
      quantity: 1,
    });

    /*
     * Change the UI immediately after adding.
     */
    setAddedToTrip(true);
  };

  /*
   * ================================
   * VIEW SHOPPING TRIP
   * ================================
   */

  const viewShoppingTrip = () => {
    router.replace('/trip');
  };

  /*
   * ================================
   * SCAN ANOTHER PRODUCT
   * ================================
   */

  const scanAnotherProduct = () => {
    router.push('/scan');
  };

  return (
    <View style={styles.screen}>
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace('/scan')}
          accessibilityRole="button"
          accessibilityLabel="Go back to scanner"
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Product Details
          </Text>

          <Text style={styles.headerSubtitle}>
            ShopTrip Price Comparison
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================= */}
        {/* PRODUCT */}
        {/* ========================= */}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            PRODUCT
          </Text>

          <Text style={styles.productName}>
            {productName}
          </Text>

          {brand ? (
            <Text style={styles.brand}>
              {brand}
            </Text>
          ) : null}

          <View style={styles.infoRow}>
            {category ? (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {category}
                </Text>
              </View>
            ) : null}

            {weight ? (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {weight} {unit}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ========================= */}
        {/* BARCODE */}
        {/* ========================= */}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            BARCODE
          </Text>

          <Text style={styles.barcode}>
            {barcode}
          </Text>

          <Text style={styles.barcodeType}>
            EAN13
          </Text>
        </View>

        {/* ========================= */}
        {/* STORE PRICE */}
        {/* ========================= */}

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>
                Your Store Price
              </Text>

              <Text style={styles.cardDescription}>
                Enter the price you see in the physical store
              </Text>
            </View>

            <View style={styles.rupeeCircle}>
              <Text style={styles.rupeeText}>
                ₹
              </Text>
            </View>
          </View>

          <View style={styles.priceInputContainer}>
            <Text style={styles.inputRupee}>
              ₹
            </Text>

            <TextInput
              style={styles.priceInput}
              value={storePrice}
              onChangeText={(value) => {
                setStorePrice(value);
                setPriceCompared(false);
                setAddedToTrip(false);
              }}
              placeholder="0"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={comparePrices}
            />
          </View>

          <Text style={styles.exampleText}>
            Press Enter / Done to compare prices.
          </Text>
        </View>

        {/* ========================= */}
        {/* ONLINE COMPARISON */}
        {/* ========================= */}

        {priceCompared && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>
                  Online Price Comparison
                </Text>

                <Text style={styles.cardDescription}>
                  Current demo prices for this MVP
                </Text>
              </View>

              <Text style={styles.moneyEmoji}>
                💰
              </Text>
            </View>

            {prices.length === 0 ? (
              <View style={styles.noPrices}>
                <Text style={styles.noPricesTitle}>
                  No online prices found
                </Text>

                <Text style={styles.noPricesText}>
                  We don't have comparison data for this product yet.
                </Text>
              </View>
            ) : (
              prices.map((item, index) => {
                const isCheapest =
                  cheapestPrice?.retailer ===
                    item.retailer &&
                  cheapestPrice?.price === item.price;

                return (
                  <View
                    key={`${item.retailer}-${index}`}
                    style={[
                      styles.retailerRow,
                      index === prices.length - 1 &&
                        styles.lastRetailerRow,
                    ]}
                  >
                    <View style={styles.retailerLeft}>
                      <View style={styles.retailerNameRow}>
                        <Text style={styles.retailerName}>
                          {item.retailer}
                        </Text>

                        {isCheapest && (
                          <View style={styles.cheapestBadge}>
                            <Text style={styles.cheapestText}>
                              CHEAPEST
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.deliveryTime}>
                        {item.deliveryTime}
                      </Text>
                    </View>

                    <Text style={styles.retailerPrice}>
                      ₹{item.price}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ========================= */}
        {/* SAVINGS */}
        {/* ========================= */}

        {priceCompared && cheapestPrice && (
          <View style={styles.savingsCard}>
            <Text style={styles.savingsEmoji}>
              🎉
            </Text>

            <View style={styles.savingsContent}>
              <Text style={styles.savingsLabel}>
                POTENTIAL SAVINGS
              </Text>

              <Text style={styles.savingsAmount}>
                ₹{savings.toFixed(2)}
              </Text>

              <Text style={styles.savingsDescription}>
                You could save by buying from{' '}
                {cheapestPrice.retailer}.
              </Text>
            </View>
          </View>
        )}

        {/* ========================= */}
        {/* ACTION BUTTONS */}
        {/* ========================= */}

        {!priceCompared && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={comparePrices}
            accessibilityRole="button"
            accessibilityLabel="Compare prices"
          >
            <Text style={styles.primaryButtonText}>
              Compare Prices
            </Text>
          </Pressable>
        )}

        {priceCompared && !addedToTrip && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={addToShoppingTrip}
            accessibilityRole="button"
            accessibilityLabel="Add product to shopping trip"
          >
            <Text style={styles.primaryButtonText}>
              🛒 Add to Shopping Trip
            </Text>
          </Pressable>
        )}

        {/* ========================= */}
        {/* ADDED TO TRIP */}
        {/* ========================= */}

        {addedToTrip && (
          <View style={styles.addedSection}>
            <View style={styles.addedBanner}>
              <Text style={styles.addedBannerText}>
                ✓ Product Added to Shopping Trip
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={viewShoppingTrip}
              accessibilityRole="button"
              accessibilityLabel="View shopping trip"
            >
              <Text style={styles.primaryButtonText}>
                🛒 View Shopping Trip
              </Text>
            </Pressable>
          </View>
        )}

        {/* ========================= */}
        {/* CONTINUE SHOPPING */}
        {/* ========================= */}

        {addedToTrip && (
          <View style={styles.continueCard}>
            <Text style={styles.continueEmoji}>
              📷
            </Text>

            <Text style={styles.continueTitle}>
              Continue Shopping
            </Text>

            <Text style={styles.continueDescription}>
              Scan another product to continue your current
              shopping trip.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={scanAnotherProduct}
              accessibilityRole="button"
              accessibilityLabel="Scan another product"
            >
              <Text style={styles.secondaryButtonText}>
                📷 Scan Another Product
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

  header: {
    height: 72,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111217',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#777982',
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#85868d',
    letterSpacing: 1,
    marginBottom: 8,
  },

  productName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111217',
    lineHeight: 29,
  },

  brand: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#65666d',
  },

  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  infoBadge: {
    backgroundColor: '#f0f0f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55565d',
  },

  barcode: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111217',
    letterSpacing: 1,
  },

  barcodeType: {
    marginTop: 4,
    fontSize: 10,
    color: '#8a8b91',
    fontWeight: '600',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111217',
  },

  cardDescription: {
    marginTop: 4,
    fontSize: 11,
    color: '#777982',
  },

  rupeeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111217',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rupeeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  priceInputContainer: {
    height: 54,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#d9dade',
    borderRadius: 12,
    backgroundColor: '#f8f8fa',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  inputRupee: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111217',
  },

  priceInput: {
    flex: 1,
    height: 52,
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#111217',
    outlineStyle: 'none',
  } as any,

  exampleText: {
    marginTop: 7,
    fontSize: 10,
    color: '#85868d',
  },

  moneyEmoji: {
    fontSize: 21,
  },

  retailerRow: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#ededee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  lastRetailerRow: {
    borderBottomWidth: 0,
  },

  retailerLeft: {
    flex: 1,
  },

  retailerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  retailerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111217',
  },

  cheapestBadge: {
    backgroundColor: '#111217',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  cheapestText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#ffffff',
  },

  deliveryTime: {
    marginTop: 4,
    fontSize: 10,
    color: '#7e7f86',
  },

  retailerPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111217',
  },

  noPrices: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noPricesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111217',
  },

  noPricesText: {
    marginTop: 5,
    fontSize: 11,
    color: '#777982',
    textAlign: 'center',
  },

  savingsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  savingsEmoji: {
    fontSize: 28,
    marginRight: 14,
  },

  savingsContent: {
    flex: 1,
  },

  savingsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#85868d',
    letterSpacing: 1,
  },

  savingsAmount: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '900',
    color: '#111217',
  },

  savingsDescription: {
    marginTop: 3,
    fontSize: 10,
    color: '#777982',
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#111217',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.995 }],
  },

  addedSection: {
    marginBottom: 4,
  },

  addedBanner: {
    backgroundColor: '#e9f7ed',
    borderWidth: 1,
    borderColor: '#c9e9d1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  addedBannerText: {
    color: '#20733a',
    fontSize: 13,
    fontWeight: '800',
  },

  continueCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    padding: 16,
    marginTop: 2,
  },

  continueEmoji: {
    fontSize: 25,
    marginBottom: 8,
  },

  continueTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111217',
  },

  continueDescription: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: '#777982',
  },

  secondaryButton: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#111217',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});