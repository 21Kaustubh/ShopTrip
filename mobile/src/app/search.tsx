import { router } from 'expo-router';
import React, { useEffect, useReducer, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
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
import { useAppTheme } from '../context/ThemeContext';
import { useTrip } from '../context/TripContext';
import {
  searchProducts,
  searchExternalCatalogue,
  getProductByBarcode,
  type Product,
  type CatalogueSearchResponse,
} from '../services/productService';

const CATEGORIES_LIST = [
  { name: 'Coffee', query: 'Coffee' },
  { name: 'Tea', query: 'Tea' },
  { name: 'Dairy', query: 'Milk' },
  { name: 'Atta & Flour', query: 'Atta' },
  { name: 'Rice & Grains', query: 'Rice' },
  { name: 'Noodles & Pasta', query: 'Noodles' },
  { name: 'Biscuits & Snacks', query: 'Biscuits' },
  { name: 'Oils & Spices', query: 'Oil' },
];

function getCategoryGlyph(category: string): string {
  if (category.startsWith('Coffee')) return 'C';
  if (category.startsWith('Tea')) return 'T';
  if (category.includes('Soup') || category.includes('Food')) return 'F';
  if (category.includes('Snack') || category.includes('Biscuit')) return 'S';
  if (category.includes('Staple') || category.includes('Rice') || category.includes('Atta')) return 'R';
  if (category.includes('Cooking') || category.includes('Oil') || category.includes('Salt')) return 'E';
  if (category.includes('Dairy') || category.includes('Breakfast')) return 'D';
  if (category.includes('Clean')) return 'H';
  if (category.includes('Personal')) return 'P';
  return category.slice(0, 1).toUpperCase() || 'P';
}

// ─── Reducers ────────────────────────────────────────────────────────────────

type LocalState = { loading: boolean; results: Product[] };
type LocalAction =
  | { type: 'SEARCHING' }
  | { type: 'DONE'; results: Product[] }
  | { type: 'ERROR' };

function localReducer(_state: LocalState, action: LocalAction): LocalState {
  switch (action.type) {
    case 'SEARCHING': return { loading: true, results: [] };
    case 'DONE':      return { loading: false, results: action.results };
    case 'ERROR':     return { loading: false, results: [] };
  }
}

type ExtState = {
  status: 'idle' | 'loading' | 'done' | 'error';
  results: Product[];
  totalMatches: number;
  indiaCount: number;
  internationalCount: number;
  hasInternationalAvailable: boolean;
  includeInternational: boolean;
  attribution?: string;
};

type ExtAction =
  | { type: 'IDLE' }
  | { type: 'LOADING' }
  | { type: 'DONE'; payload: CatalogueSearchResponse }
  | { type: 'ERROR' };

const initialExtState: ExtState = {
  status: 'idle',
  results: [],
  totalMatches: 0,
  indiaCount: 0,
  internationalCount: 0,
  hasInternationalAvailable: false,
  includeInternational: false,
};

function extReducer(_state: ExtState, action: ExtAction): ExtState {
  switch (action.type) {
    case 'IDLE':
      return initialExtState;
    case 'LOADING':
      return { ..._state, status: 'loading' };
    case 'DONE':
      return {
        status: 'done',
        results: action.payload.results,
        totalMatches: action.payload.totalMatches,
        indiaCount: action.payload.indiaCount,
        internationalCount: action.payload.internationalCount,
        hasInternationalAvailable: action.payload.hasInternationalAvailable,
        includeInternational: action.payload.includeInternational,
        attribution: action.payload.attribution,
      };
    case 'ERROR':
      return { ..._state, status: 'error', results: [] };
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const { productCount, totalItems } = useTrip();

  const [query, setQuery] = useReducer((_: string, next: string) => next, '');
  const [{ loading, results }, dispatch] = useReducer(localReducer, { loading: false, results: [] });
  const [ext, dispatchExt] = useReducer(extReducer, initialExtState);
  const [marketFilter, setMarketFilter] = useState<'all' | 'india_tagged' | 'indian_brands'>('all');

  // Debounced local search — no direct setState in effect body
  useEffect(() => {
    const clean = query.trim();
    if (!clean) return;

    dispatchExt({ type: 'IDLE' });

    let active = true;
    const timer = setTimeout(async () => {
      if (!active) return;
      dispatch({ type: 'SEARCHING' });
      try {
        const data = await searchProducts(clean);
        if (active) dispatch({ type: 'DONE', results: data });
      } catch {
        if (active) dispatch({ type: 'ERROR' });
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // User-initiated: tap "Search wider catalogue" (defaults to India-first)
  const searchExternal = async (includeInternational = false) => {
    const clean = query.trim();
    if (!clean) return;
    Keyboard.dismiss();
    dispatchExt({ type: 'LOADING' });
    try {
      const response = await searchExternalCatalogue(clean, includeInternational);
      dispatchExt({ type: 'DONE', payload: response });
    } catch {
      dispatchExt({ type: 'ERROR' });
    }
  };

  // Selecting an external result: verify via barcode (triggers backend persist), then navigate
  const openExternalProduct = async (product: Product) => {
    Keyboard.dismiss();
    const verified = await getProductByBarcode(product.barcode);
    const toOpen = verified ?? product;
    router.push({
      pathname: '/product',
      params: {
        ...toOpen,
        marketAvailability: product.marketAvailability,
        marketBadge: product.marketBadge,
        marketReason: product.marketReason,
      },
    });
  };

  const openProduct = (product: Product) => {
    Keyboard.dismiss();
    router.push({ pathname: '/product', params: product });
  };

  const isQueryEmpty = query.trim().length === 0;
  const localEmpty = !loading && !isQueryEmpty && results.length === 0 && ext.status === 'idle';

  // Filter external results based on user selection
  const filteredExtResults = ext.results.filter((p) => {
    if (marketFilter === 'india_tagged') {
      return p.marketAvailability === 'india_confirmed';
    }
    if (marketFilter === 'indian_brands') {
      return p.marketAvailability === 'india_confirmed' || p.marketAvailability === 'india_likely';
    }
    return true;
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Find a Product"
        eyebrow="ShopTrip"
        fallbackRoute="/home"
        backLabel="Back to Home"
        rightElement={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View shopping trip"
            style={[styles.topbarTripBadge, { backgroundColor: colors.badgeBg }]}
            onPress={() => router.push('/trip')}
          >
            <Text style={[styles.topbarTripText, { color: colors.badgeText }]}>
              Trip ({productCount})
            </Text>
            <Text style={[styles.topbarTripArrow, { color: colors.badgeText }]}>→</Text>
          </Pressable>
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
        <View style={isDesktop ? styles.desktopWorkspaceRow : styles.mobileWorkspace}>
          {/* ════════════════ LEFT RAIL: FILTERS & CATEGORIES ════════════════ */}
          <View style={isDesktop ? styles.desktopLeftRail : styles.mobileCategoryRow}>
            {isDesktop ? (
              <View style={[styles.railCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.railHeading, { color: colors.textMuted }]}>
                  INDIAN GROCERY
                </Text>
                <View style={styles.verticalCategoryList}>
                  {CATEGORIES_LIST.map((cat) => {
                    const isSelected = query.toLowerCase() === cat.query.toLowerCase();
                    return (
                      <Pressable
                        key={cat.name}
                        style={[
                          styles.verticalCategoryItem,
                          isSelected && { backgroundColor: isDark ? '#1C2C24' : '#EAF3EC' },
                        ]}
                        onPress={() => setQuery(cat.query)}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.verticalCategoryText,
                            { color: isSelected ? (isDark ? colors.accent : colors.primaryDark) : colors.text },
                            isSelected && { fontWeight: '800' },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {ext.status === 'done' && (
                  <View style={[styles.railMarketFilter, { borderTopColor: colors.border }]}>
                    <Text style={[styles.railHeading, { color: colors.textMuted }]}>
                      MARKET FILTER
                    </Text>
                    <Pressable
                      style={[
                        styles.filterPill,
                        marketFilter === 'all' && { backgroundColor: isDark ? '#1C2C24' : colors.primaryDark },
                      ]}
                      onPress={() => setMarketFilter('all')}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: marketFilter === 'all' ? (isDark ? colors.accent : '#FFFFFF') : colors.textSecondary },
                        ]}
                      >
                        All Matches ({ext.results.length})
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.filterPill,
                        marketFilter === 'india_tagged' && { backgroundColor: isDark ? '#1C2C24' : colors.primaryDark },
                      ]}
                      onPress={() => setMarketFilter('india_tagged')}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: marketFilter === 'india_tagged' ? (isDark ? colors.accent : '#FFFFFF') : colors.textSecondary },
                        ]}
                      >
                        🇮🇳 India Tagged Only
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalChips}
              >
                {CATEGORIES_LIST.map((cat) => (
                  <Pressable
                    key={cat.name}
                    style={[
                      styles.suggestion,
                      { backgroundColor: colors.chipBg },
                      query.toLowerCase() === cat.query.toLowerCase() && {
                        backgroundColor: isDark ? '#1C2C24' : colors.primaryDark,
                      },
                    ]}
                    onPress={() => setQuery(cat.query)}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.suggestionText,
                        {
                          color:
                            query.toLowerCase() === cat.query.toLowerCase()
                              ? isDark
                                ? colors.accent
                                : '#FFFFFF'
                              : colors.chipText,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* ════════════════ CENTER COLUMN: SEARCH & PRODUCT RESULTS ════════════════ */}
          <View style={isDesktop ? styles.desktopCenterCol : styles.mobileCenterCol}>
            {/* SEARCH INPUT */}
            <View
              style={[
                styles.searchShell,
                { backgroundColor: colors.card, borderColor: colors.inputBorder },
              ]}
            >
              <Text style={[styles.searchGlyph, { color: isDark ? colors.accent : colors.primaryDark }]}>
                ⌕
              </Text>
              <TextInput
                autoFocus={!isDesktop}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={Keyboard.dismiss}
                style={[styles.input, { color: colors.inputText }]}
                placeholder="Search brand, product, or barcode"
                placeholderTextColor={colors.inputPlaceholder}
              />
              {query.length > 0 && (
                <Pressable
                  style={[styles.clear, { backgroundColor: colors.chipBg }]}
                  onPress={() => setQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search text"
                >
                  <Text style={[styles.clearText, { color: colors.textSecondary }]}>×</Text>
                </Pressable>
              )}
            </View>

            {/* ── LOADING ── */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={isDark ? colors.accent : colors.primaryDark} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Searching database...
                </Text>
              </View>

            /* ── EMPTY QUERY: Initial search prompt ── */
            ) : isQueryEmpty ? (
              <View>
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: isDark ? '#14201A' : colors.primaryDark },
                  ]}
                >
                  <View style={[styles.emptyMark, { backgroundColor: isDark ? '#22352B' : '#2A594A' }]}>
                    <Text style={[styles.emptyMarkText, { color: colors.accent }]}>⌕</Text>
                  </View>
                  <Text style={styles.emptyTitle}>Search before you scan</Text>
                  <Text style={styles.emptyText}>
                    Search real Indian FMCG brands and products (BRU, Nescafé, Tata, Amul, Fortune) or enter a barcode.
                  </Text>
                  <Pressable
                    style={[styles.scanCta, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/scan')}
                  >
                    <Text style={[styles.scanCtaText, { color: colors.accentText }]}>
                      Use barcode scanner
                    </Text>
                    <Text style={[styles.scanCtaArrow, { color: colors.accentText }]}>→</Text>
                  </Pressable>
                </View>
              </View>

            /* ── LOCAL DATABASE RESULTS ── */
            ) : results.length > 0 ? (
              <View>
                <View style={styles.resultHeader}>
                  <Text style={[styles.kicker, { color: colors.textMuted }]}>
                    DATABASE MATCHES
                  </Text>
                  <Text style={[styles.count, { color: colors.textSecondary }]}>
                    {results.length} {results.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <View style={styles.list}>
                  {results.map((product) => (
                    <ProductResult
                      key={product.barcode}
                      product={product}
                      colors={colors}
                      onPress={() => openProduct(product)}
                    />
                  ))}
                </View>
              </View>

            /* ── LOCAL EMPTY + EXTERNAL DISCOVERY ── */
            ) : (
              <View>
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: isDark ? '#14201A' : colors.primaryDark },
                  ]}
                >
                  <View style={[styles.emptyMark, { backgroundColor: isDark ? '#22352B' : '#2A594A' }]}>
                    <Text style={[styles.emptyMarkText, { color: colors.accent }]}>?</Text>
                  </View>
                  <Text style={styles.emptyTitle}>No matching products in database</Text>
                  <Text style={styles.emptyText}>
                    No local records matching &quot;{query}&quot; were found in your database.
                  </Text>

                  <View style={styles.emptyActionsRow}>
                    <Pressable
                      style={[styles.emptyResetBtn, { backgroundColor: colors.chipBg }]}
                      onPress={() => setQuery('')}
                    >
                      <Text style={[styles.emptyResetText, { color: colors.chipText }]}>
                        Clear Search
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.scanCta, { backgroundColor: colors.accent }]}
                      onPress={() => router.push('/scan')}
                    >
                      <Text style={[styles.scanCtaText, { color: colors.accentText }]}>
                        Try barcode scanner
                      </Text>
                      <Text style={[styles.scanCtaArrow, { color: colors.accentText }]}>→</Text>
                    </Pressable>
                  </View>
                </View>

                {/* External Catalogue Discovery: India-First */}
                <View
                  style={[
                    styles.extPanel,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.extHeaderRow}>
                    <View style={styles.extTitleBlock}>
                      <Text style={[styles.extKicker, { color: colors.textMuted }]}>
                        OPEN FOOD FACTS · INDIA FIRST
                      </Text>
                      <Text style={[styles.extTitle, { color: colors.text }]}>
                        Search wider catalogue
                      </Text>
                    </View>
                    <View style={[styles.marketPill, { backgroundColor: colors.badgeBg }]}>
                      <Text style={[styles.marketPillText, { color: colors.badgeText }]}>
                        🇮🇳 India Grocery
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.extDesc, { color: colors.textSecondary }]}>
                    Discovers Indian grocery records from Open Food Facts with catalogue brands and barcodes.
                    Selecting an item imports metadata to your local database; prices must be checked at individual retailers.
                  </Text>

                  {/* State: idle */}
                  {ext.status === 'idle' && localEmpty && (
                    <Pressable
                      style={[
                        styles.extButton,
                        { backgroundColor: isDark ? '#1C2C24' : colors.primaryDark },
                      ]}
                      onPress={() => searchExternal(false)}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.extButtonText,
                          { color: isDark ? colors.accent : '#FFFFFF' },
                        ]}
                      >
                        Search Indian catalogue for &quot;{query}&quot;
                      </Text>
                      <Text style={[styles.extButtonArrow, { color: colors.accent }]}>→</Text>
                    </Pressable>
                  )}

                  {/* State: loading */}
                  {ext.status === 'loading' && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator
                        size="small"
                        color={isDark ? colors.accent : colors.primaryDark}
                      />
                      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Searching Open Food Facts for Indian grocery records…
                      </Text>
                    </View>
                  )}

                  {/* State: done with 0 results */}
                  {ext.status === 'done' && ext.results.length === 0 && (
                    <View style={styles.noMatchBox}>
                      <Text style={[styles.extNotFound, { color: colors.textSecondary }]}>
                        No India-tagged matches found for &quot;{query}&quot; in the catalogue.
                      </Text>
                      {ext.hasInternationalAvailable &&
                        ext.internationalCount > 0 &&
                        !ext.includeInternational && (
                          <View style={styles.intlPromptBox}>
                            <Text style={[styles.intlPromptText, { color: colors.textMuted }]}>
                              {ext.internationalCount} international matches found with overseas packaging.
                            </Text>
                            <Pressable
                              style={[styles.intlButton, { backgroundColor: colors.chipBg }]}
                              onPress={() => searchExternal(true)}
                            >
                              <Text style={[styles.intlButtonText, { color: colors.chipText }]}>
                                Show overseas &amp; unclassified records
                              </Text>
                            </Pressable>
                          </View>
                        )}
                    </View>
                  )}

                  {/* State: done with results */}
                  {ext.status === 'done' && ext.results.length > 0 && (
                    <View>
                      <View style={styles.extResultsHeader}>
                        <Text style={[styles.kicker, { color: colors.textMuted }]}>
                          CATALOGUE RESULTS ({filteredExtResults.length})
                        </Text>
                        <Text style={[styles.count, { color: colors.textSecondary }]}>
                          {ext.includeInternational
                            ? 'Showing all markets'
                            : `🇮🇳 India Priority (${ext.indiaCount})`}
                        </Text>
                      </View>

                      {ext.includeInternational && (
                        <View style={[styles.intlBar, { backgroundColor: colors.chipBg }]}>
                          <Text style={[styles.intlBarText, { color: colors.chipText }]}>
                            Viewing global catalogue results. Overseas packaging may differ.
                          </Text>
                        </View>
                      )}

                      <View style={styles.list}>
                        {filteredExtResults.map((product) => (
                          <ProductResult
                            key={product.barcode}
                            product={product}
                            colors={colors}
                            isExternal
                            onPress={() => openExternalProduct(product)}
                          />
                        ))}
                      </View>

                      {ext.hasInternationalAvailable && !ext.includeInternational && (
                        <Pressable
                          style={[styles.intlButton, { backgroundColor: colors.chipBg, marginTop: 12 }]}
                          onPress={() => searchExternal(true)}
                        >
                          <Text style={[styles.intlButtonText, { color: colors.chipText }]}>
                            Include {ext.internationalCount} overseas &amp; unclassified records →
                          </Text>
                        </Pressable>
                      )}

                      {ext.attribution && (
                        <Text style={[styles.attribution, { color: colors.textMuted }]}>
                          {ext.attribution}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* State: error */}
                  {ext.status === 'error' && (
                    <View style={styles.noMatchBox}>
                      <Text style={[styles.extNotFound, { color: colors.textSecondary }]}>
                        Catalogue lookup failed. Please verify your network connection and try again.
                      </Text>
                      <Pressable
                        style={[styles.intlButton, { backgroundColor: colors.chipBg, marginTop: 6 }]}
                        onPress={() => searchExternal(false)}
                      >
                        <Text style={[styles.intlButtonText, { color: colors.chipText }]}>
                          Retry Catalogue Search
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* ════════════════ RIGHT RAIL (DESKTOP): SHOPPING TRIP DRAWER ════════════════ */}
          {isDesktop && (
            <View style={styles.desktopRightRail}>
              <View
                style={[
                  styles.tripRailCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.tripRailHeader}>
                  <Text style={[styles.railHeading, { color: colors.textMuted }]}>
                    ACTIVE SHOPPING TRIP
                  </Text>
                  <View style={[styles.tripCountBadge, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.tripCountText, { color: colors.badgeText }]}>
                      {productCount} items
                    </Text>
                  </View>
                </View>

                {productCount === 0 ? (
                  <View style={styles.emptyTripBlock}>
                    <Text style={[styles.emptyTripTitle, { color: colors.text }]}>
                      Your trip is empty
                    </Text>
                    <Text style={[styles.emptyTripDesc, { color: colors.textSecondary }]}>
                      Search for items and select them to compare prices across Blinkit, Zepto, Swiggy Instamart, Amazon, and Flipkart.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.activeTripBlock}>
                    <Text style={[styles.activeTripTotal, { color: colors.text }]}>
                      {totalItems} total units planned
                    </Text>
                    <Pressable
                      style={[styles.openTripCta, { backgroundColor: colors.accent }]}
                      onPress={() => router.push('/trip')}
                    >
                      <Text style={[styles.openTripCtaText, { color: colors.accentText }]}>
                        View Trip Summary
                      </Text>
                      <Text style={[styles.openTripCtaArrow, { color: colors.accentText }]}>→</Text>
                    </Pressable>
                  </View>
                )}

                <View style={[styles.scannerCtaBox, { borderTopColor: colors.border }]}>
                  <Pressable
                    style={[styles.scanQuickBtn, { backgroundColor: colors.chipBg }]}
                    onPress={() => router.push('/scan')}
                  >
                    <Text style={[styles.scanQuickText, { color: colors.chipText }]}>
                      Barcode Scanner ⌁
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Compact Product Result Item ─────────────────────────────────────────────

function ProductResult({
  product,
  colors,
  isExternal = false,
  onPress,
}: {
  product: Product;
  colors: any;
  isExternal?: boolean;
  onPress: () => void;
}) {
  const isIndiaConfirmed = product.marketAvailability === 'india_confirmed';
  const isIndiaLikely = product.marketAvailability === 'india_likely';
  const isInternational = product.marketAvailability === 'international';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${product.productName}`}
    >
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={[styles.thumbImage, { borderColor: colors.border }]}
          resizeMode="contain"
          accessibilityLabel={product.productName}
        />
      ) : (
        <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.glyph, { color: colors.badgeText }]}>
            {getCategoryGlyph(product.category || '')}
          </Text>
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {product.productName}
          </Text>
        </View>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {product.brand ? `${product.brand} · ` : ''}
          {product.sizeInfo || (product.weight ? `${product.weight} ${product.unit}` : product.category)}
        </Text>

        <View style={styles.badgeRow}>
          {product.marketBadge && (
            <View
              style={[
                styles.tagPill,
                { backgroundColor: colors.chipBg },
                isIndiaConfirmed && { backgroundColor: '#1C382B' },
                isIndiaLikely && { backgroundColor: '#21332A' },
                isInternational && { backgroundColor: colors.chipBg },
              ]}
            >
              <Text
                style={[
                  styles.tagPillText,
                  { color: colors.textMuted },
                  isIndiaConfirmed && { color: '#88E3B6' },
                  isIndiaLikely && { color: '#B5DFC7' },
                ]}
              >
                {product.marketBadge}
              </Text>
            </View>
          )}
          {isExternal ? (
            <Text style={[styles.extBadge, { color: colors.textMuted }]}>Tap to compare</Text>
          ) : (
            <Text style={[styles.extBadge, { color: colors.accentText }]}>In Database</Text>
          )}
        </View>
      </View>

      <View style={styles.cardRight}>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>→</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topbarTripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  topbarTripText: { fontSize: 11, fontWeight: '800' },
  topbarTripArrow: { fontSize: 13, fontWeight: '700' },

  // Responsive Workspace Shell
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
    width: '100%',
  },
  desktopContent: {
    maxWidth: 1380,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  desktopWorkspaceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  mobileWorkspace: {
    flexDirection: 'column',
    gap: 14,
  },

  // Left Rail (Categories & Market Filter)
  desktopLeftRail: { width: 230, gap: 14 },
  railCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
  railHeading: { fontSize: 9, fontWeight: '800', letterSpacing: 0.9, marginBottom: 8 },
  verticalCategoryList: { gap: 4 },
  verticalCategoryItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verticalCategoryText: { fontSize: 12, fontWeight: '600' },
  railMarketFilter: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, gap: 6 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  filterPillText: { fontSize: 11, fontWeight: '700' },

  mobileCategoryRow: { marginBottom: 6 },
  horizontalChips: { flexDirection: 'row', gap: 8, paddingBottom: 6 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  suggestionText: { fontSize: 11, fontWeight: '800' },

  // Center Column (Search input & Results)
  desktopCenterCol: { flex: 1, minWidth: 460 },
  mobileCenterCol: { width: '100%' },

  // Search Shell
  searchShell: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchGlyph: { fontSize: 22, marginRight: 10, marginTop: -2 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  clear: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 18, fontWeight: '700', marginTop: -2 },

  // Right Rail (Desktop Shopping Trip Workspace)
  desktopRightRail: { width: 280 },
  tripRailCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  tripRailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripCountBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  tripCountText: { fontSize: 10, fontWeight: '800' },
  emptyTripBlock: { paddingVertical: 8, gap: 4 },
  emptyTripTitle: { fontSize: 14, fontWeight: '800' },
  emptyTripDesc: { fontSize: 11, lineHeight: 16 },
  activeTripBlock: { gap: 10 },
  activeTripTotal: { fontSize: 12, fontWeight: '700' },
  openTripCta: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openTripCtaText: { fontSize: 12, fontWeight: '800' },
  openTripCtaArrow: { fontSize: 15, fontWeight: '700' },
  scannerCtaBox: { paddingTop: 12, borderTopWidth: 1 },
  scanQuickBtn: { height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scanQuickText: { fontSize: 11, fontWeight: '800' },

  // Search State Displays
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, gap: 10 },
  loadingText: { fontSize: 13 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 0.9, marginBottom: 8 },
  emptyCard: { borderRadius: 22, padding: 24, alignItems: 'center', marginTop: 4 },
  emptyMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyMarkText: { fontSize: 22, fontWeight: '700' },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  emptyText: { color: '#BED0C4', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 360, marginBottom: 18 },
  emptyActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  emptyResetBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  emptyResetText: { fontSize: 12, fontWeight: '800' },
  scanCta: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  scanCtaText: { fontSize: 12, fontWeight: '800' },
  scanCtaArrow: { fontSize: 15, fontWeight: '700' },

  // Result Cards
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  count: { fontSize: 11, fontWeight: '700' },
  list: { gap: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  thumbImage: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, backgroundColor: '#FFFFFF' },
  badge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 16, fontWeight: '800' },
  details: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, flex: 1 },
  meta: { fontSize: 11, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  tagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagPillText: { fontSize: 9, fontWeight: '800' },
  extBadge: { fontSize: 9, fontWeight: '600' },
  cardRight: { paddingLeft: 10 },
  chevron: { fontSize: 16, fontWeight: '700' },

  // External Discovery
  extPanel: { borderRadius: 20, borderWidth: 1, padding: 18, marginTop: 14 },
  extHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  extTitleBlock: { flex: 1, marginRight: 8 },
  marketPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  marketPillText: { fontSize: 10, fontWeight: '800' },
  extKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 0.9, marginBottom: 4 },
  extTitle: { fontSize: 16, fontWeight: '800' },
  extDesc: { fontSize: 12, lineHeight: 17, marginBottom: 14 },
  extButton: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extButtonText: { fontSize: 13, fontWeight: '800', flex: 1 },
  extButtonArrow: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  noMatchBox: { paddingVertical: 10, gap: 8 },
  extNotFound: { fontSize: 12, lineHeight: 17, textAlign: 'center' },
  intlPromptBox: { alignItems: 'center', gap: 6, marginTop: 4 },
  intlPromptText: { fontSize: 11, textAlign: 'center' },
  intlButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  intlButtonText: { fontSize: 11, fontWeight: '800' },
  extResultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  intlBar: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  intlBarText: { fontSize: 10, fontWeight: '700' },
  attribution: { fontSize: 9, lineHeight: 14, marginTop: 10, textAlign: 'center' },
});
