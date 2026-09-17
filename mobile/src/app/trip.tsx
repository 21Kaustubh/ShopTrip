import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>CURRENT TRIP</Text>
            <Text style={styles.title}>Shopping Trip #001 🛍️</Text>
          </View>

          <View style={styles.tripBadge}>
            <Text style={styles.tripBadgeText}>ACTIVE</Text>
          </View>
        </View>

        {/* Trip Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>Products Checked</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>₹0</Text>
            <Text style={styles.summaryLabel}>Potential Savings</Text>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanIcon}>📷</Text>

          <View>
            <Text style={styles.scanTitle}>Scan Product</Text>
            <Text style={styles.scanSubtitle}>
              Scan barcode or take a photo
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Products */}
        <Text style={styles.sectionTitle}>Trip Products</Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptyText}>
            Scan your first product to start comparing prices.
          </Text>
        </View>

        {/* Finish Trip */}
        <TouchableOpacity style={styles.finishButton}>
          <Text style={styles.finishButtonText}>Finish Shopping Trip</Text>
        </TouchableOpacity>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#70757D',
    letterSpacing: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111318',
    marginTop: 4,
  },

  tripBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tripBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
  },

  summaryCard: {
    backgroundColor: '#111318',
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#AEB3BB',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  divider: {
    width: 1,
    height: 45,
    backgroundColor: '#3A3D42',
  },

  scanButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E5E8',
    marginBottom: 28,
  },

  scanIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  scanTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111318',
  },

  scanSubtitle: {
    fontSize: 13,
    color: '#70757D',
    marginTop: 3,
  },

  arrow: {
    fontSize: 30,
    color: '#111318',
    marginLeft: 'auto',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111318',
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E9EC',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111318',
  },

  emptyText: {
    fontSize: 13,
    color: '#7A7F87',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  finishButton: {
    marginTop: 18,
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DADF',
    alignItems: 'center',
  },

  finishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
  },
});