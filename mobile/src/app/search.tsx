import { router } from 'expo-router';
import React, { useEffect, useReducer } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { useAppTheme } from '../context/ThemeContext';
import {
  searchProducts,
  searchExternalCatalogue,
  getProductByBarcode,
  type Product,
  type CatalogueSearchResponse,
} from '../services/productService';

const SUGGESTIONS = ['Coffee', 'Tea', 'Atta', 'Rice', 'Butter', 'Noodles', 'Soap'];

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

  const [query, setQuery] = useReducer((_: string, next: string) => next, '');
  const [{ loading, results }, dispatch] = useReducer(localReducer, { loading: false, results: [] });
  const [ext, dispatchExt] = useReducer(extReducer, initialExtState);

  // Debounced local search — no direct setState in effect body
  useEffect(() => {
    const clean = query.trim();
    if (!clean) return;

    // Reset external results whenever search text changes
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
    // Hit the barcode endpoint so the backend upserts it into Neon
    const verified = await getProductByBarcode(product.barcode);
    const toOpen = verified ?? product;
    router.push({ pathname: '/product', params: toOpen });
  };

  const openProduct = (product: Product) => {
    Keyboard.dismiss();
    router.push({ pathname: '/product', params: product });
  };

  const isQueryEmpty = query.trim().length === 0;
  const localEmpty = !loading && !isQueryEmpty && results.length === 0 && ext.status === 'idle';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Find a Product"
        eyebrow="ShopTrip"
        fallbackRoute="/home"
        backLabel="Back to Home"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lede, { color: colors.textSecondary }]}>
          Search database by product name, brand, or barcode digits.
        </Text>

        {/* SEARCH INPUT */}
        <View style={[styles.searchShell, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
          <Text style={[styles.searchGlyph, { color: isDark ? colors.accent : colors.primaryDark }]}>⌕</Text>
          <TextInput
            autoFocus
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
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching database...</Text>
          </View>

        /* ── EMPTY QUERY: suggestions ── */
        ) : isQueryEmpty ? (
          <View>
            <Text style={[styles.kicker, { color: colors.textMuted }]}>QUICK SEARCH</Text>
            <View style={styles.suggestionRow}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={[styles.suggestion, { backgroundColor: colors.chipBg }]}
                  onPress={() => setQuery(suggestion)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.suggestionText, { color: colors.chipText }]}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.emptyCard, { backgroundColor: isDark ? '#14201A' : colors.primaryDark }]}>
              <View style={[styles.emptyMark, { backgroundColor: isDark ? '#22352B' : '#2A594A' }]}>
                <Text style={[styles.emptyMarkText, { color: colors.accent }]}>⌕</Text>
              </View>
              <Text style={styles.emptyTitle}>Search before you scan</Text>
              <Text style={styles.emptyText}>
                Type an item name, brand, or its barcode number to see matching records from the database.
              </Text>
              <Pressable style={[styles.scanCta, { backgroundColor: colors.accent }]} onPress={() => router.push('/scan')}>
                <Text style={[styles.scanCtaText, { color: colors.accentText }]}>Use barcode scanner</Text>
                <Text style={[styles.scanCtaArrow, { color: colors.accentText }]}>→</Text>
              </Pressable>
            </View>
          </View>

        /* ── LOCAL RESULTS ── */
        ) : results.length > 0 ? (
          <View>
            <View style={styles.resultHeader}>
              <Text style={[styles.kicker, { color: colors.textMuted }]}>DATABASE MATCHES</Text>
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {results.length} {results.length === 1 ? 'result' : 'results'}
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

        /* ── LOCAL EMPTY + EXTERNAL PANEL ── */
        ) : (
          <View>
            {/* Not-found card */}
            <View style={[styles.emptyCard, { backgroundColor: isDark ? '#14201A' : colors.primaryDark }]}>
              <View style={[styles.emptyMark, { backgroundColor: isDark ? '#22352B' : '#2A594A' }]}>
                <Text style={[styles.emptyMarkText, { color: colors.accent }]}>?</Text>
              </View>
              <Text style={styles.emptyTitle}>No matching products in database</Text>
              <Text style={styles.emptyText}>
                No items matching &quot;{query}&quot; were found in your local database.
              </Text>

              <View style={styles.emptyActionsRow}>
                <Pressable style={[styles.emptyResetBtn, { backgroundColor: colors.chipBg }]} onPress={() => setQuery('')}>
                  <Text style={[styles.emptyResetText, { color: colors.chipText }]}>Clear Search</Text>
                </Pressable>
                <Pressable style={[styles.scanCta, { backgroundColor: colors.accent }]} onPress={() => router.push('/scan')}>
                  <Text style={[styles.scanCtaText, { color: colors.accentText }]}>Try barcode scanner</Text>
                  <Text style={[styles.scanCtaArrow, { color: colors.accentText }]}>→</Text>
                </Pressable>
              </View>
            </View>

            {/* External catalogue section — India-First Discovery */}
            <View style={[styles.extPanel, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.extHeaderRow}>
                <View style={styles.extTitleBlock}>
                  <Text style={[styles.extKicker, { color: colors.textMuted }]}>OPEN FOOD FACTS · INDIA FIRST</Text>
                  <Text style={[styles.extTitle, { color: colors.text }]}>Search wider catalogue</Text>
                </View>
                <View style={[styles.marketPill, { backgroundColor: colors.badgeBg }]}>
                  <Text style={[styles.marketPillText, { color: colors.badgeText }]}>🇮🇳 India Grocery</Text>
                </View>
              </View>

              <Text style={[styles.extDesc, { color: colors.textSecondary }]}>
                Discovers real Indian grocery records with verified package sizes, brands and barcodes.
                Selecting an item imports it directly into your trip.
              </Text>

              {/* State: idle */}
              {ext.status === 'idle' && localEmpty && (
                <Pressable
                  style={[styles.extButton, { backgroundColor: isDark ? '#1C2C24' : colors.primaryDark }]}
                  onPress={() => searchExternal(false)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.extButtonText, { color: isDark ? colors.accent : '#FFFFFF' }]}>
                    Search Indian catalogue for &quot;{query}&quot;
                  </Text>
                  <Text style={[styles.extButtonArrow, { color: isDark ? colors.accent : colors.accent }]}>→</Text>
                </Pressable>
              )}

              {/* State: loading */}
              {ext.status === 'loading' && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={isDark ? colors.accent : colors.primaryDark} />
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
                  {ext.hasInternationalAvailable && ext.internationalCount > 0 && !ext.includeInternational && (
                    <View style={styles.intlPromptBox}>
                      <Text style={[styles.intlPromptText, { color: colors.textMuted }]}>
                        {ext.internationalCount} international product records are available.
                      </Text>
                      <Pressable
                        style={[styles.intlButton, { backgroundColor: colors.chipBg }]}
                        onPress={() => searchExternal(true)}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.intlButtonText, { color: colors.chipText }]}>
                          Include {ext.internationalCount} international results
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* State: done with results */}
              {ext.status === 'done' && ext.results.length > 0 && (
                <View>
                  <View style={styles.resultHeader}>
                    <Text style={[styles.kicker, { color: colors.textMuted }]}>
                      {ext.includeInternational ? 'ALL CATALOGUE MATCHES' : 'INDIAN CATALOGUE RESULTS'}
                    </Text>
                    <Text style={[styles.count, { color: colors.textSecondary }]}>
                      {ext.results.length} {ext.results.length === 1 ? 'product' : 'products'}
                    </Text>
                  </View>

                  {/* Toggle button to include international when available */}
                  {!ext.includeInternational && ext.hasInternationalAvailable && ext.internationalCount > 0 && (
                    <Pressable
                      style={[styles.intlBar, { backgroundColor: colors.chipBg }]}
                      onPress={() => searchExternal(true)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.intlBarText, { color: colors.chipText }]}>
                        + Show {ext.internationalCount} international results
                      </Text>
                    </Pressable>
                  )}

                  {ext.includeInternational && (
                    <Pressable
                      style={[styles.intlBar, { backgroundColor: colors.chipBg }]}
                      onPress={() => searchExternal(false)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.intlBarText, { color: colors.chipText }]}>
                        Show India-market only ({ext.indiaCount})
                      </Text>
                    </Pressable>
                  )}

                  <View style={styles.list}>
                    {ext.results.map((product) => (
                      <ProductResult
                        key={product.barcode}
                        product={product}
                        colors={colors}
                        isExternal
                        onPress={() => openExternalProduct(product)}
                      />
                    ))}
                  </View>

                  {ext.attribution && (
                    <Text style={[styles.attribution, { color: colors.textMuted }]}>
                      {ext.attribution}
                    </Text>
                  )}
                </View>
              )}

              {/* State: error */}
              {ext.status === 'error' && (
                <View>
                  <Text style={[styles.extNotFound, { color: colors.textSecondary }]}>
                    Open Food Facts could not be reached. Check your connection and try again.
                  </Text>
                  <Pressable
                    style={[styles.emptyResetBtn, { backgroundColor: colors.chipBg, marginTop: 8 }]}
                    onPress={() => searchExternal(false)}
                  >
                    <Text style={[styles.emptyResetText, { color: colors.chipText }]}>Retry</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Queries verified product entries stored in the database.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ProductResult ────────────────────────────────────────────────────────────

function ProductResult({
  product,
  colors,
  onPress,
  isExternal = false,
}: {
  product: Product;
  colors: any;
  onPress: () => void;
  isExternal?: boolean;
}) {
  const glyph = getCategoryGlyph(product.category);
  const isIndiaConfirmed = product.marketAvailability === 'india_confirmed';
  const isIndiaLikely = product.marketAvailability === 'india_likely';
  const isInternational = product.marketAvailability === 'international';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${product.productName} by ${product.brand}`}
    >
      <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
        <Text style={[styles.glyph, { color: colors.badgeText }]}>{glyph}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
            {product.productName}
          </Text>
        </View>

        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {product.brand} • {product.sizeInfo || product.weight || 'Standard'}
        </Text>

        <Text style={[styles.barcode, { color: colors.textMuted }]}>Barcode: {product.barcode}</Text>

        {isExternal && (
          <View style={styles.badgeRow}>
            {product.marketBadge && (
              <View
                style={[
                  styles.tagPill,
                  isIndiaConfirmed && { backgroundColor: '#1C382B' },
                  isIndiaLikely && { backgroundColor: '#21332A' },
                  isInternational && { backgroundColor: colors.chipBg },
                ]}
              >
                <Text
                  style={[
                    styles.tagPillText,
                    isIndiaConfirmed && { color: '#88E3B6' },
                    isIndiaLikely && { color: '#B5DFC7' },
                    isInternational && { color: colors.textMuted },
                  ]}
                >
                  {product.marketBadge}
                </Text>
              </View>
            )}
            <Text style={[styles.extBadge, { color: colors.textMuted }]}>Tap to import</Text>
          </View>
        )}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  lede: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  searchShell: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchGlyph: { fontSize: 22, marginRight: 10, marginTop: -2 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  clear: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 18, fontWeight: '700', marginTop: -2 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 13 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 0.9, marginBottom: 10 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  suggestion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  suggestionText: { fontSize: 12, fontWeight: '800' },
  emptyCard: { borderRadius: 22, padding: 24, alignItems: 'center', marginTop: 8 },
  emptyMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyMarkText: { fontSize: 24, fontWeight: '700' },
  emptyTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyText: { color: '#BED0C4', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 340, marginBottom: 20 },
  emptyActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  emptyResetBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  emptyResetText: { fontSize: 13, fontWeight: '800' },
  scanCta: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanCtaText: { fontSize: 13, fontWeight: '800' },
  scanCtaArrow: { fontSize: 16, fontWeight: '700' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  count: { fontSize: 11, fontWeight: '700' },
  list: { gap: 10 },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 18, fontWeight: '800' },
  details: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, flex: 1 },
  meta: { fontSize: 12, marginTop: 2 },
  barcode: { fontSize: 10, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  tagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagPillText: { fontSize: 9, fontWeight: '800' },
  extBadge: { fontSize: 9, fontWeight: '600', letterSpacing: 0.2 },
  cardRight: { paddingLeft: 10 },
  chevron: { fontSize: 18, fontWeight: '700' },
  // External catalogue panel
  extPanel: { borderRadius: 20, borderWidth: 1, padding: 18, marginTop: 16 },
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
  noMatchBox: { paddingVertical: 12, gap: 10 },
  extNotFound: { fontSize: 12, lineHeight: 17, textAlign: 'center' },
  intlPromptBox: { alignItems: 'center', gap: 8, marginTop: 4 },
  intlPromptText: { fontSize: 11, textAlign: 'center' },
  intlButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  intlButtonText: { fontSize: 12, fontWeight: '800' },
  intlBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  intlBarText: { fontSize: 11, fontWeight: '800' },
  attribution: { fontSize: 10, lineHeight: 15, marginTop: 12, textAlign: 'center' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 28 },
});
