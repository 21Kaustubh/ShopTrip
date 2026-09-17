import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.logo}>ShopTrip 🛒</Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>K</Text>
          </View>
        </View>

        {/* Savings Card */}
        <View style={styles.savingsCard}>
          <Text style={styles.cardLabel}>YOUR TOTAL SAVINGS</Text>
          <Text style={styles.savingsAmount}>₹0</Text>
          <Text style={styles.cardSubtext}>
            Start shopping smarter and watch your savings grow.
          </Text>
        </View>

        {/* Start Trip */}
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startIcon}>🛍️</Text>
          <View>
            <Text style={styles.startTitle}>Start Shopping Trip</Text>
            <Text style={styles.startSubtitle}>
              Scan products & compare prices
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionTitle}>Scan Product</Text>
            <Text style={styles.actionSubtitle}>Photo or barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionTitle}>My Savings</Text>
            <Text style={styles.actionSubtitle}>Track your savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🧳</Text>
            <Text style={styles.actionTitle}>Trip History</Text>
            <Text style={styles.actionSubtitle}>View past trips</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionSubtitle}>Account settings</Text>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How ShopTrip Works</Text>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Scan a product</Text>
            <Text style={styles.stepDescription}>
              Scan its barcode or take a photo while shopping.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter store price</Text>
            <Text style={styles.stepDescription}>
              Tell ShopTrip the price you see in the physical store.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Compare & save</Text>
            <Text style={styles.stepDescription}>
              Compare trusted retailers and discover potential savings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },

  greeting: {
    fontSize: 15,
    color: '#70757D',
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111318',
    marginTop: 2,
  },

  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#111318',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  savingsCard: {
    backgroundColor: '#111318',
    borderRadius: 22,
    padding: 24,
    marginBottom: 16,
  },

  cardLabel: {
    color: '#AEB3BB',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  savingsAmount: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 6,
  },

  cardSubtext: {
    color: '#C9CDD3',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },

  startIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  startTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111318',
  },

  startSubtitle: {
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

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E9EC',
  },

  actionIcon: {
    fontSize: 27,
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
  },

  actionSubtitle: {
    fontSize: 12,
    color: '#7A7F87',
    marginTop: 4,
  },

  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E9EC',
  },

  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111318',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
  },

  stepDescription: {
    fontSize: 12,
    color: '#7A7F87',
    lineHeight: 18,
    marginTop: 3,
  },
});