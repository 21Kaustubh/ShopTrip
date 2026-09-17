import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
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

        {/* Scanner Area */}
        <View style={styles.scannerCard}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.scannerTitle}>Ready to scan</Text>
            <Text style={styles.scannerText}>
              Position the product barcode inside the frame.
            </Text>
          </View>
        </View>

        {/* Scan Options */}
        <Text style={styles.sectionTitle}>Choose how to identify</Text>

        <TouchableOpacity style={styles.optionCard}>
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>▦</Text>
          </View>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Scan Barcode</Text>
            <Text style={styles.optionDescription}>
              Fast and precise product identification
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard}>
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📸</Text>
          </View>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Take Product Photo</Text>
            <Text style={styles.optionDescription}>
              Use AI to identify the product from an image
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Manual Option */}
        <TouchableOpacity style={styles.manualButton}>
          <Text style={styles.manualText}>
            Enter product manually
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Tip</Text>
            <Text style={styles.infoText}>
              Barcode scanning will give the most accurate product
              match when available.
            </Text>
          </View>
        </View>
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
    marginBottom: 22,
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

  scannerCard: {
    backgroundColor: '#111318',
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
  },

  scannerFrame: {
    height: 270,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4A4D53',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 30,
  },

  corner: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderColor: '#FFFFFF',
  },

  topLeft: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },

  topRight: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },

  bottomLeft: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },

  bottomRight: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  cameraIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  scannerText: {
    color: '#AEB3BB',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111318',
    marginBottom: 14,
  },

  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E5E8',
    marginBottom: 12,
  },

  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F0F1F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  optionIcon: {
    fontSize: 25,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111318',
  },

  optionDescription: {
    fontSize: 12,
    color: '#70757D',
    lineHeight: 17,
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: '#111318',
    marginLeft: 10,
  },

  manualButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 2,
  },

  manualText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555A63',
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8E9EC',
  },

  infoIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111318',
  },

  infoText: {
    fontSize: 12,
    color: '#70757D',
    lineHeight: 18,
    marginTop: 3,
  },
});