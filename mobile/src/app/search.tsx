import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchProducts, type Product } from '../services/productService';

const suggestions = ['Coffee', 'Knorr', 'BRU'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchProducts(query), [query]);

  const openProduct = (product: Product) => {
    Keyboard.dismiss();
    router.push({ pathname: '/product', params: product });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.nav}>
        <Pressable accessibilityLabel="Back to trip" style={styles.backButton} onPress={() => router.replace('/trip')}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View><Text style={styles.navEyebrow}>SHOPTRIP</Text><Text style={styles.navTitle}>Find a product</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.lede}>Search your item first. Then compare the available options in one calm view.</Text>
        <View style={styles.searchShell}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={Keyboard.dismiss}
            style={styles.input}
            placeholder="Search brand, product, or barcode"
            placeholderTextColor="#829087"
          />
          {query.length > 0 && <Pressable style={styles.clear} onPress={() => setQuery('')}><Text style={styles.clearText}>×</Text></Pressable>}
        </View>

        {query.trim().length === 0 ? (
          <View>
            <Text style={styles.kicker}>QUICK START</Text>
            <View style={styles.suggestionRow}>
              {suggestions.map((suggestion) => (
                <Pressable key={suggestion} style={styles.suggestion} onPress={() => setQuery(suggestion)}>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.emptyCard}>
              <View style={styles.emptyMark}><Text style={styles.emptyMarkText}>⌕</Text></View>
              <Text style={styles.emptyTitle}>Search before you scan</Text>
              <Text style={styles.emptyText}>Type a product name, brand, or its barcode to see matching items.</Text>
              <Pressable style={styles.scanCta} onPress={() => router.push('/scan')}>
                <Text style={styles.scanCtaText}>Use barcode scanner</Text><Text style={styles.scanCtaArrow}>→</Text>
              </Pressable>
            </View>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyMark}><Text style={styles.emptyMarkText}>?</Text></View>
            <Text style={styles.emptyTitle}>No matching product yet</Text>
            <Text style={styles.emptyText}>Try a different name or barcode. The live catalogue connection comes next.</Text>
            <Pressable style={styles.scanCta} onPress={() => router.push('/scan')}>
              <Text style={styles.scanCtaText}>Try barcode scanner</Text><Text style={styles.scanCtaArrow}>→</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View style={styles.resultHeader}>
              <Text style={styles.kicker}>MATCHES</Text>
              <Text style={styles.count}>{results.length} {results.length === 1 ? 'result' : 'results'}</Text>
            </View>
            <View style={styles.list}>
              {results.map((product) => <ProductResult key={product.barcode} product={product} onPress={() => openProduct(product)} />)}
            </View>
          </View>
        )}
        <Text style={styles.footer}>ShopTrip currently searches its curated demo catalogue.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductResult({ product, onPress }: { product: Product; onPress: () => void }) {
  const categoryGlyph = product.category === 'Coffee' ? 'C' : product.category === 'Instant Soup' ? 'S' : 'P';
  return (
    <Pressable style={styles.resultCard} onPress={onPress}>
      <View style={styles.productTile}><Text style={styles.productTileText}>{categoryGlyph}</Text></View>
      <View style={styles.productCopy}>
        <Text style={styles.productName}>{product.productName}</Text>
        <Text style={styles.productBrand}>{product.brand} · {product.category}</Text>
        <Text style={styles.productMeta}>{product.weight ? `${product.weight} ${product.unit} · ` : ''}{product.barcode}</Text>
      </View>
      <Text style={styles.resultArrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7F3' },
  nav: { height: 75, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderBottomColor: '#E2E5DD' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E8EDE2', alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#1D4438', fontSize: 19, fontWeight: '700' },
  navEyebrow: { color: '#718177', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  navTitle: { color: '#163027', fontSize: 19, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  content: { padding: 20, paddingBottom: 42 },
  lede: { color: '#65756C', fontSize: 13, lineHeight: 19, marginBottom: 21, maxWidth: 310 },
  searchShell: { height: 57, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD8C8', borderRadius: 17, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#17382D', shadowOpacity: 0.04, shadowRadius: 9, elevation: 1 },
  searchGlyph: { color: '#315745', fontSize: 29, marginRight: 9, marginTop: -4 },
  input: { flex: 1, height: 56, color: '#18372D', fontSize: 14, fontWeight: '600', outlineStyle: 'none' } as any,
  clear: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#E8EDE2', justifyContent: 'center', alignItems: 'center' },
  clearText: { color: '#51645A', fontSize: 20, lineHeight: 22 },
  kicker: { color: '#718177', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 27, marginBottom: 11 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestion: { backgroundColor: '#E8EDE2', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  suggestionText: { color: '#315745', fontSize: 12, fontWeight: '700' },
  emptyCard: { backgroundColor: '#17382D', borderRadius: 23, marginTop: 22, padding: 23, minHeight: 270 },
  emptyMark: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#2A594A', justifyContent: 'center', alignItems: 'center' },
  emptyMarkText: { color: '#D8F28A', fontSize: 27, marginTop: -4 },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginTop: 21 },
  emptyText: { color: '#BED0C4', fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 260 },
  scanCta: { backgroundColor: '#D8F28A', height: 46, borderRadius: 13, marginTop: 22, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanCtaText: { color: '#17382D', fontWeight: '800', fontSize: 12 },
  scanCtaArrow: { color: '#17382D', fontWeight: '800', fontSize: 19 },
  resultHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  count: { color: '#75847A', fontSize: 10, fontWeight: '700' },
  list: { gap: 10 },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E1E6DC', padding: 14, flexDirection: 'row', alignItems: 'center' },
  productTile: { width: 47, height: 47, borderRadius: 15, backgroundColor: '#EAF1DC', justifyContent: 'center', alignItems: 'center' },
  productTileText: { color: '#315745', fontSize: 17, fontWeight: '800' },
  productCopy: { flex: 1, marginLeft: 12 },
  productName: { color: '#18372D', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  productBrand: { color: '#65756C', fontSize: 10, marginTop: 3 },
  productMeta: { color: '#9AA49D', fontSize: 9, marginTop: 5 },
  resultArrow: { color: '#315745', fontSize: 19, marginLeft: 8 },
  footer: { color: '#8A958D', fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 25, paddingHorizontal: 22 },
});
