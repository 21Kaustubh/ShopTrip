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

  const productName = params.productName || 'Unknown Product';
  const brand = params.brand || 'Unknown Brand';
  const category = params.category || 'Other';
  const weight = params.weight || '';
  const unit = params.unit || '';

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
              {params.barcode || 'Not available'}
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
              Example: Enter 75 if the product costs ₹75 at
              your store.
            </Text>
          </View>

          {/* Price Saved */}
          {priceSaved ? (
            <View style={styles.savedCard}>
              <View style={styles.savedIcon}>
                <Text style={styles.savedIconText}>✓</Text>
              </View>

              <View style={styles.savedContent}>
                <Text style={styles.savedTitle}>
                  Store price saved
                </Text>

                <Text style={styles.savedText}>
                  ShopTrip recorded ₹{storePrice} as the current
                  store price.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !storePrice.trim() && styles.continueButtonDisabled,
            ]}
            onPress={handleSavePrice}
            disabled={!storePrice.trim()}
          >
            <Text style={styles.continueButtonText}>
              {priceSaved
                ? 'Store Price Saved ✓'
                : 'Save Store Price'}
            </Text>
          </TouchableOpacity>

          {/* Coming Next */}
          <View style={styles.nextCard}>
            <Text style={styles.nextIcon}>💰</Text>

            <View style={styles.nextContent}>
              <Text style={styles.nextTitle}>
                Next: Compare Prices
              </Text>

              <Text style={styles.nextText}>
                ShopTrip will compare this store price with
                online prices and calculate your potential
                savings.
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

  savedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  savedIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111318',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  savedIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  savedContent: {
    flex: 1,
  },

  savedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111318',
  },

  savedText: {
    fontSize: 11,
    color: '#70757D',
    marginTop: 3,
    lineHeight: 16,
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