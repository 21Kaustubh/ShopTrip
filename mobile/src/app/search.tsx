import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    searchProducts,
    type Product,
} from '../services/productService';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    return searchProducts(query);
  }, [query]);

  const openProduct = (product: Product) => {
    Keyboard.dismiss();

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

  /*
   * KEYBOARD SEARCH ACTION
   *
   * Pressing Enter / Search on the keyboard
   * immediately closes the keyboard.
   *
   * Results are already updated automatically
   * while the user types.
   */
  const handleSearchSubmit = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/trip')}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSmall}>
            SHOPTRIP
          </Text>

          <Text style={styles.headerTitle}>
            Search Product
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SEARCH */}

        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>
            FIND A PRODUCT
          </Text>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>
              🔍
            </Text>

            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search product, brand or barcode..."
              placeholderTextColor="#85868d"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}

              /*
               * KEYBOARD ACTION
               */
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />

            {query.length > 0 && (
              <Pressable
                style={styles.clearButton}
                onPress={() => {
                  setQuery('');
                }}
              >
                <Text style={styles.clearText}>
                  ×
                </Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.searchHint}>
            Press Enter to search. Try "Knorr", "Coffee",
            "BRU", or a barcode.
          </Text>
        </View>

        {/* ========================= */}
        {/* RESULTS */}
        {/* ========================= */}

        {query.trim().length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>
              🔎
            </Text>

            <Text style={styles.emptyTitle}>
              Search for a product
            </Text>

            <Text style={styles.emptyDescription}>
              Find a product without scanning its barcode.
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>
              😕
            </Text>

            <Text style={styles.emptyTitle}>
              No products found
            </Text>

            <Text style={styles.emptyDescription}>
              Try another product name, brand, category,
              or barcode.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.resultsTitle}>
              Search Results
            </Text>

            <Text style={styles.resultsCount}>
              {results.length}{' '}
              {results.length === 1
                ? 'product'
                : 'products'}{' '}
              found
            </Text>

            <View style={styles.resultsList}>
              {results.map((product) => (
                <Pressable
                  key={product.barcode}
                  style={styles.productCard}
                  onPress={() => openProduct(product)}
                >
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

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {product.productName}
                    </Text>

                    <Text style={styles.productBrand}>
                      {product.brand}
                    </Text>

                    <View style={styles.badges}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {product.category}
                        </Text>
                      </View>

                      {product.weight && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {product.weight}{' '}
                            {product.unit}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.barcodeText}>
                      Barcode: {product.barcode}
                    </Text>
                  </View>

                  <Text style={styles.resultArrow}>
                    ›
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ========================= */}
        {/* SCAN OPTION */}
        {/* ========================= */}

        <View style={styles.scanSection}>
          <Text style={styles.orText}>
            Prefer scanning?
          </Text>

          <Pressable
            style={styles.scanButton}
            onPress={() => {
              Keyboard.dismiss();
              router.push('/scan');
            }}
          >
            <Text style={styles.scanButtonText}>
              📷 Scan a Barcode
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

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

  searchCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  searchLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#85868d',
    letterSpacing: 1,
    marginBottom: 9,
  },

  searchBox: {
    height: 54,
    borderWidth: 1,
    borderColor: '#d7d8dc',
    borderRadius: 12,
    backgroundColor: '#f8f8fa',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 19,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    height: 52,
    fontSize: 14,
    fontWeight: '600',
    color: '#111217',
    outlineStyle: 'none',
  } as any,

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dedee1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    fontSize: 20,
    lineHeight: 22,
    color: '#55565d',
  },

  searchHint: {
    marginTop: 8,
    fontSize: 10,
    color: '#85868d',
  },

  resultsTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111217',
  },

  resultsCount: {
    marginTop: 3,
    marginBottom: 10,
    fontSize: 10,
    color: '#777982',
  },

  resultsList: {
    gap: 10,
  },

  productCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e4',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productIconText: {
    fontSize: 25,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
  },

  productName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111217',
    lineHeight: 19,
  },

  productBrand: {
    marginTop: 2,
    fontSize: 10,
    color: '#777982',
    fontWeight: '700',
  },

  badges: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 7,
  },

  badge: {
    backgroundColor: '#f0f0f2',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#55565d',
  },

  barcodeText: {
    marginTop: 6,
    fontSize: 8,
    color: '#999aa0',
  },

  resultArrow: {
    fontSize: 27,
    color: '#777982',
    marginLeft: 8,
  },

  emptyState: {
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
    fontSize: 34,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 15,
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

  scanSection: {
    marginTop: 24,
    alignItems: 'center',
  },

  orText: {
    fontSize: 10,
    color: '#85868d',
    marginBottom: 9,
  },

  scanButton: {
    backgroundColor: '#111217',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  scanButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});