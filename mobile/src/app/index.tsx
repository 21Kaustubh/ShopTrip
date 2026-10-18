import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTrip } from '../context/TripContext';

export default function HomeScreen() {
  const { productCount, totalItems, totalSavings } = useTrip();
  const hasTrip = productCount > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <View style={styles.wordmark}>
            <View style={styles.mark}><View style={styles.markDot} /></View>
            <Text style={styles.brand}>shoptrip</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>K</Text></View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SMARTER SHOPPING, ONE TRIP AT A TIME</Text>
          <Text style={styles.heroTitle}>Spend with{`\n`}clarity.</Text>
          <Text style={styles.heroDescription}>
            Scan, compare, and decide where every item belongs before you check out.
          </Text>
          <Pressable style={styles.heroButton} onPress={() => router.push('/trip')}>
            <Text style={styles.heroButtonText}>{hasTrip ? 'Continue my trip' : 'Start a shopping trip'}</Text>
            <Text style={styles.heroButtonArrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.insightCard}>
          <View>
            <Text style={styles.insightLabel}>POTENTIAL SAVINGS</Text>
            <Text style={styles.insightValue}>₹{totalSavings.toFixed(0)}</Text>
            <Text style={styles.insightCaption}>
              {hasTrip ? 'Across your active shopping trip' : 'Your trip starts here'}
            </Text>
          </View>
          <View style={styles.insightBadge}>
            <Text style={styles.insightBadgeValue}>{totalItems}</Text>
            <Text style={styles.insightBadgeLabel}>ITEMS</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>What do you want to do?</Text>
          <Text style={styles.sectionHint}>CHOOSE A PATH</Text>
        </View>

        <View style={styles.actionStack}>
          <Pressable style={styles.primaryAction} onPress={() => router.push('/scan')}>
            <View style={[styles.actionIcon, styles.actionIconDark]}><Text style={styles.actionGlyph}>⌁</Text></View>
            <View style={styles.actionCopy}>
              <Text style={styles.primaryActionTitle}>Scan an item</Text>
              <Text style={styles.primaryActionSubtitle}>Use a barcode for a quick match</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.push('/search')}>
            <View style={[styles.actionIcon, styles.actionIconSoft]}><Text style={styles.secondaryGlyph}>⌕</Text></View>
            <View style={styles.actionCopy}>
              <Text style={styles.secondaryActionTitle}>Search a product</Text>
              <Text style={styles.secondaryActionSubtitle}>Find it by name, brand, or barcode</Text>
            </View>
            <Text style={styles.secondaryArrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.howCard}>
          <Text style={styles.howEyebrow}>HOW IT WORKS</Text>
          <View style={styles.steps}>
            <Step number="01" title="Find" body="Scan or search the product you are considering." />
            <View style={styles.stepLine} />
            <Step number="02" title="Compare" body="See the available retailer options in one view." />
            <View style={styles.stepLine} />
            <Step number="03" title="Decide" body="Build the trip that makes sense for you." />
          </View>
        </View>

        <Text style={styles.disclaimer}>Demo prices are illustrative until live retailer data is connected.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{number}</Text>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7F3' },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  topbar: { paddingTop: 10, height: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#1D4438', justifyContent: 'center', alignItems: 'center' },
  markDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D8F28A' },
  brand: { color: '#132820', fontSize: 21, fontWeight: '800', letterSpacing: -0.8 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E4E9D6', borderWidth: 1, borderColor: '#D3DCC2', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#244C3F', fontSize: 14, fontWeight: '800' },
  hero: { backgroundColor: '#1D4438', borderRadius: 28, padding: 25, paddingTop: 28, overflow: 'hidden' },
  eyebrow: { color: '#C8DE98', fontSize: 10, fontWeight: '800', letterSpacing: 1.05 },
  heroTitle: { color: '#FFFFFF', fontSize: 42, lineHeight: 43, fontWeight: '800', letterSpacing: -1.8, marginTop: 14 },
  heroDescription: { color: '#D7E5DC', fontSize: 14, lineHeight: 21, marginTop: 14, maxWidth: 270 },
  heroButton: { minHeight: 52, backgroundColor: '#D8F28A', marginTop: 25, borderRadius: 14, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroButtonText: { color: '#18372D', fontSize: 14, fontWeight: '800' },
  heroButtonArrow: { color: '#18372D', fontSize: 21, fontWeight: '700' },
  insightCard: { backgroundColor: '#FFFFFF', marginTop: 14, padding: 20, borderRadius: 21, borderWidth: 1, borderColor: '#E4E6DE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  insightLabel: { color: '#708078', fontSize: 10, fontWeight: '800', letterSpacing: 0.9 },
  insightValue: { color: '#17382D', fontSize: 31, fontWeight: '800', letterSpacing: -1.1, marginTop: 3 },
  insightCaption: { color: '#7B8580', fontSize: 11, marginTop: 2 },
  insightBadge: { width: 62, height: 62, borderRadius: 18, backgroundColor: '#EDF4D8', alignItems: 'center', justifyContent: 'center' },
  insightBadgeValue: { color: '#254A3D', fontWeight: '800', fontSize: 20 },
  insightBadgeLabel: { color: '#6C7D58', fontSize: 8, letterSpacing: 0.8, fontWeight: '800', marginTop: 1 },
  sectionHeading: { marginTop: 31, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { color: '#152B22', fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  sectionHint: { color: '#84908A', fontSize: 9, fontWeight: '800', letterSpacing: 0.85 },
  actionStack: { gap: 10 },
  primaryAction: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15, minHeight: 82, borderWidth: 1, borderColor: '#DCE3D4', flexDirection: 'row', alignItems: 'center' },
  secondaryAction: { backgroundColor: '#EEF0E9', borderRadius: 18, padding: 15, minHeight: 82, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionIconDark: { backgroundColor: '#1D4438' },
  actionIconSoft: { backgroundColor: '#DDE7D3' },
  actionGlyph: { color: '#D8F28A', fontSize: 27, fontWeight: '600', marginTop: -3 },
  secondaryGlyph: { color: '#315745', fontSize: 29, fontWeight: '500', marginTop: -4 },
  actionCopy: { flex: 1, marginLeft: 13 },
  primaryActionTitle: { color: '#17382D', fontSize: 15, fontWeight: '800' },
  primaryActionSubtitle: { color: '#738078', fontSize: 11, marginTop: 3 },
  secondaryActionTitle: { color: '#264535', fontSize: 15, fontWeight: '800' },
  secondaryActionSubtitle: { color: '#748078', fontSize: 11, marginTop: 3 },
  actionArrow: { color: '#214C3B', fontSize: 20 },
  secondaryArrow: { color: '#60766B', fontSize: 20 },
  howCard: { backgroundColor: '#17382D', marginTop: 29, borderRadius: 23, padding: 21 },
  howEyebrow: { color: '#C8DE98', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  steps: { marginTop: 19 },
  step: { flexDirection: 'row' },
  stepNumber: { width: 34, color: '#D8F28A', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, paddingTop: 2 },
  stepCopy: { flex: 1 },
  stepTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  stepBody: { color: '#BED0C4', fontSize: 11, lineHeight: 16, marginTop: 3, paddingRight: 8 },
  stepLine: { width: 1, height: 20, backgroundColor: '#4F7163', marginLeft: 16, marginVertical: 5 },
  disclaimer: { color: '#8B948F', fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 18, paddingHorizontal: 20 },
});
