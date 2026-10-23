import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { getProductByBarcode, type Product } from '../services/productService';

export default function ScanScreen() {
  const { colors, isDark } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [searching, setSearching] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [barcodeType, setBarcodeType] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);

  const navigateToProduct = (foundProduct: Product, type: string) => {
    router.push({
      pathname: '/product',
      params: {
        barcode: foundProduct.barcode,
        barcodeType: type,
        productName: foundProduct.productName,
        brand: foundProduct.brand,
        category: foundProduct.category,
        weight: foundProduct.weight || '',
        unit: foundProduct.unit || '',
        imageUrl: foundProduct.imageUrl || '',
        verificationStatus: foundProduct.verificationStatus || '',
        attribution: foundProduct.attribution || '',
      },
    });
  };

  const handleBarcodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned || searching) return;

    setScanned(true);
    setSearching(true);
    setBarcode(data);
    setBarcodeType(type);

    try {
      const foundProduct = await getProductByBarcode(data);
      setProduct(foundProduct);

      if (foundProduct) {
        navigateToProduct(foundProduct, type);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleManualBarcode = async () => {
    const cleanBarcode = manualBarcode.trim();
    if (!cleanBarcode || searching) return;

    setSearching(true);
    setBarcode(cleanBarcode);
    setBarcodeType('MANUAL');
    setScanned(true);

    try {
      const foundProduct = await getProductByBarcode(cleanBarcode);
      setProduct(foundProduct);

      if (foundProduct) {
        navigateToProduct(foundProduct, 'MANUAL');
      }
    } finally {
      setSearching(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setSearching(false);
    setBarcode(null);
    setBarcodeType(null);
    setProduct(null);
    setManualBarcode('');
  };

  // Permission Loading State
  if (!permission) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.centerBox}>
          <View
            style={[
              styles.loadingMark,
              { backgroundColor: isDark ? colors.accent : colors.primaryDark },
            ]}
          >
            <Text
              style={[
                styles.loadingMarkGlyph,
                { color: isDark ? colors.primaryDark : colors.accent },
              ]}
            >
              ⌁
            </Text>
          </View>
          <Text style={[styles.loadingTitle, { color: colors.text }]}>
            Connecting Camera
          </Text>
          <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
            Checking camera permissions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission Required State
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title="Barcode Scanner"
          eyebrow="ShopTrip"
          fallbackRoute="/home"
          backLabel="Back to Home"
        />

        <ScrollView contentContainerStyle={styles.permissionContent}>
          <View
            style={[
              styles.permissionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View
              style={[styles.permissionBadge, { backgroundColor: colors.primaryDark }]}
            >
              <Text style={[styles.permissionBadgeGlyph, { color: colors.accent }]}>
                ⌁
              </Text>
            </View>
            <Text style={[styles.permissionTitle, { color: colors.text }]}>
              Camera Access Required
            </Text>
            <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
              ShopTrip uses your device camera to read product barcodes on grocery shelves and packaging for instant price comparison.
            </Text>

            <Pressable
              style={[
                styles.primaryActionButton,
                { backgroundColor: colors.accent },
              ]}
              onPress={requestPermission}
            >
              <Text
                style={[
                  styles.primaryActionText,
                  { color: colors.accentText },
                ]}
              >
                Allow Camera Access
              </Text>
              <Text
                style={[
                  styles.primaryActionArrow,
                  { color: colors.accentText },
                ]}
              >
                →
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.fallbackCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.fallbackTitle, { color: colors.text }]}>
              Or Enter Barcode Manually
            </Text>
            <Text style={[styles.fallbackDesc, { color: colors.textSecondary }]}>
              You can still compare items without camera access by entering digits manually.
            </Text>
            <View style={styles.manualInputRow}>
              <TextInput
                style={[
                  styles.manualTextInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  },
                ]}
                value={manualBarcode}
                onChangeText={setManualBarcode}
                placeholder="e.g. 8901030974625"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="numeric"
                returnKeyType="search"
                onSubmitEditing={handleManualBarcode}
              />
              <Pressable
                style={[
                  styles.manualSearchButton,
                  { backgroundColor: colors.primaryDark },
                  !manualBarcode.trim() && styles.disabledButton,
                ]}
                onPress={handleManualBarcode}
                disabled={!manualBarcode.trim()}
              >
                <Text style={styles.manualSearchButtonText}>Find</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active Scanner Screen
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Barcode Scanner"
        eyebrow="ShopTrip"
        fallbackRoute="/home"
        backLabel="Back to Home"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CAMERA VIEWPORT */}
        <View style={styles.cameraViewport}>
          <CameraView
            style={styles.camera}
            facing="back"
            zoom={0.45}
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
                'code93',
                'itf14',
                'codabar',
              ],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.targetFrame}>
                <View style={[styles.cornerBracket, styles.topLeftBracket]} />
                <View style={[styles.cornerBracket, styles.topRightBracket]} />
                <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
                <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

                <View style={styles.scanLaser} />
              </View>

              <View style={styles.cameraPill}>
                <Text style={styles.cameraPillText}>ALIGN BARCODE WITHIN FRAME</Text>
              </View>
            </View>
          </CameraView>
        </View>

        {/* SCANNING INSTRUCTIONS CARD */}
        <View
          style={[
            styles.instructionsCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.instructionsHeader}>
            <View
              style={[
                styles.instructionsBadge,
                { backgroundColor: colors.badgeBg },
              ]}
            >
              <Text
                style={[
                  styles.instructionsBadgeGlyph,
                  { color: colors.badgeText },
                ]}
              >
                ℹ
              </Text>
            </View>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Scanning Guide & Best Results
            </Text>
          </View>
          <View style={styles.instructionList}>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>
              • Hold phone steady 15–20 cm away from packaging.
            </Text>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>
              • For small barcodes, center digits inside the guide; 0.45× macro preset will lock focus.
            </Text>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>
              • Ensure barcode is well-lit and avoid glossy glare.
            </Text>
          </View>
        </View>

        {/* SEARCHING / RESULT CARD */}
        {searching && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.searchingText, { color: colors.text }]}>
              Querying database for barcode {barcode}...
            </Text>
          </View>
        )}

        {scanned && !searching && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: colors.card,
                borderColor: product ? colors.primaryDark : colors.border,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: product
                      ? colors.successDot
                      : colors.warningDot,
                  },
                ]}
              />
              <Text style={[styles.resultStatusText, { color: colors.text }]}>
                {product ? 'Product Identified' : 'Barcode Not Found in Database'}
              </Text>
              <Text style={[styles.resultBarcodeDigits, { color: colors.textMuted }]}>
                {barcodeType}: {barcode}
              </Text>
            </View>

            {product ? (
              <View
                style={[
                  styles.productMatchBox,
                  { backgroundColor: colors.cardMuted },
                ]}
              >
                <Text
                  style={[styles.matchedProductName, { color: colors.text }]}
                >
                  {product.productName}
                </Text>
                <Text
                  style={[
                    styles.matchedProductMeta,
                    { color: colors.textSecondary },
                  ]}
                >
                  {product.brand} · {product.category}
                  {product.weight ? ` · ${product.weight} ${product.unit}` : ''}
                </Text>

                <Pressable
                  style={[
                    styles.matchedProceedButton,
                    { backgroundColor: colors.primaryDark },
                  ]}
                  onPress={() =>
                    navigateToProduct(product, barcodeType || 'CAMERA')
                  }
                >
                  <Text style={[styles.matchedProceedText, { color: '#FFFFFF' }]}>
                    Compare Prices
                  </Text>
                  <Text
                    style={[
                      styles.matchedProceedArrow,
                      { color: colors.accent },
                    ]}
                  >
                    →
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.noMatchBox,
                  { backgroundColor: isDark ? '#2D2012' : '#FBF7ED' },
                ]}
              >
                <Text
                  style={[
                    styles.noMatchTitle,
                    { color: isDark ? '#FBBF24' : '#78350F' },
                  ]}
                >
                  Item not in database
                </Text>
                <Text
                  style={[
                    styles.noMatchText,
                    { color: isDark ? '#D97706' : '#92400E' },
                  ]}
                >
                  Barcode {barcode} has not been registered in the ShopTrip database yet. An empty database is normal until products are populated.
                </Text>
              </View>
            )}

            <Pressable style={styles.scanAgainButton} onPress={resetScanner}>
              <Text style={[styles.scanAgainText, { color: colors.chipText }]}>
                Scan Another Item
              </Text>
            </Pressable>
          </View>
        )}

        {/* MANUAL BARCODE ENTRY */}
        <View
          style={[
            styles.manualEntryCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.kicker, { color: colors.textMuted }]}>
            MANUAL ENTRY
          </Text>
          <Text style={[styles.manualSectionTitle, { color: colors.text }]}>
            Barcode not scanning?
          </Text>
          <Text
            style={[
              styles.manualSectionSubtitle,
              { color: colors.textSecondary },
            ]}
          >
            Type the EAN or UPC digits printed under the barcode lines.
          </Text>

          <View style={styles.manualInputRow}>
            <TextInput
              style={[
                styles.manualTextInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                },
              ]}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="e.g. 8901030974625"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="numeric"
              returnKeyType="search"
              onSubmitEditing={handleManualBarcode}
            />
            <Pressable
              style={[
                styles.manualSearchButton,
                { backgroundColor: colors.primaryDark },
                (!manualBarcode.trim() || searching) && styles.disabledButton,
              ]}
              onPress={handleManualBarcode}
              disabled={!manualBarcode.trim() || searching}
            >
              <Text style={styles.manualSearchButtonText}>Look up</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.footerNote, { color: colors.textMuted }]}>
          Barcode scanner uses device camera hardware · Connected to ShopTrip database API
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loadingMark: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingMarkGlyph: { fontSize: 32, fontWeight: '700', marginTop: -3 },
  loadingTitle: { fontSize: 18, fontWeight: '800' },
  loadingSubtitle: { fontSize: 12, marginTop: 4 },
  permissionContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  permissionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  permissionBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionBadgeGlyph: { fontSize: 30, fontWeight: '700', marginTop: -2 },
  permissionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    maxWidth: 290,
  },
  primaryActionButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  primaryActionText: { fontSize: 14, fontWeight: '800' },
  primaryActionArrow: { fontSize: 18, fontWeight: '700' },
  fallbackCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  fallbackTitle: { fontSize: 15, fontWeight: '800' },
  fallbackDesc: { fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 14 },
  cameraViewport: {
    height: 320,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#142720',
    borderWidth: 1.5,
    borderColor: '#1D4438',
  },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 28, 22, 0.45)',
  },
  targetFrame: {
    width: 250,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBracket: { position: 'absolute', width: 26, height: 26, borderColor: '#D8F28A' },
  topLeftBracket: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 6,
  },
  topRightBracket: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 6,
  },
  bottomLeftBracket: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 6,
  },
  bottomRightBracket: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 6,
  },
  scanLaser: { width: '90%', height: 1.5, backgroundColor: '#D8F28A', opacity: 0.8 },
  cameraPill: {
    marginTop: 18,
    backgroundColor: 'rgba(23, 56, 45, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cameraPillText: { color: '#D8F28A', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  instructionsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 14,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  instructionsBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsBadgeGlyph: { fontSize: 12, fontWeight: '900' },
  instructionsTitle: { fontSize: 13, fontWeight: '800' },
  instructionList: { gap: 4 },
  instructionItem: { fontSize: 11, lineHeight: 16 },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginTop: 14,
    gap: 10,
  },
  searchingText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  resultStatusText: { fontSize: 13, fontWeight: '800' },
  resultBarcodeDigits: { fontSize: 11, marginLeft: 'auto' },
  productMatchBox: { borderRadius: 12, padding: 12 },
  matchedProductName: { fontSize: 15, fontWeight: '800' },
  matchedProductMeta: { fontSize: 11, marginTop: 2, marginBottom: 12 },
  matchedProceedButton: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchedProceedText: { fontSize: 12, fontWeight: '800' },
  matchedProceedArrow: { fontSize: 16, fontWeight: '700' },
  noMatchBox: { borderRadius: 12, padding: 12 },
  noMatchTitle: { fontSize: 13, fontWeight: '800' },
  noMatchText: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  scanAgainButton: { marginTop: 4, alignItems: 'center', paddingVertical: 8 },
  scanAgainText: { fontSize: 12, fontWeight: '800' },
  manualEntryCard: { borderRadius: 20, borderWidth: 1, padding: 18, marginTop: 14 },
  kicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  manualSectionTitle: { fontSize: 16, fontWeight: '800' },
  manualSectionSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 3, marginBottom: 14 },
  manualInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  manualTextInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  manualSearchButton: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6 },
  manualSearchButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  footerNote: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 22,
    paddingHorizontal: 20,
  },
});
