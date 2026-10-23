import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { ThemeToggle, useAppTheme } from '../context/ThemeContext';
import { useTrip } from '../context/TripContext';
import {
  fetchProductComparison,
  openRetailerOutboundUrl,
  type RetailerAction,
  type RetailerComparisonData,
  type VerifiedOffer,
} from '../services/retailerService';

export default function ProductScreen() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const params = useLocalSearchParams<{
    barcode?: string;
    barcodeType?: string;
    productName?: string;
    brand?: string;
    category?: string;
    weight?: string;
    unit?: string;
    sizeInfo?: string;
    imageUrl?: string;
    verificationStatus?: string;
    attribution?: string;
    marketAvailability?: string;
    marketBadge?: string;
    marketReason?: string;
  }>();

  const { addProduct, markRetailerOpened } = useTrip();

  const barcode = String(params.barcode ?? '').trim();
  const productName = String(params.productName ?? 'Product Details');
  const brand = String(params.brand ?? '');
  const category = String(params.category ?? '');
  const weight = String(params.weight ?? '');
  const unit = String(params.unit ?? '');
  const sizeInfo = String(params.sizeInfo ?? (weight ? `${weight} ${unit}`.trim() : ''));
  const imageUrl = String(params.imageUrl ?? '');
  const verificationStatus = String(params.verificationStatus ?? '');
  const attribution = String(params.attribution ?? '');
  const marketBadge = String(params.marketBadge ?? '');
  const marketReason = String(params.marketReason ?? '');
  const marketAvailability = String(params.marketAvailability ?? '');

  const [storePrice, setStorePrice] = useState('');
  const [comparison, setComparison] = useState<RetailerComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(true);
  const [selectedVerifiedOffer, setSelectedVerifiedOffer] = useState<VerifiedOffer | null>(null);
  const [addedToTrip, setAddedToTrip] = useState(false);

  // Load transparent multi-retailer comparison & verified database offers
  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoadingComparison(true);
      try {
        const data = await fetchProductComparison({
          barcode,
          productName,
          brand,
          sizeInfo,
          category,
        });

        if (active) {
          setComparison(data);
          if (data.verifiedOffers.length > 0) {
            // Pre-select lowest comparable verified offer ONLY
            const comparableOffers = data.verifiedOffers.filter(
              (o) => o.isComparableVariant !== false
            );
            if (comparableOffers.length > 0) {
              const lowest = comparableOffers.reduce((min, cur) =>
                cur.price < min.price ? cur : min
              );
              setSelectedVerifiedOffer(lowest);
            } else {
              setSelectedVerifiedOffer(null);
            }
          }
        }
      } catch {
        if (active) {
          setComparison(null);
        }
      } finally {
        if (active) {
          setLoadingComparison(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [barcode, productName, brand, sizeInfo, category]);

  const storePriceNumber = Number(storePrice);
  const isComparable = selectedVerifiedOffer?.isComparableVariant !== false;

  // Transparent savings: ONLY computed when a genuine comparable verified online offer exists and store price is positive
  const savings =
    selectedVerifiedOffer &&
    isComparable &&
    selectedVerifiedOffer.price > 0 &&
    !Number.isNaN(storePriceNumber) &&
    storePriceNumber > selectedVerifiedOffer.price
      ? storePriceNumber - selectedVerifiedOffer.price
      : 0;

  const handleOpenRetailerAction = async (action: RetailerAction) => {
    const opened = await openRetailerOutboundUrl(action.searchUrl, action.displayName);
    if (opened && barcode) {
      markRetailerOpened(barcode);
    }
  };

  const handleOpenVerifiedOffer = async (offer: VerifiedOffer) => {
    const url = offer.productUrl || `https://www.google.com/search?q=${encodeURIComponent(`${productName} ${offer.retailerName}`)}`;
    const opened = await openRetailerOutboundUrl(url, offer.retailerName);
    if (opened && barcode) {
      markRetailerOpened(barcode);
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

    const onlinePrice = selectedVerifiedOffer ? selectedVerifiedOffer.price : 0;
    const cheapestRetailer = selectedVerifiedOffer
      ? selectedVerifiedOffer.retailerName
      : 'In-Store Shelf';

    addProduct({
      id: `${barcode || Date.now()}-${Date.now()}`,
      barcode: barcode || 'NO_BARCODE',
      productName,
      brand,
      category: category || 'Grocery',
      weight,
      unit,
      storePrice: storePriceNumber,
      onlinePrice,
      cheapestRetailer,
      savings,
      isComparableOffer: isComparable,
      selectedOfferId: selectedVerifiedOffer?.id ?? null,
      quantity: 1,
      selectedRetailer: selectedVerifiedOffer ? selectedVerifiedOffer.retailerName : null,
      purchasedQuantity: 0,
      purchaseStatus: selectedVerifiedOffer ? 'RETAILER_SELECTED' : 'PLANNED',
      retailerBuyClicked: false,
      retailerOpenedAt: null,
    });

    setAddedToTrip(true);
  };

  // Determine market status pill display
  const isIndiaConfirmed = marketAvailability === 'india_confirmed';
  const isIndiaLikely = marketAvailability === 'india_likely';
  const displayMarketBadge =
    marketBadge ||
    (isIndiaConfirmed
      ? 'India Tagged'
      : isIndiaLikely
      ? 'Indian Brand'
      : 'Marketplace Product');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Product & Retailer Comparison"
        eyebrow="ShopTrip"
        fallbackRoute="/home"
        backLabel="Back"
        rightElement={
          <View style={styles.topbarRight}>
            <ThemeToggle />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View shopping trip"
              style={[styles.tripBadge, { backgroundColor: colors.badgeBg }]}
              onPress={() => router.push('/trip')}
            >
              <Text style={[styles.tripBadgeText, { color: colors.badgeText }]}>Trip</Text>
              <Text style={[styles.tripBadgeArrow, { color: colors.badgeText }]}>→</Text>
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.desktopContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={isDesktop ? styles.desktopColumnsRow : styles.mobileStack}>
          {/* ════════════════ LEFT COLUMN: PRODUCT OVERVIEW & SHELF PRICE ════════════════ */}
          <View style={isDesktop ? styles.desktopLeftCol : styles.fullWidthCol}>
            {/* PRODUCT CARD */}
            <View
              style={[
                styles.productCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.categoryPill, { backgroundColor: colors.badgeBg }]}>
                  <Text style={[styles.categoryPillText, { color: colors.badgeText }]}>
                    {category || 'Grocery'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.marketPill,
                    {
                      backgroundColor: isIndiaConfirmed
                        ? isDark
                          ? '#1C2C24'
                          : '#EAF3EC'
                        : colors.chipBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.marketPillText,
                      {
                        color: isIndiaConfirmed
                          ? isDark
                            ? colors.accent
                            : colors.primaryDark
                          : colors.chipText,
                      },
                    ]}
                  >
                    🇮🇳 {displayMarketBadge}
                  </Text>
                </View>
              </View>

              <View style={styles.productMainRow}>
                {imageUrl.length > 0 ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={[styles.productThumb, { borderColor: colors.border }]}
                    resizeMode="contain"
                    accessibilityLabel={productName}
                  />
                ) : (
                  <View
                    style={[
                      styles.productThumbFallback,
                      { backgroundColor: colors.chipBg, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.fallbackGlyph, { color: colors.chipText }]}>
                      {productName.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.productTitlesCol}>
                  <Text style={[styles.productNameText, { color: colors.text }]}>
                    {productName}
                  </Text>
                  <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                    {brand ? `${brand} · ` : ''}
                    {sizeInfo || 'Standard package'}
                  </Text>
                </View>
              </View>

              {marketReason ? (
                <View style={[styles.reasonBox, { backgroundColor: colors.cardMuted }]}>
                  <Text style={[styles.reasonText, { color: colors.textMuted }]}>
                    Origin: {marketReason}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.productMetaTags, { borderTopColor: colors.border }]}>
                <View style={[styles.metaTag, { backgroundColor: colors.cardMuted }]}>
                  <Text style={[styles.metaTagLabel, { color: colors.textMuted }]}>Brand</Text>
                  <Text style={[styles.metaTagValue, { color: colors.text }]} numberOfLines={1}>
                    {brand || 'Unbranded'}
                  </Text>
                </View>
                <View style={[styles.metaTag, { backgroundColor: colors.cardMuted }]}>
                  <Text style={[styles.metaTagLabel, { color: colors.textMuted }]}>Package</Text>
                  <Text style={[styles.metaTagValue, { color: colors.text }]} numberOfLines={1}>
                    {sizeInfo || '1 unit'}
                  </Text>
                </View>
                <View style={[styles.metaTag, { backgroundColor: colors.cardMuted }]}>
                  <Text style={[styles.metaTagLabel, { color: colors.textMuted }]}>Barcode</Text>
                  <Text style={[styles.metaTagValue, { color: colors.text }]} numberOfLines={1}>
                    {barcode || 'Unspecified'}
                  </Text>
                </View>
              </View>
            </View>

            {/* STEP 1: PHYSICAL STORE SHELF PRICE INPUT */}
            <View
              style={[
                styles.storeInputCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.inputCardHeader}>
                <View>
                  <Text style={[styles.kicker, { color: colors.textMuted }]}>STEP 1</Text>
                  <Text style={[styles.inputCardTitle, { color: colors.text }]}>
                    Physical shelf price
                  </Text>
                </View>
                <View style={[styles.iconChip, { backgroundColor: colors.chipBg }]}>
                  <Text style={[styles.iconChipGlyph, { color: colors.chipText }]}>₹</Text>
                </View>
              </View>
              <Text style={[styles.inputCardDesc, { color: colors.textSecondary }]}>
                Enter the in-store price on the shelf tag to calculate direct savings against online merchants.
              </Text>

              <View style={styles.inputRow}>
                <View
                  style={[
                    styles.inputPrefix,
                    { backgroundColor: colors.chipBg, borderColor: colors.inputBorder },
                  ]}
                >
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
                  placeholder="e.g. 195"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* OPEN FOOD FACTS METADATA ATTRIBUTION */}
            {(verificationStatus === 'OFF_SOURCED' || attribution.length > 0) && (
              <View
                style={[
                  styles.attributionCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.attributionHeader}>
                  <View style={[styles.attrDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.attributionTitle, { color: colors.text }]}>
                    Open Food Facts Source
                  </Text>
                </View>
                <Text style={[styles.attributionText, { color: colors.textSecondary }]}>
                  {attribution ||
                    'Product metadata and package details sourced from Open Food Facts (openfoodfacts.org) under the Open Database License (ODbL). Catalogue import does not enable live retailer prices or imply verified merchant stock.'}
                </Text>
              </View>
            )}
          </View>

          {/* ════════════════ RIGHT COLUMN: RETAILER COMPARISON & ACTIONS ════════════════ */}
          <View style={isDesktop ? styles.desktopRightCol : styles.fullWidthCol}>
            {/* STEP 2: VERIFIED OFFERS & OUTBOUND RETAILER ACTIONS */}
            <View
              style={[
                styles.comparisonContainer,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={[styles.kicker, { color: colors.textMuted }]}>STEP 2</Text>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Retailer Search & Offers
                  </Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: colors.badgeBg }]}>
                  <Text style={[styles.badgePillText, { color: colors.badgeText }]}>
                    {comparison?.retailerActions?.length
                      ? `${comparison.retailerActions.length} Retailers Available`
                      : 'Retailers Available'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.retailerSectionNotice, { color: colors.textSecondary }]}>
                Select an Indian delivery service or marketplace below to view availability or search live stock for this product.
              </Text>

              {loadingComparison ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={isDark ? colors.accent : colors.primaryDark} />
                  <Text style={[styles.loadingBoxText, { color: colors.textSecondary }]}>
                    Loading retailer destinations...
                  </Text>
                </View>
              ) : (
                <View style={styles.actionsList}>
                  {/* If genuine verified database offers exist, render them at the top */}
                  {comparison?.verifiedOffers && comparison.verifiedOffers.length > 0 && (
                    <View style={styles.verifiedOffersBlock}>
                      <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                        Verified Stored Offers ({comparison.verifiedOffers.length})
                      </Text>
                      {comparison.verifiedOffers.map((offer) => {
                        const isOfferComparable = offer.isComparableVariant !== false;
                        const isSelected = isOfferComparable && selectedVerifiedOffer?.id === offer.id;

                        return (
                          <View
                            key={offer.id || `${offer.retailerName}-${offer.price}`}
                            style={[
                              styles.verifiedOfferCard,
                              {
                                backgroundColor: isSelected
                                  ? isDark
                                    ? '#1C2C24'
                                    : '#F3F8F4'
                                  : colors.cardMuted,
                                borderColor: isSelected
                                  ? isDark
                                    ? colors.accent
                                    : colors.primaryDark
                                  : isOfferComparable
                                    ? colors.cardBorder
                                    : isDark
                                      ? '#2E271D'
                                      : '#F4ECE1',
                              },
                            ]}
                          >
                            {/* SELECTION CONTROL: Sibling 1 (Only for comparable offers) */}
                            {isOfferComparable ? (
                              <Pressable
                                style={styles.offerSelectRow}
                                onPress={() => {
                                  setSelectedVerifiedOffer(offer);
                                  setAddedToTrip(false);
                                }}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: isSelected }}
                                accessibilityLabel={`Select ${offer.retailerName} offer at ₹${offer.price} for savings calculation`}
                              >
                                <View
                                  style={[
                                    styles.radioCircle,
                                    {
                                      borderColor: isSelected
                                        ? isDark
                                          ? colors.accent
                                          : colors.primaryDark
                                        : colors.border,
                                      backgroundColor: isSelected
                                        ? isDark
                                          ? colors.accent
                                          : colors.primaryDark
                                        : 'transparent',
                                    },
                                  ]}
                                >
                                  {isSelected ? (
                                    <Text
                                      style={[
                                        styles.radioGlyph,
                                        { color: isDark ? '#142119' : '#FFFFFF' },
                                      ]}
                                    >
                                      ✓
                                    </Text>
                                  ) : null}
                                </View>
                                <View style={styles.offerMainInfo}>
                                  <View style={styles.offerHeaderLine}>
                                    <Text style={[styles.offerRetailerName, { color: colors.text }]}>
                                      {offer.retailerName}
                                    </Text>
                                    <View
                                      style={[
                                        styles.matchBadge,
                                        { backgroundColor: isDark ? '#1F3325' : '#E8F5E9' },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.matchBadgeText,
                                          { color: isDark ? '#A3E635' : '#1B5E20' },
                                        ]}
                                      >
                                        Exact match ({offer.packSize || sizeInfo || '200 ml'})
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={[styles.offerDeliveryText, { color: colors.textSecondary }]}>
                                    {offer.deliveryTime || 'Standard'} · {offer.source}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.selectableHint,
                                      { color: isDark ? colors.accent : colors.primaryDark },
                                    ]}
                                  >
                                    {isSelected
                                      ? '● Selected for trip savings'
                                      : '○ Tap to select for trip savings'}
                                  </Text>
                                </View>
                              </Pressable>
                            ) : (
                              /* NON-COMPARABLE: Non-interactive View container with warning badge (CANNOT be selected) */
                              <View style={styles.offerSelectRow}>
                                <View
                                  style={[
                                    styles.radioCircleDisabled,
                                    { borderColor: colors.border },
                                  ]}
                                >
                                  <Text style={[styles.disabledGlyph, { color: colors.textMuted }]}>
                                    −
                                  </Text>
                                </View>
                                <View style={styles.offerMainInfo}>
                                  <View style={styles.offerHeaderLine}>
                                    <Text
                                      style={[
                                        styles.offerRetailerName,
                                        { color: colors.textSecondary },
                                      ]}
                                    >
                                      {offer.retailerName}
                                    </Text>
                                    <View
                                      style={[
                                        styles.variantBadge,
                                        { backgroundColor: isDark ? '#3D2D1B' : '#FFF3E0' },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.variantBadgeText,
                                          { color: isDark ? '#FBBF24' : '#E65100' },
                                        ]}
                                      >
                                        Different variant — not comparable
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={[styles.offerDeliveryText, { color: colors.textMuted }]}>
                                    {offer.deliveryTime || 'Standard'} · {offer.source}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.variantWarningText,
                                      { color: isDark ? '#FBBF24' : '#B45309' },
                                    ]}
                                  >
                                    {offer.variantNote ||
                                      `Different size (${offer.packSize || 'pack variant'}) — not selectable for 200 ml shelf savings`}
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* PRICE & SEPARATE OUTBOUND BUTTON: Sibling 2 */}
                            <View style={styles.offerPriceCol}>
                              <Text
                                style={[
                                  styles.offerPriceVal,
                                  {
                                    color: isOfferComparable ? colors.text : colors.textSecondary,
                                  },
                                ]}
                              >
                                ₹{offer.price}
                              </Text>
                              <Pressable
                                style={[
                                  styles.viewOfferBtn,
                                  {
                                    backgroundColor: isOfferComparable
                                      ? colors.accent
                                      : isDark
                                        ? '#233227'
                                        : colors.cardMuted,
                                    borderWidth: isOfferComparable ? 0 : 1,
                                    borderColor: colors.border,
                                  },
                                ]}
                                onPress={() => handleOpenVerifiedOffer(offer)}
                                accessibilityRole="button"
                                accessibilityLabel={`Open ${offer.retailerName} merchant page`}
                              >
                                <Text
                                  style={[
                                    styles.viewOfferText,
                                    {
                                      color: isOfferComparable
                                        ? colors.accentText
                                        : colors.text,
                                    },
                                  ]}
                                >
                                  Open retailer ↗
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* If no verified offers exist, show honest notification */}
                  {(!comparison?.verifiedOffers || comparison.verifiedOffers.length === 0) && (
                    <View
                      style={[
                        styles.noVerifiedOfferCard,
                        {
                          backgroundColor: colors.cardMuted,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <View style={styles.noVerifiedOfferHeader}>
                        <View style={[styles.noVerifiedOfferDot, { backgroundColor: isDark ? colors.accent : colors.primaryDark }]} />
                        <Text style={[styles.noVerifiedOfferTitle, { color: colors.text }]}>
                          Price Check at Retailer
                        </Text>
                      </View>
                      <Text style={[styles.noVerifiedOfferText, { color: colors.textSecondary }]}>
                        Live retailer prices are not available for this item yet. Check the retailer directly.
                      </Text>
                    </View>
                  )}

                  {/* OUTBOUND RETAILER ACTIONS: Grouped by Commerce Type */}
                  <View style={styles.retailerActionGrid}>
                    <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                      Search on Indian Retailers
                    </Text>
                    <Text style={[styles.retailerHonestyNote, { color: colors.textMuted }]}>
                      Live price and inventory depend on dark store location and local PIN code. Tapping a retailer opens its search page with this exact product query.
                    </Text>

                    {/* Group 1: Quick Commerce */}
                    {comparison?.retailerActions.filter((a) => a.platformType === 'quick_commerce').length ? (
                      <View style={styles.retailerGroupBlock}>
                        <Text style={[styles.retailerGroupTitle, { color: colors.text }]}>
                          ⚡ Quick Commerce (10–30 mins delivery where serviceable)
                        </Text>
                        <View style={styles.groupCardList}>
                          {comparison.retailerActions
                            .filter((a) => a.platformType === 'quick_commerce')
                            .map((action) => (
                              <View
                                key={action.retailerId}
                                style={[
                                  styles.actionCard,
                                  {
                                    backgroundColor: colors.cardMuted,
                                    borderColor: colors.cardBorder,
                                  },
                                ]}
                              >
                                <View style={styles.actionCardLeft}>
                                  <View style={styles.actionHeaderRow}>
                                    <Text style={[styles.actionRetailerName, { color: colors.text }]}>
                                      {action.displayName}
                                    </Text>
                                    <View
                                      style={[
                                        styles.platformPill,
                                        {
                                          backgroundColor: isDark ? '#26382E' : '#E4F2E7',
                                        },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.platformPillText,
                                          {
                                            color: isDark ? colors.accent : colors.primaryDark,
                                          },
                                        ]}
                                      >
                                        {action.badge}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text
                                    style={[styles.actionStatusNote, { color: colors.textSecondary }]}
                                    numberOfLines={2}
                                  >
                                    {action.statusNote}
                                  </Text>
                                </View>

                                <Pressable
                                  style={({ pressed }) => [
                                    styles.actionCtaButton,
                                    {
                                      backgroundColor: isDark ? '#1C2C24' : colors.primaryDark,
                                      opacity: pressed ? 0.8 : 1,
                                    },
                                  ]}
                                  onPress={() => handleOpenRetailerAction(action)}
                                  accessibilityRole="button"
                                  accessibilityLabel={action.actionLabel}
                                >
                                  <Text
                                    style={[
                                      styles.actionCtaText,
                                      { color: isDark ? colors.accent : '#FFFFFF' },
                                    ]}
                                  >
                                    {action.actionLabel}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.actionCtaArrow,
                                      { color: isDark ? colors.accent : colors.accent },
                                    ]}
                                  >
                                    ↗
                                  </Text>
                                </Pressable>
                              </View>
                            ))}
                        </View>
                      </View>
                    ) : null}

                    {/* Group 2: Marketplaces & Hypermarkets */}
                    {comparison?.retailerActions.filter(
                      (a) =>
                        a.platformType === 'hypermarket' ||
                        (a.platformType === 'marketplace' && !['myntra', 'ajio', 'nykaa'].includes(a.retailerId))
                    ).length ? (
                      <View style={styles.retailerGroupBlock}>
                        <Text style={[styles.retailerGroupTitle, { color: colors.text }]}>
                          🛒 Marketplaces & Hypermarkets (Grocery & essentials delivery)
                        </Text>
                        <View style={styles.groupCardList}>
                          {comparison.retailerActions
                            .filter(
                              (a) =>
                                a.platformType === 'hypermarket' ||
                                (a.platformType === 'marketplace' && !['myntra', 'ajio', 'nykaa'].includes(a.retailerId))
                            )
                            .map((action) => (
                              <View
                                key={action.retailerId}
                                style={[
                                  styles.actionCard,
                                  {
                                    backgroundColor: colors.cardMuted,
                                    borderColor: colors.cardBorder,
                                  },
                                ]}
                              >
                                <View style={styles.actionCardLeft}>
                                  <View style={styles.actionHeaderRow}>
                                    <Text style={[styles.actionRetailerName, { color: colors.text }]}>
                                      {action.displayName}
                                    </Text>
                                    <View
                                      style={[
                                        styles.platformPill,
                                        {
                                          backgroundColor: colors.chipBg,
                                        },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.platformPillText,
                                          {
                                            color: colors.chipText,
                                          },
                                        ]}
                                      >
                                        {action.badge}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text
                                    style={[styles.actionStatusNote, { color: colors.textSecondary }]}
                                    numberOfLines={2}
                                  >
                                    {action.statusNote}
                                  </Text>
                                </View>

                                <Pressable
                                  style={({ pressed }) => [
                                    styles.actionCtaButton,
                                    {
                                      backgroundColor: isDark ? '#1C2C24' : colors.primaryDark,
                                      opacity: pressed ? 0.8 : 1,
                                    },
                                  ]}
                                  onPress={() => handleOpenRetailerAction(action)}
                                  accessibilityRole="button"
                                  accessibilityLabel={action.actionLabel}
                                >
                                  <Text
                                    style={[
                                      styles.actionCtaText,
                                      { color: isDark ? colors.accent : '#FFFFFF' },
                                    ]}
                                  >
                                    {action.actionLabel}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.actionCtaArrow,
                                      { color: isDark ? colors.accent : colors.accent },
                                    ]}
                                  >
                                    ↗
                                  </Text>
                                </Pressable>
                              </View>
                            ))}
                        </View>
                      </View>
                    ) : null}

                    {/* Group 3: Specialized Platforms (Fashion, Beauty, Personal Care) */}
                    {comparison?.retailerActions.filter((a) =>
                      ['myntra', 'ajio', 'nykaa'].includes(a.retailerId)
                    ).length ? (
                      <View style={styles.retailerGroupBlock}>
                        <Text style={[styles.retailerGroupTitle, { color: colors.text }]}>
                          ✨ Specialized Platforms (Personal care, fashion & lifestyle)
                        </Text>
                        <Text style={[styles.retailerGroupNotice, { color: colors.textMuted }]}>
                          Note: These retailers primarily stock personal care, beauty, or lifestyle. Grocery products may not be listed.
                        </Text>
                        <View style={styles.groupCardList}>
                          {comparison.retailerActions
                            .filter((a) => ['myntra', 'ajio', 'nykaa'].includes(a.retailerId))
                            .map((action) => (
                              <View
                                key={action.retailerId}
                                style={[
                                  styles.actionCard,
                                  {
                                    backgroundColor: colors.cardMuted,
                                    borderColor: colors.cardBorder,
                                  },
                                ]}
                              >
                                <View style={styles.actionCardLeft}>
                                  <View style={styles.actionHeaderRow}>
                                    <Text style={[styles.actionRetailerName, { color: colors.text }]}>
                                      {action.displayName}
                                    </Text>
                                    <View
                                      style={[
                                        styles.platformPill,
                                        {
                                          backgroundColor: colors.chipBg,
                                        },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.platformPillText,
                                          {
                                            color: colors.chipText,
                                          },
                                        ]}
                                      >
                                        {action.badge}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text
                                    style={[styles.actionStatusNote, { color: colors.textSecondary }]}
                                    numberOfLines={2}
                                  >
                                    {action.statusNote}
                                  </Text>
                                </View>

                                <Pressable
                                  style={({ pressed }) => [
                                    styles.actionCtaButton,
                                    {
                                      backgroundColor: isDark ? '#1C2C24' : colors.primaryDark,
                                      opacity: pressed ? 0.8 : 1,
                                    },
                                  ]}
                                  onPress={() => handleOpenRetailerAction(action)}
                                  accessibilityRole="button"
                                  accessibilityLabel={action.actionLabel}
                                >
                                  <Text
                                    style={[
                                      styles.actionCtaText,
                                      { color: isDark ? colors.accent : '#FFFFFF' },
                                    ]}
                                  >
                                    {action.actionLabel}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.actionCtaArrow,
                                      { color: isDark ? colors.accent : colors.accent },
                                    ]}
                                  >
                                    ↗
                                  </Text>
                                </Pressable>
                              </View>
                            ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
            </View>

            {/* DYNAMIC SAVINGS CARD (Step 3) */}
            {selectedVerifiedOffer && storePriceNumber > 0 && selectedVerifiedOffer.price > 0 && (
              <View
                style={[
                  styles.savingsCard,
                  {
                    backgroundColor:
                      isComparable && savings > 0
                        ? isDark
                          ? '#16281F'
                          : colors.primaryDark
                        : colors.cardMuted,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.savingsTop}>
                  <View>
                    <Text
                      style={[
                        styles.savingsKicker,
                        {
                          color: !isComparable
                            ? isDark
                              ? '#FBBF24'
                              : '#B45309'
                            : savings > 0
                              ? colors.heroKicker
                              : colors.textMuted,
                        },
                      ]}
                    >
                      {!isComparable
                        ? 'VARIANT COMPARISON'
                        : savings > 0
                          ? 'CALCULATED TRIP SAVINGS'
                          : storePriceNumber < selectedVerifiedOffer.price
                            ? 'PRICE EVALUATION'
                            : 'PRICE MATCH'}
                    </Text>
                    <Text
                      style={[
                        styles.savingsValue,
                        { color: isComparable && savings > 0 ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {!isComparable
                        ? 'Different variant — not comparable'
                        : savings > 0
                          ? `₹${savings.toFixed(2)} savings`
                          : storePriceNumber < selectedVerifiedOffer.price
                            ? `₹${(selectedVerifiedOffer.price - storePriceNumber).toFixed(2)} higher than shelf price`
                            : 'In-store shelf price matches offer'}
                    </Text>
                  </View>
                  {isComparable && savings > 0 && (
                    <View style={[styles.savingsTag, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.savingsTagText, { color: colors.accentText }]}>
                        {((savings / storePriceNumber) * 100).toFixed(0)}% SAVING
                      </Text>
                    </View>
                  )}
                  {isComparable && storePriceNumber < selectedVerifiedOffer.price && (
                    <View style={[styles.savingsTag, { backgroundColor: isDark ? '#3D2525' : '#FDE8E8' }]}>
                      <Text style={[styles.savingsTagText, { color: isDark ? '#FCA5A5' : '#9B1C1C' }]}>
                        SHELF CHEAPER
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.savingsDescription,
                    { color: isComparable && savings > 0 ? '#D7E5DC' : colors.textSecondary },
                  ]}
                >
                  {!isComparable
                    ? `Selected offer on ${selectedVerifiedOffer.retailerName} (${selectedVerifiedOffer.packSize || selectedVerifiedOffer.variantNote || 'different pack'}) is not an exact match for your in-store package size (${sizeInfo || 'shelf product'}). Savings cannot be claimed against the shelf price.`
                    : savings > 0
                      ? `Buying via ${selectedVerifiedOffer.retailerName} at ₹${selectedVerifiedOffer.price} saves ₹${savings.toFixed(2)} compared to your physical shelf price of ₹${storePriceNumber}.`
                      : storePriceNumber < selectedVerifiedOffer.price
                        ? `Your shelf price (₹${storePriceNumber}) is ₹${(selectedVerifiedOffer.price - storePriceNumber).toFixed(2)} cheaper than ${selectedVerifiedOffer.retailerName} (₹${selectedVerifiedOffer.price}). In-store purchase is the better choice.`
                        : `Your shelf price (₹${storePriceNumber}) exactly matches ${selectedVerifiedOffer.retailerName} (₹${selectedVerifiedOffer.price}).`}
                </Text>
              </View>
            )}

            {/* ADD TO SHOPPING TRIP ACTION */}
            <View style={styles.actionBlock}>
              {!addedToTrip ? (
                <Pressable
                  style={[styles.primaryActionButton, { backgroundColor: colors.accent }]}
                  onPress={addToShoppingTrip}
                  accessibilityRole="button"
                  accessibilityLabel="Add to Shopping Trip"
                >
                  <View>
                    <Text style={[styles.primaryActionText, { color: colors.accentText }]}>
                      Add to Shopping Trip
                    </Text>
                    <Text style={[styles.primaryActionSub, { color: colors.accentText }]}>
                      {storePriceNumber > 0
                        ? `Logged at ₹${storePriceNumber} shelf price`
                        : 'Enter in-store price above'}
                    </Text>
                  </View>
                  <Text style={[styles.primaryActionArrow, { color: colors.accentText }]}>→</Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.addedConfirmationCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={[styles.addedBanner, { backgroundColor: colors.badgeBg }]}>
                    <View
                      style={[
                        styles.addedCheck,
                        { backgroundColor: isDark ? colors.accent : colors.primaryDark },
                      ]}
                    >
                      <Text
                        style={[
                          styles.addedCheckGlyph,
                          { color: isDark ? colors.primaryDark : colors.accent },
                        ]}
                      >
                        ✓
                      </Text>
                    </View>
                    <View style={styles.addedCopy}>
                      <Text style={[styles.addedTitle, { color: colors.text }]}>
                        Added to Shopping Trip
                      </Text>
                      <Text style={[styles.addedSubtitle, { color: colors.textSecondary }]}>
                        Shelf price: ₹{storePriceNumber}{' '}
                        {selectedVerifiedOffer
                          ? `· Online: ₹${selectedVerifiedOffer.price} (${selectedVerifiedOffer.retailerName})`
                          : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dualNavRow}>
                    <Pressable
                      style={[styles.secondaryNavButton, { backgroundColor: colors.chipBg }]}
                      onPress={() => router.replace('/trip')}
                    >
                      <Text style={[styles.secondaryNavText, { color: colors.chipText }]}>
                        Open Trip Summary
                      </Text>
                      <Text style={[styles.secondaryNavArrow, { color: colors.chipText }]}>→</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.secondaryNavButton, { backgroundColor: colors.chipBg }]}
                      onPress={() => router.push('/search')}
                    >
                      <Text style={[styles.secondaryNavText, { color: colors.chipText }]}>
                        Find Next Item
                      </Text>
                      <Text style={[styles.secondaryNavArrow, { color: colors.chipText }]}>⌕</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* HONESTY & PRICING NOTICE */}
            <View style={[styles.disclaimerCard, { backgroundColor: colors.cardMuted }]}>
              <Text style={[styles.disclaimerTitle, { color: colors.textSecondary }]}>
                Transparent Pricing & Stock Guarantee
              </Text>
              <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
                ShopTrip does not fabricate prices or scrape unauthorized endpoints. Catalogue import does not create live price records. Live grocery availability, dark store delivery slots, and prices depend on location and are confirmed directly on the retailer&apos;s checkout.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  tripBadgeText: { fontSize: 12, fontWeight: '800' },
  tripBadgeArrow: { fontSize: 13, fontWeight: '700' },

  // Responsive Layout Shell
  content: { padding: 18, paddingBottom: 54 },
  desktopContent: {
    maxWidth: 1380,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  desktopColumnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  mobileStack: {
    flexDirection: 'column',
    gap: 18,
  },
  desktopLeftCol: {
    width: 440,
    gap: 16,
  },
  desktopRightCol: {
    flex: 1,
    gap: 16,
  },
  fullWidthCol: {
    width: '100%',
    gap: 16,
  },

  // Product Card
  productCard: { borderRadius: 22, borderWidth: 1, padding: 20 },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  categoryPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  marketPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  marketPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  productMainRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  productThumbFallback: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackGlyph: { fontSize: 28, fontWeight: '900' },
  productTitlesCol: { flex: 1 },
  productNameText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  brandSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  reasonBox: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reasonText: { fontSize: 11, lineHeight: 15 },
  productMetaTags: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  metaTag: { flex: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  metaTagLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  metaTagValue: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Shelf Price Input
  storeInputCard: { borderRadius: 22, borderWidth: 1, padding: 20 },
  inputCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  inputCardTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  iconChip: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconChipGlyph: { fontSize: 16, fontWeight: '800' },
  inputCardDesc: { fontSize: 12, lineHeight: 17, marginTop: 6, marginBottom: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputPrefix: {
    width: 44,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inputPrefixText: { fontSize: 18, fontWeight: '800' },
  textInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    outlineStyle: 'none',
  } as any,

  // Comparison & Retailer Actions Section
  comparisonContainer: { borderRadius: 22, borderWidth: 1, padding: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  badgePill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgePillText: { fontSize: 10, fontWeight: '800' },
  retailerSectionNotice: { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  loadingBox: { padding: 24, alignItems: 'center', gap: 8 },
  loadingBoxText: { fontSize: 12 },
  actionsList: { gap: 16 },

  // Verified Offers
  noVerifiedOfferCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  noVerifiedOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noVerifiedOfferDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noVerifiedOfferTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  noVerifiedOfferText: {
    fontSize: 12,
    lineHeight: 18,
  },
  verifiedOffersBlock: { gap: 10, marginBottom: 10 },
  subSectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, marginBottom: 4 },
  verifiedOfferCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  offerSelectRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleDisabled: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    opacity: 0.5,
  },
  disabledGlyph: {
    fontSize: 12,
    fontWeight: '800',
  },
  selectableHint: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  radioGlyph: {
    fontSize: 12,
    fontWeight: '900',
  },
  offerMainInfo: { flex: 1 },
  offerHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  offerRetailerName: { fontSize: 15, fontWeight: '800' },
  matchBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  variantBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  variantBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  offerDeliveryText: { fontSize: 11, marginTop: 3 },
  variantWarningText: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  offerPriceCol: { alignItems: 'flex-end', gap: 6 },
  offerPriceVal: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  viewOfferBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewOfferText: { fontSize: 11, fontWeight: '800' },

  // Retailer Outbound Grid
  retailerActionGrid: { gap: 14 },
  retailerHonestyNote: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
  retailerGroupBlock: { gap: 8 },
  retailerGroupTitle: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2, marginTop: 4 },
  retailerGroupNotice: { fontSize: 11, lineHeight: 15, marginBottom: 2 },
  groupCardList: { gap: 8 },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCardLeft: { flex: 1 },
  actionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  actionRetailerName: { fontSize: 15, fontWeight: '800' },
  platformPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  platformPillText: { fontSize: 9, fontWeight: '800' },
  actionStatusNote: { fontSize: 11, lineHeight: 15 },
  actionCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 11,
  },
  actionCtaText: { fontSize: 12, fontWeight: '800' },
  actionCtaArrow: { fontSize: 14, fontWeight: '800' },

  // Savings Card
  savingsCard: { borderRadius: 18, padding: 18, borderWidth: 1 },
  savingsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  savingsKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 3 },
  savingsValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  savingsTag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  savingsTagText: { fontSize: 11, fontWeight: '900' },
  savingsDescription: { fontSize: 12, lineHeight: 18, marginTop: 8 },

  // Action CTA
  actionBlock: { marginTop: 6 },
  primaryActionButton: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryActionText: { fontSize: 16, fontWeight: '800' },
  primaryActionSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  primaryActionArrow: { fontSize: 22, fontWeight: '700' },
  addedConfirmationCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  addedBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14 },
  addedCheck: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addedCheckGlyph: { fontSize: 15, fontWeight: '900' },
  addedCopy: { marginLeft: 12, flex: 1 },
  addedTitle: { fontSize: 13, fontWeight: '800' },
  addedSubtitle: { fontSize: 11, marginTop: 1 },
  dualNavRow: { flexDirection: 'row', gap: 10 },
  secondaryNavButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryNavText: { fontSize: 12, fontWeight: '800' },
  secondaryNavArrow: { fontSize: 14, fontWeight: '700' },

  // Metadata & Disclaimer
  attributionCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  attributionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  attrDot: { width: 7, height: 7, borderRadius: 4 },
  attributionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  attributionText: { fontSize: 11, lineHeight: 16 },
  disclaimerCard: { padding: 14, borderRadius: 14 },
  disclaimerTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  disclaimerText: { fontSize: 11, lineHeight: 16, marginTop: 4 },
});
