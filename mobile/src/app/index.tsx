import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShopTripLogo } from '../components/ShopTripLogo';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle, useAppTheme } from '../context/ThemeContext';
import { useTrip } from '../context/TripContext';

export default function LandingPage() {
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { productCount } = useTrip();
  const { width } = useWindowDimensions();

  const isWide = width >= 768;
  const hasActiveSession = Boolean(user) || productCount > 0;

  const handleStartShopping = () => {
    if (hasActiveSession) {
      router.push('/home' as any);
    } else {
      router.push('/welcome' as any);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isWide && styles.scrollContainerWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================================== */}
        {/* 1. PUBLIC NAVBAR                                                     */}
        {/* ==================================================================== */}
        <View style={styles.navbar}>
          <ShopTripLogo size="md" />

          <View style={styles.navActions}>
            <ThemeToggle />

            {hasActiveSession ? (
              <Pressable
                style={[
                  styles.navCtaButton,
                  {
                    backgroundColor: isDark ? colors.accent : colors.primaryDark,
                  },
                ]}
                onPress={() => router.push('/home' as any)}
                accessibilityLabel="Go to active shopping trip"
              >
                <Text
                  style={[
                    styles.navCtaText,
                    { color: isDark ? colors.accentText : '#FFFFFF' },
                  ]}
                >
                  Go to App {productCount > 0 ? `(${productCount})` : ''} →
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.navSignInButton,
                  {
                    backgroundColor: colors.chipBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push('/welcome' as any)}
                accessibilityLabel="Sign in or continue as guest"
              >
                <Text style={[styles.navSignInText, { color: colors.chipText }]}>
                  Sign In
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 2. HERO SECTION                                                      */}
        {/* ==================================================================== */}
        <View
          style={[
            styles.heroSection,
            { backgroundColor: colors.heroBg },
            isWide && styles.heroSectionWide,
          ]}
        >
          {/* Left Column: Copy & Actions */}
          <View style={[styles.heroCopyColumn, isWide && styles.heroCopyColumnWide]}>
            <View style={styles.kickerPill}>
              <Text style={[styles.kickerText, { color: colors.heroKicker }]}>
                SMART IN-STORE COMPANION
              </Text>
            </View>

            <Text style={[styles.heroHeadline, { color: colors.heroText }]}>
              Smarter shopping,{'\n'}before you check out.
            </Text>

            <Text style={styles.heroLead}>
              ShopTrip helps you scan items in the aisle, check verified retailer alternatives,
              and build an organized trip before you reach the register.
            </Text>

            <View style={styles.heroCtaGroup}>
              <Pressable
                style={[styles.primaryCtaButton, { backgroundColor: colors.accent }]}
                onPress={handleStartShopping}
                accessibilityRole="button"
                accessibilityLabel="Start Shopping with ShopTrip"
              >
                <Text style={[styles.primaryCtaText, { color: colors.accentText }]}>
                  {hasActiveSession ? 'Continue Shopping' : 'Start Shopping'}
                </Text>
                <Text style={[styles.primaryCtaArrow, { color: colors.accentText }]}>
                  →
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryCtaPill,
                  { borderColor: 'rgba(255,255,255,0.25)' },
                ]}
                onPress={() => router.push('/welcome' as any)}
                accessibilityRole="button"
                accessibilityLabel="Guest Access"
              >
                <Text style={styles.secondaryCtaText}>Guest Mode Available</Text>
              </Pressable>
            </View>
          </View>

          {/* Right Column: Purposeful Vector/UI Illustration */}
          <View style={[styles.heroVisualColumn, isWide && styles.heroVisualColumnWide]}>
            <View style={[styles.mockDevice, { backgroundColor: isDark ? '#14201A' : '#17382D' }]}>
              {/* Floating Item Scanner Badge */}
              <View style={[styles.scannerBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.scannerBadgeIcon}>
                  <Text style={[styles.scannerGlyph, { color: isDark ? colors.accent : colors.primaryDark }]}>
                    ⌁
                  </Text>
                </View>
                <View style={styles.scannerBadgeText}>
                  <Text style={[styles.scannerBadgeTitle, { color: colors.text }]}>Barcode Reader</Text>
                  <Text style={[styles.scannerBadgeSubtitle, { color: colors.textSecondary }]}>
                    Instant camera & manual lookup
                  </Text>
                </View>
              </View>

              {/* Product Comparison Demonstration Card */}
              <View style={[styles.compareDemoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.compareCardHeader}>
                  <Text style={[styles.compareProductTitle, { color: colors.text }]}>
                    Instant Roast Coffee (100g)
                  </Text>
                  <View style={[styles.categoryPill, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.categoryPillText, { color: colors.badgeText }]}>Coffee & Tea</Text>
                  </View>
                </View>

                {/* Price Split */}
                <View style={[styles.compareSplitRow, { backgroundColor: colors.cardMuted }]}>
                  <View style={styles.comparePriceCell}>
                    <Text style={[styles.comparePriceLabel, { color: colors.textMuted }]}>IN-STORE SHELF</Text>
                    <Text style={[styles.shelfPriceValue, { color: colors.textSecondary }]}>₹385</Text>
                  </View>
                  <Text style={[styles.splitArrow, { color: colors.textMuted }]}>→</Text>
                  <View style={styles.comparePriceCell}>
                    <Text style={[styles.comparePriceLabel, { color: colors.textMuted }]}>BEST RECORDED</Text>
                    <Text style={[styles.bestPriceValue, { color: isDark ? colors.accent : colors.primaryDark }]}>
                      ₹320
                    </Text>
                  </View>
                </View>
              </View>

              {/* Active Trip Checklist Snippet */}
              <View style={[styles.tripSnippetCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.tripSnippetHeading, { color: colors.textMuted }]}>
                  ACTIVE TRIP CHECKLIST
                </Text>
                <View style={styles.checkRow}>
                  <Text style={[styles.checkMark, { color: isDark ? colors.accent : colors.primaryDark }]}>✓</Text>
                  <Text style={[styles.checkLabel, { color: colors.text }]}>Classic Assam Tea (250g)</Text>
                  <Text style={[styles.checkQty, { color: colors.textSecondary }]}>qty 1</Text>
                </View>
                <View style={styles.checkRow}>
                  <Text style={[styles.checkMark, { color: isDark ? colors.accent : colors.primaryDark }]}>✓</Text>
                  <Text style={[styles.checkLabel, { color: colors.text }]}>Whole Grain Rolled Oats (1kg)</Text>
                  <Text style={[styles.checkQty, { color: colors.textSecondary }]}>qty 2</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 3. HOW IT WORKS (3 CONCISE STEPS)                                    */}
        {/* ==================================================================== */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>
            HOW SHOPTRIP WORKS
          </Text>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Three steps to confident shopping
          </Text>

          <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.stepNumCircle, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.accent }]}>01</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Identify at the Shelf
              </Text>
              <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
                Point your phone camera at any standard retail barcode in the aisle or search the database by product and brand.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.stepNumCircle, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.accent }]}>02</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Compare Verified Offers
              </Text>
              <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
                Review recorded retailer pricing and delivery options side by side in a calm, clear interface before you commit.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.stepNumCircle, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.accent }]}>03</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Decide Before Checkout
              </Text>
              <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
                Build your shopping list, calculate your projected spend, and decide which items belong in your basket today.
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 4. CORE FEATURES SECTION                                             */}
        {/* ==================================================================== */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>
            FEATURES
          </Text>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Built for everyday retail decisions
          </Text>

          <View style={[styles.featuresGrid, isWide && styles.featuresGridWide]}>
            {/* Feature 1 */}
            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.featureIconGlyph, { color: colors.badgeText }]}>⌁</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                In-Store Barcode Scanning
              </Text>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                Fast barcode capture using Expo Camera with instant fallback to manual numerical entry.
              </Text>
            </View>

            {/* Feature 2 */}
            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.featureIconGlyph, { color: colors.badgeText }]}>⌕</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Catalogue Search
              </Text>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                Asynchronous search across coffee, staples, dairy, snacks, and household essentials.
              </Text>
            </View>

            {/* Feature 3 */}
            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.featureIconGlyph, { color: colors.badgeText }]}>⇄</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Retailer Comparison
              </Text>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                Structured comparison across major platforms with verified offer timestamps and delivery windows.
              </Text>
            </View>

            {/* Feature 4 */}
            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.featureIconGlyph, { color: colors.badgeText }]}>✓</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Trip Organization
              </Text>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                Live quantity adjustments, purchasing status indicators, and persistent local guest storage.
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 5. DATA INTEGRITY & HONEST TRANSPARENCY CARD                         */}
        {/* ==================================================================== */}
        <View
          style={[
            styles.trustCard,
            {
              backgroundColor: colors.cardMuted,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.trustIconCircle}>
            <Text style={[styles.trustIconText, { color: colors.primary }]}>ℹ</Text>
          </View>
          <View style={styles.trustCopy}>
            <Text style={[styles.trustTitle, { color: colors.text }]}>
              Verified Database Pricing
            </Text>
            <Text style={[styles.trustBody, { color: colors.textSecondary }]}>
              ShopTrip presents product offers recorded in our PostgreSQL database. We do not
              fabricate discounts or present simulated figures as real-time market data.
            </Text>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 6. FINAL CALL TO ACTION (CTA)                                        */}
        {/* ==================================================================== */}
        <View
          style={[
            styles.finalCtaCard,
            { backgroundColor: isDark ? '#14201A' : colors.primaryDark },
          ]}
        >
          <Text style={[styles.finalCtaKicker, { color: colors.heroKicker }]}>
            READY TO SHOP SMARTER?
          </Text>
          <Text style={styles.finalCtaHeading}>
            Take the guesswork out of your next shopping run.
          </Text>
          <Text style={styles.finalCtaSub}>
            Create an account to save shopping trips, or continue immediately in guest mode with zero friction.
          </Text>

          <Pressable
            style={[styles.finalCtaButton, { backgroundColor: colors.accent }]}
            onPress={handleStartShopping}
            accessibilityRole="button"
            accessibilityLabel="Start Shopping with ShopTrip"
          >
            <Text style={[styles.finalCtaButtonText, { color: colors.accentText }]}>
              {hasActiveSession ? 'Open Shopping Trip' : 'Start Shopping Now'}
            </Text>
            <Text style={[styles.finalCtaButtonArrow, { color: colors.accentText }]}>
              →
            </Text>
          </Pressable>
        </View>

        {/* ==================================================================== */}
        {/* 7. FOOTER                                                            */}
        {/* ==================================================================== */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <ShopTripLogo size="sm" />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2026 ShopTrip. Built for smart, informed shopping.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContainerWide: {
    maxWidth: 1040,
    paddingHorizontal: 32,
  },

  /* NAVBAR */
  navbar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navSignInButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  navSignInText: {
    fontSize: 12,
    fontWeight: '800',
  },
  navCtaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navCtaText: {
    fontSize: 12,
    fontWeight: '800',
  },

  /* HERO */
  heroSection: {
    borderRadius: 30,
    padding: 26,
    overflow: 'hidden',
    marginTop: 8,
  },
  heroSectionWide: {
    flexDirection: 'row',
    padding: 42,
    alignItems: 'center',
    gap: 40,
  },
  heroCopyColumn: {
    flex: 1,
  },
  heroCopyColumnWide: {
    maxWidth: 520,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(216, 242, 138, 0.15)',
    marginBottom: 16,
  },
  kickerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroHeadline: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  heroLead: {
    color: '#D7E5DC',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
    maxWidth: 440,
  },
  heroCtaGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
  },
  primaryCtaButton: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: '800',
  },
  primaryCtaArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryCtaPill: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryCtaText: {
    color: '#D7E5DC',
    fontSize: 13,
    fontWeight: '700',
  },

  /* HERO VISUAL MOCKUP */
  heroVisualColumn: {
    marginTop: 28,
  },
  heroVisualColumnWide: {
    marginTop: 0,
    flex: 1,
  },
  mockDevice: {
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  scannerBadge: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scannerBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(216, 242, 138, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerGlyph: {
    fontSize: 20,
    fontWeight: '700',
  },
  scannerBadgeText: {
    flex: 1,
  },
  scannerBadgeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  scannerBadgeSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },

  compareDemoCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  compareCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  compareProductTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  compareSplitRow: {
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  comparePriceCell: {
    alignItems: 'center',
  },
  comparePriceLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  shelfPriceValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
    textDecorationLine: 'line-through',
  },
  bestPriceValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  splitArrow: {
    fontSize: 16,
    fontWeight: '700',
  },

  tripSnippetCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  tripSnippetHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkMark: {
    fontSize: 13,
    fontWeight: '800',
  },
  checkLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  checkQty: {
    fontSize: 11,
  },

  /* SECTION COMMON */
  sectionBlock: {
    marginTop: 48,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 20,
  },

  /* HOW IT WORKS GRID */
  stepsGrid: {
    gap: 16,
  },
  stepsGridWide: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    gap: 12,
  },
  stepNumCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 20,
  },

  /* FEATURES GRID */
  featuresGrid: {
    gap: 16,
  },
  featuresGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureCard: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    gap: 12,
    flexBasis: '48%',
    flexGrow: 1,
  },
  featureIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconGlyph: {
    fontSize: 20,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  featureBody: {
    fontSize: 13,
    lineHeight: 20,
  },

  /* TRUST & INTEGRITY CARD */
  trustCard: {
    marginTop: 36,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trustIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(216, 242, 138, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustIconText: {
    fontSize: 18,
    fontWeight: '800',
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  trustBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  /* FINAL CTA */
  finalCtaCard: {
    marginTop: 48,
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    textAlign: 'center',
  },
  finalCtaKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  finalCtaHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    maxWidth: 500,
  },
  finalCtaSub: {
    color: '#D7E5DC',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 480,
  },
  finalCtaButton: {
    minHeight: 52,
    paddingHorizontal: 28,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  finalCtaButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  finalCtaButtonArrow: {
    fontSize: 18,
    fontWeight: '700',
  },

  /* FOOTER */
  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerText: {
    fontSize: 11,
  },
});
