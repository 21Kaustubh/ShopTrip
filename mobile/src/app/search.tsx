import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle, useAppTheme } from '../context/ThemeContext';
import { searchProducts, type Product } from '../services/productService';

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

export default function SearchScreen() {
  const { colors, isDark } = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchProducts(clean);
        if (active) {
          setResults(data);
        }
      } catch (err) {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const openProduct = (product: Product) => {
    Keyboard.dismiss();
    router.push({ pathname: '/product', params: product });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.nav, { borderBottomColor: colors.border, backgroundColor: colors.topbarBg }]}>
        <Pressable
          accessibilityLabel="Back to trip"
          style={[styles.backButton, { backgroundColor: colors.chipBg }]}
          onPress={() => router.replace('/trip')}
        >
          <Text style={[styles.backArrow, { color: colors.chipText }]}>←</Text>
        </Pressable>
        <View style={styles.navTitleBox}>
          <Text style={[styles.navEyebrow, { color: colors.textMuted }]}>SHOPTRIP</Text>
          <Text style={[styles.navTitle, { color: colors.text }]}>Find a product</Text>
        </View>
        <ThemeToggle />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lede, { color: colors.textSecondary }]}>
          Search database by product name, brand, or barcode digits.
        </Text>

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
            >
              <Text style={[styles.clearText, { color: colors.textSecondary }]}>×</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={isDark ? colors.accent : colors.primaryDark} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Searching database...
            </Text>
          </View>
        ) : query.trim().length === 0 ? (
          <View>
            <Text style={[styles.kicker, { color: colors.textMuted }]}>QUICK SEARCH</Text>
            <View style={styles.suggestionRow}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={[styles.suggestion, { backgroundColor: colors.chipBg }]}
                  onPress={() => setQuery(suggestion)}
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
              <Pressable
                style={[styles.scanCta, { backgroundColor: colors.accent }]}
                onPress={() => router.push('/scan')}
              >
                <Text style={[styles.scanCtaText, { color: colors.accentText }]}>Use barcode scanner</Text>
                <Text style={[styles.scanCtaArrow, { color: colors.accentText }]}>→</Text>
              </Pressable>
            </View>
          </View>
        ) : results.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#14201A' : colors.primaryDark }]}>
            <View style={[styles.emptyMark, { backgroundColor: isDark ? '#22352B' : '#2A594A' }]}>
              <Text style={[styles.emptyMarkText, { color: colors.accent }]}>?</Text>
            </View>
            <Text style={styles.emptyTitle}>No matching products found</Text>
            <Text style={styles.emptyText}>
              No items matching "{query}" were found in the database. You can try a different search or scan a barcode directly.
            </Text>
            <Pressable
              style={[styles.scanCta, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/scan')}
            >
              <Text style={[styles.scanCtaText, { color: colors.accentText }]}>Try barcode scanner</Text>
              <Text style={[styles.scanCtaArrow, { color: colors.accentText }]}>→</Text>
            </Pressable>
          </View>
        ) : (
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
        )}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Queries verified product entries stored in the database.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductResult({
  product,
  colors,
  onPress,
}: {
  product: Product;
  colors: any;
  onPress: () => void;
}) {
  const categoryGlyph = getCategoryGlyph(product.category);
  return (
    <Pressable
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={onPress}
    >
      <View style={[styles.productTile, { backgroundColor: colors.badgeBg }]}>
        <Text style={[styles.productTileText, { color: colors.badgeText }]}>{categoryGlyph}</Text>
      </View>
      <View style={styles.productCopy}>
        <Text style={[styles.productName, { color: colors.text }]}>{product.productName}</Text>
        <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
          {product.brand} · {product.category}
        </Text>
        <Text style={[styles.productMeta, { color: colors.textMuted }]}>
          {product.weight ? `${product.weight} ${product.unit} · ` : ''}
          {product.barcode}
        </Text>
      </View>
      <Text style={[styles.resultArrow, { color: colors.textSecondary }]}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  nav: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 19, fontWeight: '700' },
  navTitleBox: { flex: 1, marginLeft: 13 },
  navEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  navTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  content: { padding: 20, paddingBottom: 42 },
  lede: { fontSize: 13, lineHeight: 19, marginBottom: 18, maxWidth: 310 },
  searchShell: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchGlyph: { fontSize: 28, marginRight: 10, marginTop: -3 },
  input: { flex: 1, height: 54, fontSize: 14, fontWeight: '600', outlineStyle: 'none' } as any,
  clear: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  clearText: { fontSize: 18, lineHeight: 20 },
  loadingContainer: { marginTop: 32, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 12, fontWeight: '600' },
  kicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 24, marginBottom: 10 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestion: { borderRadius: 14, paddingHorizontal: 13, paddingVertical: 8 },
  suggestionText: { fontSize: 12, fontWeight: '700' },
  emptyCard: { borderRadius: 22, marginTop: 20, padding: 22, minHeight: 250 },
  emptyMark: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  emptyMarkText: { fontSize: 26, marginTop: -3 },
  emptyTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', letterSpacing: -0.4, marginTop: 18 },
  emptyText: { color: '#BED0C4', fontSize: 12, lineHeight: 18, marginTop: 6, maxWidth: 280 },
  scanCta: { height: 46, borderRadius: 13, marginTop: 20, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanCtaText: { fontWeight: '800', fontSize: 12 },
  scanCtaArrow: { fontWeight: '800', fontSize: 18 },
  resultHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  count: { fontSize: 11, fontWeight: '700' },
  list: { gap: 10 },
  resultCard: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  productTile: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  productTileText: { fontSize: 16, fontWeight: '800' },
  productCopy: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 13, fontWeight: '800', lineHeight: 18 },
  productBrand: { fontSize: 11, marginTop: 3 },
  productMeta: { fontSize: 10, marginTop: 4 },
  resultArrow: { fontSize: 18, marginLeft: 8 },
  footer: { fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 26, paddingHorizontal: 20 },
});
