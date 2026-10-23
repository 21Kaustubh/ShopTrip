import { router } from 'expo-router';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppTheme } from '../context/ThemeContext';
import { useTrip, type TripProduct } from '../context/TripContext';

export default function TripScreen() {
  const { colors, isDark } = useAppTheme();
  const { isGuest } = useAuth();
  const {
    products,
    productCount,
    totalItems,
    totalSavings,
    totalStorePrice,
    totalOnlinePrice,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearTrip,
    markRetailerOpened,
  } = useTrip();

  const scanAnotherProduct = () => {
    router.push('/scan');
  };

  const searchProduct = () => {
    router.push('/search');
  };

  const finishShoppingTrip = () => {
    Alert.alert(
      'Finish Shopping Trip',
      'Are you sure you want to complete this trip? This will record your trip and reset the active list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish Trip',
          style: 'destructive',
          onPress: () => {
            clearTrip();
            router.replace('/home' as any);
          },
        },
      ]
    );
  };

  const openRetailerLink = async (product: TripProduct) => {
    const retailer = product.selectedRetailer || product.cheapestRetailer;
    const query = encodeURIComponent(product.productName.trim());
    const retailerUrls: Record<string, string> = {
      Blinkit: `https://blinkit.com/s/?q=${query}`,
      Zepto: `https://www.zeptonow.com/search?query=${query}`,
      Instamart: `https://www.swiggy.com/instamart/search?query=${query}`,
      Amazon: `https://www.amazon.in/s?k=${query}`,
      'Amazon India': `https://www.amazon.in/s?k=${query}`,
      'Amazon Now': `https://www.amazon.in/s?k=${query}&i=nowstore`,
      BigBasket: `https://www.bigbasket.com/ps/?q=${query}`,
      Flipkart: `https://www.flipkart.com/search?q=${query}`,
      'Flipkart Minutes': `https://www.flipkart.com/search?q=${query}&marketplace=FLIPKART`,
      'DMart Ready': `https://www.dmartready.com/manage/search/result?query=${query}`,
      JioMart: `https://www.jiomart.com/search/${query}`,
      Myntra: `https://www.myntra.com/${query}`,
      AJIO: `https://www.ajio.com/search/?text=${query}`,
      Nykaa: `https://www.nykaa.com/search/result/?q=${query}`,
      GrocersLocal: `https://www.google.com/search?q=${encodeURIComponent(`${product.productName} GrocersLocal`)}`,
    };

    const targetUrl =
      retailerUrls[retailer] ??
      `https://www.google.com/search?q=${encodeURIComponent(`${product.productName} ${retailer}`)}`;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
          markRetailerOpened(product.barcode);
          return;
        }
      }
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
        markRetailerOpened(product.barcode);
      } else {
        Alert.alert('Unable to Open Link', `Could not open ${retailer}.`);
      }
    } catch {
      Alert.alert('Unable to Open Link', `Could not open ${retailer}.`);
    }
  };

  const viewProductDetails = (product: TripProduct) => {
    router.push({
      pathname: '/product',
      params: {
        barcode: product.barcode,
        productName: product.productName,
        brand: product.brand,
        category: product.category,
        weight: product.weight,
        unit: product.unit,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* TOP NAVIGATION */}
      <ScreenHeader
        title="Shopping Trip"
        eyebrow={isGuest ? 'GUEST TRIP' : 'ACCOUNT TRIP'}
        fallbackRoute="/home"
        backLabel="Back to Home"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TRIP SUMMARY HERO CARD */}
        <View style={[styles.heroSummaryCard, { backgroundColor: colors.heroBg }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroKicker, { color: colors.heroKicker }]}>PROJECTED TRIP SAVINGS</Text>
              <Text style={styles.heroSavingsValue}>
                ₹{totalSavings.toFixed(0)}
              </Text>
            </View>
            <View style={[styles.itemCountBadge, { backgroundColor: isDark ? '#22352B' : '#2A5A4A' }]}>
              <Text style={[styles.itemCountNumber, { color: colors.accent }]}>{totalItems}</Text>
              <Text style={styles.itemCountLabel}>{totalItems === 1 ? 'ITEM' : 'ITEMS'}</Text>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: isDark ? '#243A2F' : '#2F6150' }]} />

          {/* FINANCIAL BREAKDOWN */}
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownCell}>
              <Text style={styles.breakdownLabel}>Shelf Store Total</Text>
              <Text style={styles.breakdownValue}>₹{totalStorePrice.toFixed(0)}</Text>
            </View>
            <View style={[styles.breakdownSeparator, { backgroundColor: isDark ? '#243A2F' : '#2F6150' }]} />
            <View style={styles.breakdownCell}>
              <Text style={styles.breakdownLabel}>Online Optimized</Text>
              <Text style={[styles.breakdownValue, { color: colors.accent }]}>
                {totalOnlinePrice > 0 ? `₹${totalOnlinePrice.toFixed(0)}` : 'None'}
              </Text>
            </View>
            <View style={[styles.breakdownSeparator, { backgroundColor: isDark ? '#243A2F' : '#2F6150' }]} />
            <View style={styles.breakdownCell}>
              <Text style={styles.breakdownLabel}>Products</Text>
              <Text style={styles.breakdownValue}>{productCount}</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTION ROW */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={scanAnotherProduct}
          >
            <View style={[styles.actionIcon, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
              <Text style={[styles.actionIconGlyph, { color: colors.accent }]}>⌁</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionButtonTitle, { color: colors.text }]}>Scan Barcode</Text>
              <Text style={[styles.actionButtonSubtitle, { color: colors.textSecondary }]}>Point at package</Text>
            </View>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={searchProduct}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.chipBg }]}>
              <Text style={[styles.actionIconGlyphSoft, { color: colors.chipText }]}>⌕</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionButtonTitle, { color: colors.text }]}>Search Item</Text>
              <Text style={[styles.actionButtonSubtitle, { color: colors.textSecondary }]}>Find in catalogue</Text>
            </View>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>→</Text>
          </Pressable>
        </View>

        {/* SECTION HEADING */}
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items on this trip</Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </Text>
        </View>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.badgeBg }]}>
              <Text style={[styles.emptyIconGlyph, { color: colors.badgeText }]}>⌕</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your trip is waiting</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Scan barcodes in the aisle or search the database to start tracking your purchases and savings.
            </Text>
            <View style={styles.emptyButtonStack}>
              <Pressable
                style={[styles.emptyPrimaryButton, { backgroundColor: isDark ? colors.accent : colors.primaryDark }]}
                onPress={scanAnotherProduct}
              >
                <Text style={[styles.emptyPrimaryButtonText, { color: isDark ? colors.accentText : '#FFFFFF' }]}>
                  Scan First Item
                </Text>
                <Text style={[styles.emptyPrimaryButtonArrow, { color: isDark ? colors.accentText : colors.accent }]}>
                  →
                </Text>
              </Pressable>
              <Pressable
                style={[styles.emptySecondaryButton, { backgroundColor: colors.chipBg }]}
                onPress={searchProduct}
              >
                <Text style={[styles.emptySecondaryButtonText, { color: colors.chipText }]}>
                  Search Product Catalogue
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* PRODUCT LIST */
          <View style={styles.productList}>
            {products.map((product, index) => {
              const quantity = product.quantity ?? 1;
              const productStoreTotal = (product.storePrice || 0) * quantity;
              const hasOnlineOffer = typeof product.onlinePrice === 'number' && product.onlinePrice > 0;
              const productOnlineTotal = hasOnlineOffer ? product.onlinePrice * quantity : 0;
              const isComparable = product.isComparableOffer !== false;

              // Price difference calculations
              const isShelfCheaper = hasOnlineOffer && product.onlinePrice > product.storePrice;
              const priceHigherDiff = isShelfCheaper ? (product.onlinePrice - product.storePrice) * quantity : 0;
              const productSavingsTotal =
                isComparable && !isShelfCheaper && hasOnlineOffer && product.storePrice > product.onlinePrice
                  ? (product.storePrice - product.onlinePrice) * quantity
                  : 0;
              const isPriceMatch = hasOnlineOffer && product.storePrice === product.onlinePrice;

              const retailerToUse = product.selectedRetailer || product.cheapestRetailer;

              return (
                <View
                  key={product.id}
                  style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  {/* CARD TOP INFO */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.productIndexBadge, { backgroundColor: colors.badgeBg }]}>
                      <Text style={[styles.productIndexText, { color: colors.badgeText }]}>
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </Text>
                    </View>
                    <View style={styles.productNameBlock}>
                      <Pressable onPress={() => viewProductDetails(product)}>
                        <Text style={[styles.productNameText, { color: colors.text }]}>{product.productName}</Text>
                      </Pressable>
                      <Text style={[styles.productBrandText, { color: colors.textSecondary }]}>
                        {product.brand} · {product.category}
                        {product.weight ? ` · ${product.weight} ${product.unit}` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* RETAILER ROUTING PILL */}
                  {hasOnlineOffer && (
                    <View style={[styles.retailerRouteRow, { backgroundColor: colors.cardMuted }]}>
                      <View style={styles.retailerPill}>
                        <Text style={[styles.retailerPillLabel, { color: colors.textMuted }]}>SELECTED RETAILER</Text>
                        <Text style={[styles.retailerPillName, { color: colors.text }]}>{retailerToUse}</Text>
                        <Text style={[styles.retailerPillPrice, { color: isDark ? colors.accent : colors.primaryDark }]}>
                          ₹{product.onlinePrice.toFixed(0)}
                        </Text>
                      </View>

                      <Pressable
                        style={[styles.openRetailerButton, { backgroundColor: colors.chipBg }]}
                        onPress={() => openRetailerLink(product)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${retailerToUse}`}
                      >
                        <Text style={[styles.openRetailerText, { color: colors.chipText }]}>Open retailer</Text>
                        <Text style={[styles.openRetailerArrow, { color: colors.chipText }]}>↗</Text>
                      </Pressable>
                    </View>
                  )}

                  {/* PRICE COMPARISON SPLIT */}
                  <View style={[styles.priceCompareGrid, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}>
                    <View style={styles.priceCell}>
                      <Text style={[styles.priceCellLabel, { color: colors.textMuted }]}>IN-STORE SHELF</Text>
                      <Text style={[styles.storePriceValue, { color: hasOnlineOffer ? colors.textSecondary : colors.text }]}>
                        ₹{productStoreTotal.toFixed(0)}
                      </Text>
                      <Text style={[styles.unitPriceDetail, { color: colors.textMuted }]}>
                        ₹{product.storePrice.toFixed(0)} × {quantity}
                      </Text>
                    </View>

                    <View style={styles.compareArrowBox}>
                      <Text style={[styles.compareArrow, { color: colors.textMuted }]}>→</Text>
                    </View>

                    <View style={styles.priceCell}>
                      <Text style={[styles.priceCellLabel, { color: colors.textMuted }]}>
                        {hasOnlineOffer ? retailerToUse.toUpperCase() : 'ONLINE OFFER'}
                      </Text>
                      <Text style={[styles.onlinePriceValue, { color: colors.text }]}>
                        {hasOnlineOffer ? `₹${productOnlineTotal.toFixed(0)}` : 'Price unavailable'}
                      </Text>
                      <Text style={[styles.unitPriceDetail, { color: colors.textMuted }]}>
                        {hasOnlineOffer ? `₹${product.onlinePrice.toFixed(0)} × ${quantity}` : 'No offer selected'}
                      </Text>
                    </View>

                    {/* COMPARISON / SAVINGS BADGE */}
                    {!isComparable ? (
                      <View style={[styles.variantWarningCell, { backgroundColor: isDark ? '#3E2F1C' : '#FFF3E0' }]}>
                        <Text style={[styles.savingsCellLabel, { color: isDark ? '#FBBF24' : '#E65100' }]}>VARIANT</Text>
                        <Text style={[styles.variantCellNote, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                          Not comparable
                        </Text>
                      </View>
                    ) : productSavingsTotal > 0 ? (
                      <View style={[styles.savingsCell, { backgroundColor: colors.badgeBg }]}>
                        <Text style={[styles.savingsCellLabel, { color: colors.badgeText }]}>SAVINGS</Text>
                        <Text style={[styles.savingsCellValue, { color: colors.badgeText }]}>
                          ₹{productSavingsTotal.toFixed(0)}
                        </Text>
                      </View>
                    ) : isShelfCheaper ? (
                      <View style={[styles.higherPriceCell, { backgroundColor: isDark ? '#3D2525' : '#FDE8E8' }]}>
                        <Text style={[styles.savingsCellLabel, { color: isDark ? '#FCA5A5' : '#9B1C1C' }]}>ONLINE HIGHER</Text>
                        <Text style={[styles.higherCellValue, { color: isDark ? '#FCA5A5' : '#9B1C1C' }]}>
                          +₹{priceHigherDiff.toFixed(0)}
                        </Text>
                      </View>
                    ) : isPriceMatch ? (
                      <View style={[styles.savingsCell, { backgroundColor: colors.chipBg }]}>
                        <Text style={[styles.savingsCellLabel, { color: colors.chipText }]}>MATCH</Text>
                        <Text style={[styles.savingsCellValue, { color: colors.chipText }]}>₹0</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* DETAIL EXPLANATION NOTE */}
                  <View style={styles.evaluationRow}>
                    {!isComparable ? (
                      <Text style={[styles.evaluationNote, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                        Selected offer is a different pack variant. Projected savings against in-store shelf price cannot be calculated.
                      </Text>
                    ) : productSavingsTotal > 0 ? (
                      <Text style={[styles.evaluationNote, { color: isDark ? colors.accent : colors.primaryDark }]}>
                        Projected savings: ₹{productSavingsTotal.toFixed(0)} by purchasing from {retailerToUse} instead of in-store shelf tag.
                      </Text>
                    ) : isShelfCheaper ? (
                      <Text style={[styles.evaluationNote, { color: isDark ? '#FCA5A5' : '#9B1C1C' }]}>
                        ₹{priceHigherDiff.toFixed(0)} higher than shelf price — in-store purchase is cheaper.
                      </Text>
                    ) : isPriceMatch ? (
                      <Text style={[styles.evaluationNote, { color: colors.textSecondary }]}>
                        In-store shelf price matches online offer price.
                      </Text>
                    ) : null}
                  </View>

                  {/* QUANTITY CONTROLS & REMOVE */}
                  <View style={[styles.cardBottomRow, { borderTopColor: colors.border }]}>
                    <View style={[styles.quantityStepper, { backgroundColor: colors.chipBg }]}>
                      <Pressable
                        style={[styles.stepperButton, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}
                        onPress={() => decreaseQuantity(product.barcode)}
                      >
                        <Text style={[styles.stepperButtonText, { color: colors.text }]}>−</Text>
                      </Pressable>
                      <View style={styles.stepperValueBox}>
                        <Text style={[styles.stepperValueText, { color: colors.text }]}>{quantity}</Text>
                      </View>
                      <Pressable
                        style={[styles.stepperButton, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}
                        onPress={() => increaseQuantity(product.barcode)}
                      >
                        <Text style={[styles.stepperButtonText, { color: colors.text }]}>+</Text>
                      </Pressable>
                    </View>

                    <Pressable
                      style={styles.removeLink}
                      onPress={() => removeProduct(product.id)}
                    >
                      <Text style={[styles.removeLinkText, { color: colors.dangerText }]}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TRIP COMPLETION SECTION */}
        {productCount > 0 && (
          <View style={[styles.completionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View>
              <Text style={[styles.completionTitle, { color: colors.text }]}>Finish this trip</Text>
              <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
                {isGuest
                  ? 'Completes trip and clears current list. Create an account to sync trips across devices.'
                  : 'Saves trip summary to your account and resets the active shopping list.'}
              </Text>
            </View>
            <Pressable
              style={[styles.finishTripButton, { backgroundColor: isDark ? colors.accent : colors.primaryDark }]}
              onPress={finishShoppingTrip}
            >
              <Text style={[styles.finishTripButtonText, { color: isDark ? colors.accentText : '#FFFFFF' }]}>
                Complete & Clear Trip
              </Text>
              <Text style={[styles.finishTripButtonArrow, { color: isDark ? colors.accentText : colors.accent }]}>
                ✓
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.footerNote, { color: colors.textMuted }]}>
          {isGuest
            ? 'Guest mode · Shopping trip is stored locally on this device.'
            : 'Authenticated mode · Trip synchronized with ShopTrip account.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 50 },
  heroSummaryCard: {
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroSavingsValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', letterSpacing: -1.2, marginTop: 4 },
  itemCountBadge: { width: 58, height: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  itemCountNumber: { fontSize: 19, fontWeight: '800' },
  itemCountLabel: { color: '#D7E5DC', fontSize: 8, fontWeight: '800', letterSpacing: 0.6, marginTop: 1 },
  heroDivider: { height: 1, marginVertical: 18 },
  breakdownGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breakdownCell: { flex: 1 },
  breakdownSeparator: { width: 1, height: 28, marginHorizontal: 12 },
  breakdownLabel: { color: '#B5C9BC', fontSize: 10, fontWeight: '600' },
  breakdownValue: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionButton: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  actionIconGlyph: { fontSize: 20, fontWeight: '700', marginTop: -2 },
  actionIconGlyphSoft: { fontSize: 20, fontWeight: '700', marginTop: -2 },
  actionTextContainer: { flex: 1, marginLeft: 10 },
  actionButtonTitle: { fontSize: 12, fontWeight: '800' },
  actionButtonSubtitle: { fontSize: 10, marginTop: 1 },
  actionArrow: { fontSize: 15, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionCount: { fontSize: 11, fontWeight: '700' },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 26, alignItems: 'center', marginTop: 4 },
  emptyIconCircle: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyIconGlyph: { fontSize: 28, fontWeight: '700', marginTop: -3 },
  emptyTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  emptyDescription: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6, maxWidth: 280 },
  emptyButtonStack: { width: '100%', marginTop: 22, gap: 10 },
  emptyPrimaryButton: { height: 48, borderRadius: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emptyPrimaryButtonText: { fontSize: 13, fontWeight: '800' },
  emptyPrimaryButtonArrow: { fontSize: 18, fontWeight: '700' },
  emptySecondaryButton: { height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  emptySecondaryButtonText: { fontSize: 12, fontWeight: '800' },
  productList: { gap: 12 },
  productCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  productIndexBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  productIndexText: { fontSize: 11, fontWeight: '900' },
  productNameBlock: { flex: 1 },
  productNameText: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  productBrandText: { fontSize: 11, marginTop: 2 },
  retailerRouteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 8, paddingHorizontal: 12, marginTop: 12 },
  retailerPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  retailerPillLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  retailerPillName: { fontSize: 12, fontWeight: '800' },
  retailerPillPrice: { fontSize: 12, fontWeight: '800' },
  openRetailerButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  openRetailerText: { fontSize: 10, fontWeight: '800' },
  openRetailerArrow: { fontSize: 11, fontWeight: '800' },
  priceCompareGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, padding: 12, marginTop: 12 },
  priceCell: { flex: 1 },
  priceCellLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  storePriceValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  onlinePriceValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  unitPriceDetail: { fontSize: 9, marginTop: 1 },
  compareArrowBox: { paddingHorizontal: 6 },
  compareArrow: { fontSize: 14, fontWeight: '700' },
  savingsCell: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', marginLeft: 6 },
  savingsCellLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  savingsCellValue: { fontSize: 13, fontWeight: '800', marginTop: 1 },
  variantWarningCell: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center', marginLeft: 6 },
  variantCellNote: { fontSize: 10, fontWeight: '800', marginTop: 1 },
  higherPriceCell: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center', marginLeft: 6 },
  higherCellValue: { fontSize: 12, fontWeight: '800', marginTop: 1 },
  evaluationRow: { marginTop: 10, paddingHorizontal: 2 },
  evaluationNote: { fontSize: 11, fontWeight: '600', lineHeight: 16 },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  quantityStepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 2 },
  stepperButton: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  stepperButtonText: { fontSize: 15, fontWeight: '800' },
  stepperValueBox: { paddingHorizontal: 14 },
  stepperValueText: { fontSize: 13, fontWeight: '800' },
  removeLink: { paddingVertical: 6, paddingHorizontal: 10 },
  removeLinkText: { fontSize: 11, fontWeight: '700' },
  completionCard: { borderRadius: 20, borderWidth: 1, padding: 18, marginTop: 22, gap: 12 },
  completionTitle: { fontSize: 16, fontWeight: '800' },
  completionSubtitle: { fontSize: 11, marginTop: 2 },
  finishTripButton: { height: 48, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  finishTripButtonText: { fontSize: 13, fontWeight: '800' },
  finishTripButtonArrow: { fontSize: 15, fontWeight: '800' },
  footerNote: { fontSize: 10, textAlign: 'center', lineHeight: 14, marginTop: 24, paddingHorizontal: 20 },
});
