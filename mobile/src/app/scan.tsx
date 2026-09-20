import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProductByBarcode } from '../services/productService';

export default function ScanScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [barcodeType, setBarcodeType] =
    useState<string | null>(null);

  const [manualBarcode, setManualBarcode] = useState('');

  const [product, setProduct] = useState<
    ReturnType<typeof getProductByBarcode>
  >(null);

  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;

    setScanned(true);
    setBarcode(data);
    setBarcodeType(type);

    const foundProduct = getProductByBarcode(data);

    setProduct(foundProduct);

    if (foundProduct) {
      router.push({
        pathname: '/product',
        params: {
          barcode: foundProduct.barcode,
          barcodeType: type,
          productName: foundProduct.productName,
          brand: foundProduct.brand,
          category: foundProduct.category,
          weight: foundProduct.weight,
          unit: foundProduct.unit,
        },
      });
    }
  };

  const handleManualBarcode = () => {
    const cleanBarcode = manualBarcode.trim();

    if (!cleanBarcode) return;

    const foundProduct =
      getProductByBarcode(cleanBarcode);

    if (!foundProduct) {
      setBarcode(cleanBarcode);
      setBarcodeType('MANUAL');
      setScanned(true);
      setProduct(null);
      return;
    }

    setBarcode(cleanBarcode);
    setBarcodeType('MANUAL');
    setProduct(foundProduct);
    setScanned(true);

    router.push({
      pathname: '/product',
      params: {
        barcode: foundProduct.barcode,
        barcodeType: 'MANUAL',
        productName: foundProduct.productName,
        brand: foundProduct.brand,
        category: foundProduct.category,
        weight: foundProduct.weight,
        unit: foundProduct.unit,
      },
    });
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>
            Checking camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>

          <Text style={styles.permissionTitle}>
            Camera Permission Required
          </Text>

          <Text style={styles.permissionText}>
            ShopTrip needs camera access to scan product
            barcodes.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
          >
            <Text style={styles.primaryButtonText}>
              Allow Camera Access
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/trip')}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.replace('/trip')}
        >
          <Text style={styles.headerBackText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Scan Product
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* CAMERA */}
      <View style={styles.scannerContainer}>
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
          onBarcodeScanned={
            scanned ? undefined : handleBarcodeScanned
          }
        >
          <View style={styles.overlay}>
            <View style={styles.scanBox}>
              <View
                style={[
                  styles.corner,
                  styles.topLeft,
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.topRight,
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.bottomLeft,
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.bottomRight,
                ]}
              />
            </View>

            <Text style={styles.scanInstruction}>
              Move the barcode inside the box
            </Text>

            <Text style={styles.zoomHint}>
              🔍 Zoom enabled for small barcodes
            </Text>
          </View>
        </CameraView>
      </View>

      {/* MANUAL BARCODE */}
      {!scanned && (
        <View style={styles.manualContainer}>
          <Text style={styles.manualTitle}>
            Barcode not scanning?
          </Text>

          <Text style={styles.manualSubtitle}>
            Enter the barcode number manually.
          </Text>

          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="e.g. 8909106048553"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={14}
            />

            <TouchableOpacity
              style={[
                styles.manualButton,
                !manualBarcode.trim() &&
                  styles.manualButtonDisabled,
              ]}
              onPress={handleManualBarcode}
              disabled={!manualBarcode.trim()}
            >
              <Text style={styles.manualButtonText}>
                Find
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* INFORMATION */}
      {!scanned && (
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomIcon}>🛒</Text>

          <Text style={styles.bottomTitle}>
            Scan any product barcode
          </Text>

          <Text style={styles.bottomText}>
            ShopTrip will identify the product and compare
            prices across online stores.
          </Text>

          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => {
              // AI photo scanning will be added later.
            }}
          >
            <Text style={styles.aiButtonText}>
              ✨ Identify with AI Photo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESULT */}
      {scanned && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            Barcode Detected
          </Text>

          <View style={styles.barcodeInfo}>
            <Text style={styles.infoLabel}>
              Barcode Type
            </Text>

            <Text style={styles.infoValue}>
              {barcodeType || 'Unknown'}
            </Text>

            <Text style={styles.infoLabel}>
              Barcode Number
            </Text>

            <Text style={styles.infoValue}>
              {barcode || 'Unknown'}
            </Text>
          </View>

          {product ? (
            <View style={styles.productFound}>
              <Text style={styles.productFoundIcon}>
                ✅
              </Text>

              <View style={styles.productFoundContent}>
                <Text style={styles.productFoundTitle}>
                  Product Found
                </Text>

                <Text style={styles.productName}>
                  {product.productName}
                </Text>

                <Text style={styles.productDetails}>
                  {product.brand} • {product.category}
                </Text>

                {product.weight && product.unit ? (
                  <Text style={styles.productDetails}>
                    {product.weight} {product.unit}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.productNotFound}>
              <Text style={styles.notFoundIcon}>
                ❌
              </Text>

              <Text style={styles.notFoundTitle}>
                Product Not Found
              </Text>

              <Text style={styles.notFoundText}>
                This barcode is not currently available in
                the ShopTrip database.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              setBarcode(null);
              setBarcodeType(null);
              setProduct(null);
              setManualBarcode('');
            }}
          >
            <Text style={styles.scanAgainText}>
              📷 Scan Again
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },

  permissionText: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  backButton: {
    marginTop: 16,
    paddingVertical: 12,
  },

  backButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
  },

  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#151B23',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBackText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 42,
  },

  scannerContainer: {
    marginHorizontal: 18,
    height: 390,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#151B23',
  },

  camera: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  scanBox: {
    width: '85%',
    height: 190,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#22C55E',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },

  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  zoomHint: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 8,
  },

  manualContainer: {
    marginHorizontal: 18,
    marginTop: 14,
    padding: 16,
    backgroundColor: '#151B23',
    borderRadius: 18,
  },

  manualTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  manualSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 12,
  },

  manualRow: {
    flexDirection: 'row',
    gap: 8,
  },

  manualInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
  },

  manualButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  manualButtonDisabled: {
    opacity: 0.4,
  },

  manualButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  bottomInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  bottomIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  bottomTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  bottomText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 340,
  },

  aiButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },

  aiButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },

  resultContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },

  resultTitle: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },

  barcodeInfo: {
    backgroundColor: '#151B23',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  infoLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
    marginTop: 4,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },

  productFound: {
    flexDirection: 'row',
    backgroundColor: '#10251A',
    borderWidth: 1,
    borderColor: '#1F6B3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  productFoundIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  productFoundContent: {
    flex: 1,
  },

  productFoundTitle: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },

  productName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  productDetails: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2,
  },

  productNotFound: {
    backgroundColor: '#241414',
    borderWidth: 1,
    borderColor: '#713535',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },

  notFoundIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  notFoundTitle: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  notFoundText: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  scanAgainButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },

  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});