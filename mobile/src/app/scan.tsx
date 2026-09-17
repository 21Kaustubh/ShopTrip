import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductByBarcode } from '../services/productService';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [barcodeType, setBarcodeType] = useState<string | null>(null);

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
    if (scanned) {
      return;
    }

    setScanned(true);
    setBarcode(data);
    setBarcodeType(type);

    const foundProduct = getProductByBarcode(data);
    setProduct(foundProduct);
  };

  // Permission is still loading
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

  // Camera permission has not been granted
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionScreen}>
          <Text style={styles.permissionIcon}>📷</Text>

          <Text style={styles.permissionTitle}>
            Camera Access Required
          </Text>

          <Text style={styles.permissionText}>
            ShopTrip needs access to your camera to scan product
            barcodes.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Allow Camera Access
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

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
            <Text style={styles.title}>Scan Product</Text>
          </View>
        </View>

        {/* Camera Scanner */}
        <View style={styles.cameraCard}>
          <CameraView
            style={styles.camera}
            facing="back"
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
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {!scanned && (
                  <>
                    <Text style={styles.scannerIcon}>▦</Text>

                    <Text style={styles.scannerText}>
                      Align barcode inside the frame
                    </Text>
                  </>
                )}
              </View>
            </View>
          </CameraView>
        </View>

        {/* Scan Result */}
        {scanned && barcode ? (
          <View style={styles.resultCard}>

            {/* Result Header */}
            <View style={styles.resultHeader}>
              <Text style={styles.successIcon}>✓</Text>

              <View style={styles.resultHeaderText}>
                <Text style={styles.resultTitle}>
                  Barcode Detected
                </Text>

                <Text style={styles.resultSubtitle}>
                  Product identifier captured successfully
                </Text>
              </View>
            </View>

            {/* Barcode Information */}
            <View style={styles.barcodeBox}>
              <Text style={styles.barcodeLabel}>
                BARCODE TYPE
              </Text>

              <Text style={styles.barcodeType}>
                {barcodeType?.toUpperCase()}
              </Text>

              <Text style={styles.barcodeLabel}>
                BARCODE NUMBER
              </Text>

              <Text style={styles.barcodeValue}>
                {barcode}
              </Text>

              {/* Product Found */}
              {product ? (
                <View style={styles.productSection}>
                  <Text style={styles.barcodeLabel}>
                    PRODUCT FOUND
                  </Text>

                  <Text style={styles.productName}>
                    {product.productName}
                  </Text>

                  <Text style={styles.productDetails}>
                    {product.brand} • {product.category}
                  </Text>

                  <Text style={styles.productDetails}>
                    {product.weight} {product.unit}
                  </Text>
                </View>
              ) : (
                <View style={styles.productSection}>
                  <Text style={styles.barcodeLabel}>
                    PRODUCT STATUS
                  </Text>

                  <Text style={styles.productNotFound}>
                    Product not found in ShopTrip database
                  </Text>
                </View>
              )}
            </View>

            {/* Scan Again */}
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => {
                setScanned(false);
                setBarcode(null);
                setBarcodeType(null);
                setProduct(null);
              }}
            >
              <Text style={styles.scanAgainText}>
                Scan Another Product
              </Text>
            </TouchableOpacity>

          </View>
        ) : (
          <>
            {/* Instructions */}
            <View style={styles.instructionCard}>
              <Text style={styles.instructionIcon}>💡</Text>

              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>
                  How to scan
                </Text>

                <Text style={styles.instructionText}>
                  Hold your phone steady and place the product
                  barcode inside the scanning frame.
                </Text>
              </View>
            </View>

            {/* AI Photo Option */}
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => {
                // AI photo scanning will be added later.
              }}
            >
              <Text style={styles.photoIcon}>📸</Text>

              <View style={styles.photoContent}>
                <Text style={styles.photoTitle}>
                  Identify with AI Photo
                </Text>

                <Text style={styles.photoSubtitle}>
                  Don't have a readable barcode?
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
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

  cameraCard: {
    height: 370,
    backgroundColor: '#111318',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scannerFrame: {
    width: '82%',
    height: 180,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },

  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#FFFFFF',
  },

  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },

  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },

  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },

  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  scannerIcon: {
    color: '#FFFFFF',
    fontSize: 44,
    marginBottom: 12,
  },

  scannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  loadingText: {
    fontSize: 16,
    color: '#555A63',
  },

  permissionScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111318',
    textAlign: 'center',
  },

  permissionText: {
    fontSize: 14,
    color: '#70757D',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 25,
  },

  permissionButton: {
    width: '100%',
    backgroundColor: '#111318',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  backLink: {
    paddingVertical: 16,
  },

  backLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555A63',
  },

  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8E9EC',
    marginBottom: 12,
  },

  instructionIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  instructionContent: {
    flex: 1,
  },

  instructionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111318',
  },

  instructionText: {
    fontSize: 12,
    color: '#70757D',
    lineHeight: 18,
    marginTop: 3,
  },

  photoButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },

  photoIcon: {
    fontSize: 25,
    marginRight: 13,
  },

  photoContent: {
    flex: 1,
  },

  photoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111318',
  },

  photoSubtitle: {
    fontSize: 12,
    color: '#70757D',
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: '#111318',
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  successIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111318',
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
    marginRight: 12,
  },

  resultHeaderText: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111318',
  },

  resultSubtitle: {
    fontSize: 11,
    color: '#70757D',
    marginTop: 3,
  },

  barcodeBox: {
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  barcodeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8F97',
    letterSpacing: 1,
    marginBottom: 4,
  },

  barcodeType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111318',
    marginBottom: 13,
  },

  barcodeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111318',
    letterSpacing: 1,
  },

  productSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E3E5E8',
  },

  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111318',
    marginTop: 4,
  },

  productDetails: {
    fontSize: 13,
    color: '#70757D',
    marginTop: 4,
  },

  productNotFound: {
    fontSize: 13,
    fontWeight: '700',
    color: '#70757D',
    marginTop: 4,
  },

  scanAgainButton: {
    backgroundColor: '#111318',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});