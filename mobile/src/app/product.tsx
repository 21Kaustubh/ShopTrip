import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCheapestPrice,
  getPricesByBarcode,
  RetailerPrice,
} from '../services/priceService';

export default function ProductScreen() {
  const params = useLocalSearchParams<{
    barcode?: string;
    barcodeType?: string;
    productName?: string;
    brand?: string;
    category?: string;
    weight?: string;
    unit?: string;
  }>();

  const [storePrice, setStorePrice] = useState('');
  const [priceSaved, setPriceSaved] = useState(false);

  const barcode = params.barcode || '';

  const productName = params.productName || 'Unknown Product';
  const brand = params.brand || 'Unknown Brand';
  const category = params.category || 'Other';
  const weight = params.weight || '';
  const unit = params.unit || '';

  const onlinePrices = getPricesByBarcode(barcode);
  const cheapest = getCheapestPrice(onlinePrices);

  const storePriceNumber = parseFloat(storePrice);

  const savings =
    !isNaN(storePriceNumber) && cheapest
      ? Math.max(storePriceNumber - cheapest.price, 0)
      : 0;

  const handleSavePrice = () => {
    if (!storePrice.trim()) {
      return;
    }

    setPriceSaved(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.label}>SHOPTRIP</Text>
              <Text style={styles.title}>Product Details</Text>
            </View>
          </View>

          {/* Product Card */}
          <View style={styles.productCard}>
            <View style={styles.productIconContainer}>
              <Text style={styles.productIcon}>🛒</Text>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productCategory}>
                {category.toUpperCase()}
              </Text>

              <Text style={styles.productName}>
                {productName}
              </Text>

              <Text style={styles.brand}>
                {brand}
              </Text>

              {weight && unit ? (
                <View style={styles.weightBadge}>
                  <Text style={styles.weightText}>
                    {weight} {unit}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Barcode */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionLabel}>
              BARCODE
            </Text>

            <Text style={styles.barcode}>
              {barcode || 'Not available'}
            </Text>

            {params.barcodeType ? (
              <Text style={styles.barcodeType}>
                {params.barcodeType.toUpperCase()}
              </Text>
            ) : null}
          </View>

          {/* Store Price */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Your Store Price
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Enter the price you see in the physical store
                </Text>
              </View>

              <Text style={styles.priceIcon}>₹</Text>
            </View>

            <View style={styles.priceInputContainer}>
              <Text style={styles.rupeeSymbol}>₹</Text>

              <TextInput
                style={styles.priceInput}
                value={storePrice}
                onChangeText={(text) => {
                  setStorePrice(text);
                  setPriceSaved(false);
                }}
                placeholder="0.00"
                placeholderTextColor="#A0A4AA"
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>

            <Text style={styles.priceHint}>
              Example: Enter 50 if the product costs ₹50 at
              your store.
            </Text>
          </View>

          {/* Online Price Comparison */}
          {onlinePrices.length > 0 ? (
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonHeader}>
                <View style={styles.comparisonTitleContainer}>
                  <Text style={styles.sectionTitle}>
                    Online Price Comparison
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Current demo prices for this MVP
                  </Text>
                </View>

                <Text style={styles.comparisonIcon}>
                  💰
                </Text>
              </View>

              {onlinePrices.map(
                (item: RetailerPrice, index: number) => {
                  const isCheapest =
                    cheapest?.retailer === item.retailer;

                  return (
                    <View
                      key={item.retailer}
                      style={[
                        styles.retailerRow,
                        index === onlinePrices.length - 1 &&
                          styles.lastRetailerRow,
                      ]}
                    >
                      <View style={styles.retailerInfo}>
                        <View style={styles.retailerNameRow}>
                          <Text style={styles.retailerName}>
                            {item.retailer}
                          </Text>

                          {isCheapest ? (
                            <View style={styles.cheapestBadge}>
                              <Text style={styles.cheapestBadgeText}>
                                CHEAPEST
                              </Text>
                            </View>
                          ) : null}
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
                }
              )}
            </View>
          ) : (
            <View style={styles.noPricesCard}>
              <Text style={styles.noPricesIcon}>🔎</Text>

              <Text style={styles.noPricesTitle}>
                No online prices yet
              </Text>

              <Text style={styles.noPricesText}>
                We don't have comparison data for this product
                yet.
              </Text>
            </View>
          )}

          {/* Savings */}
          {priceSaved && cheapest ? (
            <View style={styles.savingsCard}>
              <Text style={styles.savingsEmoji}>🎉</Text>

              <View style={styles.savingsContent}>
                <Text style={styles.savingsLabel}>
                  POTENTIAL SAVINGS
                </Text>

                <Text style={styles.savingsAmount}>
                  ₹{savings.toFixed(2)}
                </Text>

                {savings > 0 ? (
                  <Text style={styles.savingsText}>
                    You could save by buying from{' '}
                    {cheapest.retailer}.
                  </Text>
                ) : (
                  <Text style={styles.savingsText}>
                    The store price is already at or below our
                    cheapest demo online price.
                  </Text>
                )}
              </View>
            </View>
          ) : null}

          {/* Save Price Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !storePrice.trim() &&
                styles.continueButtonDisabled,
            ]}
            onPress={handleSavePrice}
            disabled={!storePrice.trim()}
          >
            <Text style={styles.continueButtonText}>
              {priceSaved
                ? 'Price Compared ✓'
                : 'Compare Prices'}
            </Text>
          </TouchableOpacity>

          {/* Future */}
          <View style={styles.nextCard}>
            <Text style={styles.nextIcon}>🛍️</Text>

            <View style={styles.nextContent}>
              <Text style={styles.nextTitle}>
                Next: Add to Shopping Trip
              </Text>

              <Text style={styles.nextText}>
                After comparing prices, you will be able to add
                this product to your current Shopping Trip.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: '#111318',
  },

  headerText: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#70757D',
    letterSpacing: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111318',
    marginTop: 2,
  },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  productIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  productIcon: {
    fontSize: 38,
  },

  productInfo: {
    flex: 1,
  },

  productCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8F97',
    letterSpacing: 1,
    marginBottom: 5,
  },

  productName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111318',
  },

  brand: {
    fontSize: 14,
    color: '#70757D',
    marginTop: 3,
  },

  weightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F2F4',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 9,
  },

  weightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555A63',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8F97',
    letterSpacing: 1,
    marginBottom: 6,
  },

  barcode: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111318',
    letterSpacing: 1,
  },

  barcodeType: {
    fontSize: 10,
    fontWeight: '700',
    color: '#70757D',
    marginTop: 5,
  },

  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    marginBottom: 14,
  },

  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111318',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#70757D',
    marginTop: 4,
    maxWidth: 290,
    lineHeight: 17,
  },

  priceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111318',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
  },

  priceInputContainer: {
    height: 60,
    borderRadius: 15,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#DADDE1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  rupeeSymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111318',
    marginRight: 8,
  },

  priceInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#111318',
    height: '100%',
  },

  priceHint: {
    fontSize: 11,
    color: '#8A8F97',
    lineHeight: 16,
    marginTop: 9,
  },

  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    marginBottom: 14,
  },

  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  comparisonTitleContainer: {
    flex: 1,
  },

  comparisonIcon: {
    fontSize: 27,
    marginLeft: 10,
  },

  retailerRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEDEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  lastRetailerRow: {
    borderBottomWidth: 0,
  },

  retailerInfo: {
    flex: 1,
  },

  retailerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  retailerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111318',
  },

  deliveryTime: {
    fontSize: 11,
    color: '#8A8F97',
    marginTop: 3,
  },

  cheapestBadge: {
    backgroundColor: '#111318',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 7,
  },

  cheapestBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  retailerPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111318',
    marginLeft: 12,
  },

  noPricesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    alignItems: 'center',
    marginBottom: 14,
  },

  noPricesIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  noPricesTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111318',
  },

  noPricesText: {
    fontSize: 12,
    color: '#70757D',
    textAlign: 'center',
    marginTop: 4,
  },

  savingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  savingsEmoji: {
    fontSize: 34,
    marginRight: 14,
  },

  savingsContent: {
    flex: 1,
  },

  savingsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8F97',
    letterSpacing: 1,
  },

  savingsAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111318',
    marginTop: 2,
  },

  savingsText: {
    fontSize: 11,
    color: '#70757D',
    lineHeight: 16,
    marginTop: 3,
  },

  continueButton: {
    backgroundColor: '#111318',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },

  continueButtonDisabled: {
    opacity: 0.45,
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  nextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    flexDirection: 'row',
  },

  nextIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  nextContent: {
    flex: 1,
  },

  nextTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111318',
  },

  nextText: {
    fontSize: 12,
    color: '#70757D',
    lineHeight: 18,
    marginTop: 4,
  },

  bottomSpace: {
    height: 20,
  },
});