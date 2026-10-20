import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle, useAppTheme } from '../context/ThemeContext';
import { useTrip } from '../context/TripContext';
import {
  DEMO_PRICE_DISCLAIMER,
  getCheapestPrice,
  getPricesByBarcode,
  type RetailerPrice,
} from '../services/priceService';

export default function ProductScreen() {
  const { colors, isDark } = useAppTheme();
  const params = useLocalSearchParams<{
    barcode?: string;
    barcodeType?: string;
    productName?: string;
    brand?: string;
    category?: string;
    weight?: string;
    unit?: string;
  }>();

  const { addProduct, markRetailerOpened } = useTrip();

  const barcode = String(params.barcode ?? '').trim();
  const productName = String(params.productName ?? 'Product Details');
  const brand = String(params.brand ?? '');
  const category = String(params.category ?? '');
  const weight = String(params.weight ?? '');
  const unit = String(params.unit ?? '');

  const [storePrice, setStorePrice] = useState('');
  const [prices, setPrices] = useState<RetailerPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerPrice | null>(null);
  const [addedToTrip, setAddedToTrip] = useState(false);

  // Load online retailer offers from backend API
  useEffect(() => {
    let active = true;

    async function loadOffers() {
      if (!barcode) {
        setLoadingPrices(false);
        return;
      }

      setLoadingPrices(true);
      try {
        const result = await getPricesByBarcode(barcode);
        if (active) {
          setPrices(result);
          if (result.length > 0) {
            setSelectedRetailer(getCheapestPrice(result));
          }
        }
      } catch (err) {
        if (active) {
          setPrices([]);
        }
      } finally {
        if (active) {
          setLoadingPrices(false);
        }
      }
    }

    loadOffers();

    return () => {
      active = false;
    };
  }, [barcode]);

  const storePriceNumber = Number(storePrice);
  const cheapestPrice = getCheapestPrice(prices);

  // Real-time savings calculation (only when valid online price > 0 and storePrice > onlinePrice)
  const savings =
    selectedRetailer &&
    selectedRetailer.price > 0 &&
    !Number.isNaN(storePriceNumber) &&
    storePriceNumber > selectedRetailer.price
      ? storePriceNumber - selectedRetailer.price
      : 0;

  const selectRetailer = (retailer: RetailerPrice) => {
    setSelectedRetailer(retailer);
    setAddedToTrip(false);
  };

  const getRetailerSearchUrl = (retailer: string, product: string) => {
    const query = encodeURIComponent(product.trim());
    const retailerUrls: Record<string, string> = {
      Blinkit: `https://blinkit.com/s/?q=${query}`,
      Zepto: `https://www.zeptonow.com/search?query=${query}`,
      Amazon: `https://www.amazon.in/s?k=${query}`,
      BigBasket: `https://www.bigbasket.com/ps/?q=${query}`,
      Flipkart: `https://www.flipkart.com/search?q=${query}`,
      'Flipkart Minutes': `https://www.flipkart.com/search?q=${query}`,
      Instamart: `https://www.swiggy.com/instamart/search?query=${query}`,
    };
    return retailerUrls[retailer] ?? `https://www.google.com/search?q=${encodeURIComponent(`${product} ${retailer}`)}`;
  };

  const buyFromRetailer = async () => {
    if (!selectedRetailer) {
      Alert.alert('Select a Retailer', 'Please select a retailer before proceeding.');
      return;
    }

    const retailerUrl = getRetailerSearchUrl(selectedRetailer.retailer, productName);

    try {
      const supported = await Linking.canOpenURL(retailerUrl);
      if (!supported) {
        Alert.alert('Unable to Open Link', `Could not open ${selectedRetailer.retailer}.`);
        return;
      }
      await Linking.openURL(retailerUrl);
      markRetailerOpened(barcode);
    } catch {
      Alert.alert('Unable to Open Link', `Could not open ${selectedRetailer.retailer}.`);
    }
  };

  const addToShoppingTrip = () => {
    if (!storePrice.trim() || Number.isNaN(storePriceNumber) || storePriceNumber <= 0) {
      Alert.alert(
        'Enter Shelf Price',
        'Please enter your physical store shelf price before adding this item to your trip.'
      );
      return;
    }

    if (addedToTrip) {
      return;
    }

    const onlinePrice = selectedRetailer ? selectedRetailer.price : 0;
    const cheapestRetailer = selectedRetailer ? selectedRetailer.retailer : 'In-Store Only';

    addProduct({
      id: `${barcode}-${Date.now()}`,
      barcode,
      productName,
      brand,
      category,
      weight,
      unit,
      storePrice: storePriceNumber,
      onlinePrice,
      cheapestRetailer,
      savings,
      quantity: 1,
      selectedRetailer: selectedRetailer ? selectedRetailer.retailer : null,
      purchasedQuantity: 0,
      purchaseStatus: selectedRetailer ? 'RETAILER_SELECTED' : 'PLANNED',
      retailerBuyClicked: false,
      retailerOpenedAt: null,
    });

    setAddedToTrip(true);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topbar, { borderBottomColor: colors.border, backgroundColor: colors.topbarBg }]}>
        <Pressable
          accessibilityLabel="Back to scanner"
          style={[styles.backButton, { backgroundColor: colors.chipBg }]}
          onPress={() => router.replace('/scan')}
        >
          <Text style={[styles.backArrow, { color: colors.chipText }]}>←</Text>
        </Pressable>
        <View style={styles.navTitles}>
          <Text style={[styles.navEyebrow, { color: colors.textMuted }]}>SHOPTRIP</Text>
          <Text style={[styles.navTitle, { color: colors.text }]}>Price Comparison</Text>
        </View>

        <View style={styles.topbarRight}>
          <ThemeToggle />
          <Pressable
            accessibilityLabel="View shopping trip"
            style={[styles.tripBadge, { backgroundColor: colors.badgeBg }]}
            onPress={() => router.push('/trip')}
          >
            <Text style={[styles.tripBadgeText, { color: colors.badgeText }]}>Trip</Text>
            <Text style={[styles.tripBadgeArrow, { color: colors.badgeText }]}>→</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* PRODUCT OVERVIEW CARD */}
        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.categoryPill, { backgroundColor: colors.badgeBg }]}>
              <Text style={[styles.categoryPillText, { color: colors.badgeText }]}>{category || 'Grocery'}</Text>
            </View>
            <Text style={[styles.barcodeLabel, { color: colors.textMuted }]}>EAN {barcode}</Text>
          </View>

          <Text style={[styles.productNameText, { color: colors.text }]}>{productName}</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            {brand ? `${brand} · ` : ''}
            {weight ? `${weight} ${unit}` : 'Standard package'}
          </Text>

          <View style={[styles.productMetaTags, { borderTopColor: colors.border }]}>
            <View style={[styles.metaTag, { backgroundColor: colors.cardMuted }]}>
              <Text style={[styles.metaTagLabel, { color: colors.textMuted }]}>Brand</Text>
              <Text style={[styles.metaTagValue, { color: colors.text }]}>{brand || 'Verified'}</Text>
            </View>
            <View style={[styles.metaTag, { backgroundColor: colors.cardMuted }]}>
              <Text style={[styles.metaTagLabel, { color: colors.textMuted }]}>Package</Text>
              <Text style={[styles.metaTagValue, { color: colors.text }]}>{weight ? `${weight} ${unit}` : '1 unit'}</Text>
            </View>
            <View style={[styles.metaTag, { backgroundColor: colors.cardMuted }]}>
              <Text style={[styles.metaTagLabel, { color: colors.textMuted }]}>Barcode</Text>
              <Text style={[styles.metaTagValue, { color: colors.text }]}>{barcode}</Text>
            </View>
          </View>
        </View>

        {/* STORE SHELF PRICE INPUT */}
        <View style={[styles.storeInputCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.inputCardHeader}>
            <View>
              <Text style={[styles.kicker, { color: colors.textMuted }]}>STEP 1</Text>
              <Text style={[styles.inputCardTitle, { color: colors.text }]}>Your in-store shelf price</Text>
            </View>
            <View style={[styles.iconChip, { backgroundColor: colors.chipBg }]}>
              <Text style={[styles.iconChipGlyph, { color: colors.chipText }]}>₹</Text>
            </View>
          </View>
          <Text style={[styles.inputCardDesc, { color: colors.textSecondary }]}>
            Enter the physical store price to calculate instant savings against online merchants.
          </Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputPrefix, { backgroundColor: colors.chipBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.inputPrefixText, { color: colors.chipText }]}>₹</Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                },
              ]}
              value={storePrice}
              onChangeText={(val) => {
                setStorePrice(val);
                setAddedToTrip(false);
              }}
              placeholder="e.g. 210"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* RETAILER OFFERS SECTION */}
        <View style={styles.retailerSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.kicker, { color: colors.textMuted }]}>STEP 2</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Verified Retailer Offers</Text>
            </View>
            <Text style={[styles.retailerCount, { color: colors.textSecondary }]}>
              {loadingPrices
                ? 'Checking...'
                : `${prices.length} ${prices.length === 1 ? 'offer' : 'offers'}`}
            </Text>
          </View>

          {loadingPrices ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ActivityIndicator size="small" color={isDark ? colors.accent : colors.primaryDark} />
              <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 8 }]}>
                Querying database for active retailer prices...
              </Text>
            </View>
          ) : prices.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No verified online prices available</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No merchant offers are currently recorded in the database for this product. You can still track this item in your shopping trip at your in-store price.
              </Text>
            </View>
          ) : (
            <View style={styles.retailerList}>
              {prices.map((item) => {
                const isCheapest = cheapestPrice?.retailer === item.retailer && cheapestPrice?.price === item.price;
                const isSelected = selectedRetailer?.retailer === item.retailer && selectedRetailer?.price === item.price;

                return (
                  <Pressable
                    key={item.retailer}
                    style={[
                      styles.retailerCard,
                      { backgroundColor: colors.card, borderColor: isSelected ? (isDark ? colors.accent : colors.primaryDark) : colors.cardBorder },
                      isSelected && { backgroundColor: isDark ? '#1C2C24' : '#F7FAF5' },
                    ]}
                    onPress={() => selectRetailer(item)}
                  >
                    <View style={styles.selectionIndicator}>
                      <View style={[styles.radioCircle, { borderColor: isSelected ? (isDark ? colors.accent : colors.primaryDark) : colors.inputBorder }]}>
                        {isSelected && <View style={[styles.radioDot, { backgroundColor: isDark ? colors.accent : colors.primaryDark }]} />}
                      </View>
                    </View>

                    <View style={styles.retailerMain}>
                      <View style={styles.retailerTitleRow}>
                        <Text style={[styles.retailerName, { color: colors.text }]}>{item.retailer}</Text>
                        {isCheapest && (
                          <View style={[styles.cheapestBadge, { backgroundColor: colors.badgeBg }]}>
                            <Text style={[styles.cheapestBadgeText, { color: colors.badgeText }]}>LOWEST VERIFIED OFFER</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.retailerDelivery, { color: colors.textSecondary }]}>
                        {item.deliveryTime} · {item.source || 'Database record'}
                      </Text>
                    </View>

                    <View style={styles.retailerPriceCol}>
                      <Text style={[styles.retailerPriceValue, { color: colors.text }]}>₹{item.price}</Text>
                      <Text style={[styles.retailerSelectHint, { color: colors.textMuted }]}>
                        {isSelected ? 'Selected' : 'Tap to select'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* DYNAMIC SAVINGS CARD */}
        {selectedRetailer && storePriceNumber > 0 && selectedRetailer.price > 0 && (
          <View style={[styles.savingsCard, { backgroundColor: savings > 0 ? (isDark ? '#16281F' : colors.primaryDark) : colors.cardMuted, borderColor: colors.cardBorder }]}>
            <View style={styles.savingsTop}>
              <View>
                <Text style={[styles.savingsKicker, { color: savings > 0 ? colors.heroKicker : colors.textMuted }]}>
                  {savings > 0 ? 'CALCULATED TRIP SAVINGS' : 'PRICE EVALUATION'}
                </Text>
                <Text style={[styles.savingsValue, { color: savings > 0 ? '#FFFFFF' : colors.text }]}>
                  {savings > 0 ? `₹${savings.toFixed(2)} savings` : 'In-store price is lower or matched'}
                </Text>
              </View>
              {savings > 0 && (
                <View style={[styles.savingsTag, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.savingsTagText, { color: colors.accentText }]}>
                    {((savings / storePriceNumber) * 100).toFixed(0)}% OFF
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.savingsDescription, { color: savings > 0 ? '#D7E5DC' : colors.textSecondary }]}>
              {savings > 0
                ? `Purchasing via ${selectedRetailer.retailer} at ₹${selectedRetailer.price} saves ₹${savings.toFixed(2)} compared to your physical store shelf price of ₹${storePriceNumber}.`
                : `Your store shelf price (₹${storePriceNumber}) matches or beats the lowest recorded online offer (₹${selectedRetailer.price} on ${selectedRetailer.retailer}).`}
            </Text>
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actionBlock}>
          {!addedToTrip ? (
            <Pressable
              style={[styles.primaryActionButton, { backgroundColor: colors.accent }]}
              onPress={addToShoppingTrip}
            >
              <Text style={[styles.primaryActionText, { color: colors.accentText }]}>Add to Shopping Trip</Text>
              <Text style={[styles.primaryActionArrow, { color: colors.accentText }]}>→</Text>
            </Pressable>
          ) : (
            <View style={[styles.addedConfirmationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.addedBanner, { backgroundColor: colors.badgeBg }]}>
                <View style={[styles.addedCheck, { backgroundColor: isDark ? colors.accent : colors.primaryDark }]}>
                  <Text style={[styles.addedCheckGlyph, { color: isDark ? colors.primaryDark : colors.accent }]}>✓</Text>
                </View>
                <View style={styles.addedCopy}>
                  <Text style={[styles.addedTitle, { color: colors.text }]}>Added to Shopping Trip</Text>
                  <Text style={[styles.addedSubtitle, { color: colors.textSecondary }]}>
                    {selectedRetailer ? `Selected ${selectedRetailer.retailer} at ₹${selectedRetailer.price}` : `In-store shelf price: ₹${storePriceNumber}`}
                  </Text>
                </View>
              </View>

              {selectedRetailer && (
                <Pressable
                  style={[styles.buyNowButton, { backgroundColor: isDark ? '#22352B' : colors.primaryDark }]}
                  onPress={buyFromRetailer}
                >
                  <Text style={[styles.buyNowText, { color: '#FFFFFF' }]}>
                    View on {selectedRetailer.retailer}
                  </Text>
                  <Text style={[styles.buyNowArrow, { color: colors.accent }]}>↗</Text>
                </Pressable>
              )}

              <View style={styles.dualNavRow}>
                <Pressable
                  style={[styles.secondaryNavButton, { backgroundColor: colors.chipBg }]}
                  onPress={() => router.replace('/trip')}
                >
                  <Text style={[styles.secondaryNavText, { color: colors.chipText }]}>View Trip</Text>
                  <Text style={[styles.secondaryNavArrow, { color: colors.chipText }]}>→</Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryNavButton, { backgroundColor: colors.chipBg }]}
                  onPress={() => router.push('/scan')}
                >
                  <Text style={[styles.secondaryNavText, { color: colors.chipText }]}>Scan Next</Text>
                  <Text style={[styles.secondaryNavArrow, { color: colors.chipText }]}>⌁</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* DISCLAIMER */}
        <View style={[styles.disclaimerCard, { backgroundColor: colors.cardMuted }]}>
          <Text style={[styles.disclaimerTitle, { color: colors.textSecondary }]}>Price Verification Notice</Text>
          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>{DEMO_PRICE_DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topbar: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 19, fontWeight: '700' },
  navTitles: { flex: 1, marginLeft: 14 },
  navEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  navTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, gap: 4 },
  tripBadgeText: { fontSize: 12, fontWeight: '800' },
  tripBadgeArrow: { fontSize: 13, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 48 },
  productCard: { borderRadius: 22, borderWidth: 1, padding: 20 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  categoryPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  barcodeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  productNameText: { fontSize: 20, fontWeight: '800', lineHeight: 26, letterSpacing: -0.4 },
  brandSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  productMetaTags: { flexDirection: 'row', gap: 10, marginTop: 18, paddingTop: 16, borderTopWidth: 1 },
  metaTag: { flex: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  metaTagLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  metaTagValue: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  storeInputCard: { borderRadius: 22, borderWidth: 1, padding: 20, marginTop: 16 },
  inputCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  inputCardTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  iconChip: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconChipGlyph: { fontSize: 16, fontWeight: '800' },
  inputCardDesc: { fontSize: 12, lineHeight: 17, marginTop: 6, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputPrefix: { width: 44, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inputPrefixText: { fontSize: 18, fontWeight: '800' },
  textInput: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, fontWeight: '700', outlineStyle: 'none' } as any,
  retailerSection: { marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  retailerCount: { fontSize: 11, fontWeight: '700' },
  retailerList: { gap: 10 },
  retailerCard: { borderRadius: 16, borderWidth: 1.5, padding: 15, flexDirection: 'row', alignItems: 'center' },
  selectionIndicator: { marginRight: 12 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  retailerMain: { flex: 1 },
  retailerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  retailerName: { fontSize: 15, fontWeight: '800' },
  cheapestBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  cheapestBadgeText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },
  retailerDelivery: { fontSize: 11, marginTop: 3 },
  retailerPriceCol: { alignItems: 'flex-end', marginLeft: 10 },
  retailerPriceValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  retailerSelectHint: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: 22, alignItems: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  emptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  savingsCard: { borderRadius: 18, padding: 18, marginTop: 18, borderWidth: 1 },
  savingsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  savingsKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 3 },
  savingsValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  savingsTag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  savingsTagText: { fontSize: 11, fontWeight: '900' },
  savingsDescription: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  actionBlock: { marginTop: 22 },
  primaryActionButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryActionText: { fontSize: 15, fontWeight: '800' },
  primaryActionArrow: { fontSize: 20, fontWeight: '700' },
  addedConfirmationCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  addedBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14 },
  addedCheck: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addedCheckGlyph: { fontSize: 15, fontWeight: '900' },
  addedCopy: { marginLeft: 12, flex: 1 },
  addedTitle: { fontSize: 13, fontWeight: '800' },
  addedSubtitle: { fontSize: 11, marginTop: 1 },
  buyNowButton: { minHeight: 50, borderRadius: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buyNowText: { fontSize: 14, fontWeight: '800' },
  buyNowArrow: { fontSize: 17, fontWeight: '800' },
  dualNavRow: { flexDirection: 'row', gap: 10 },
  secondaryNavButton: { flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondaryNavText: { fontSize: 12, fontWeight: '800' },
  secondaryNavArrow: { fontSize: 14, fontWeight: '700' },
  disclaimerCard: { marginTop: 26, padding: 14, borderRadius: 14 },
  disclaimerTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  disclaimerText: { fontSize: 11, lineHeight: 16, marginTop: 4 },
});
