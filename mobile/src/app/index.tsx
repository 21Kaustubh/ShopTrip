import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
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

  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const isWide = width >= 768;
  const hasActiveSession = Boolean(user) || productCount > 0;

  const handleStartShopping = () => {
    if (hasActiveSession) {
      router.push('/home' as any);
    } else {
      router.push('/welcome' as any);
    }
  };

  const contactEmail = process.env.EXPO_PUBLIC_CONTACT_EMAIL || 'support@shoptrip.in';
  const handleContactUs = async () => {
    const mailto = `mailto:${contactEmail}?subject=ShopTrip%20Inquiry%20%26%20Feedback`;
    const fallbackUrl = 'https://github.com/kaus2/ShopTrip/issues';
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch {
      Alert.alert(
        'Contact ShopTrip',
        `For support, inquiries, and retailer suggestions, reach us at:\n\n${contactEmail}`
      );
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
              Scan it. Compare it.{'\n'}Shop smarter.
            </Text>

            <Text style={styles.heroLead}>
              ShopTrip identifies products by barcode, helps compare available retailer options, and organises your shopping trip — all in one place.
            </Text>

            <View style={styles.heroCtaGroup}>
              <Pressable
                style={[styles.primaryCtaButton, { backgroundColor: colors.accent }]}
                onPress={() => router.push('/scan' as any)}
                accessibilityRole="button"
                accessibilityLabel="Scan a product barcode with camera"
              >
                <Text style={styles.primaryCtaIcon}>📷</Text>
                <Text style={[styles.primaryCtaText, { color: colors.accentText }]}>
                  Scan a Product
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
                onPress={() => router.push('/search' as any)}
                accessibilityRole="button"
                accessibilityLabel="Search product catalogue"
              >
                <Text style={styles.secondaryCtaText}>Search Products</Text>
              </Pressable>
            </View>
          </View>

          {/* Right Column: Purposeful Vector/UI Illustration */}
          <View style={[styles.heroVisualColumn, isWide && styles.heroVisualColumnWide]}>
            <View style={[styles.mockDevice, { backgroundColor: isDark ? '#14201A' : '#17382D' }]}>
              {/* Illustrative Preview Badge */}
              <View style={[styles.previewTagPill, { backgroundColor: isDark ? 'rgba(216, 242, 138, 0.15)' : 'rgba(216, 242, 138, 0.25)' }]}>
                <Text style={[styles.previewTagText, { color: colors.heroKicker }]}>
                  ILLUSTRATIVE PREVIEW · NO LIVE PRICES
                </Text>
              </View>

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

              {/* Functional Search Preview Card */}
              <Pressable
                style={[styles.compareDemoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => router.push({ pathname: '/search', params: { q: 'Tata Salt' } } as any)}
                accessibilityRole="button"
                accessibilityLabel="Search Tata Salt in catalogue"
              >
                <View style={styles.compareCardHeader}>
                  <Text style={[styles.compareProductTitle, { color: colors.text }]}>
                    Tata Salt (1 kg)
                  </Text>
                  <View style={[styles.categoryPill, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.categoryPillText, { color: colors.badgeText }]}>Staples</Text>
                  </View>
                </View>
                <View style={[styles.compareSplitRow, { backgroundColor: colors.cardMuted }]}>
                  <Text style={[styles.comparePriceLabel, { color: colors.textMuted }]}>
                    Tap to search in catalogue ↗
                  </Text>
                </View>
              </Pressable>

              {/* Illustrative Trip Card (no fabricated items) */}
              <View style={[styles.tripSnippetCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.tripSnippetHeading, { color: colors.textMuted }]}>
                  YOUR SHOPPING TRIP
                </Text>
                <View style={styles.checkRow}>
                  <Text style={[styles.checkMark, { color: isDark ? colors.accent : colors.primaryDark }]}>✓</Text>
                  <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>Scan barcodes or search to add items</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 3. HOW IT WORKS (SCAN -> COMPARE -> PLAN)                            */}
        {/* ==================================================================== */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>
            HOW SHOPTRIP WORKS
          </Text>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Scan → Compare → Plan
          </Text>

          <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.stepNumCircle, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.accent }]}>01</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Scan at the Shelf
              </Text>
              <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
                Point your phone camera at any standard retail barcode in the aisle, or search the catalogue by product and brand.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.stepNumCircle, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.accent }]}>02</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Compare Retailers
              </Text>
              <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
                Open verified outbound search links across quick commerce and marketplaces to check live pricing and stock.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.stepNumCircle, { backgroundColor: isDark ? '#213329' : colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.accent }]}>03</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Plan Your Trip
              </Text>
              <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
                Organize your items into an active shopping trip checklist, adjust quantities, and decide what to buy before checkout.
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
              Honest Data Policy
            </Text>
            <Text style={[styles.trustBody, { color: colors.textSecondary }]}>
              ShopTrip shows outbound retailer links and catalogue metadata sourced from Open Food Facts. Live prices require direct retailer access. We do not fabricate or scrape prices.
            </Text>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* 6. COMING SOON — FUTURE ROADMAP                                      */}
        {/* ==================================================================== */}
        <View style={styles.sectionBlock}>
          <View style={[styles.roadmapPillHeader, { backgroundColor: isDark ? 'rgba(216, 242, 138, 0.15)' : 'rgba(38, 77, 59, 0.12)' }]}>
            <Text style={[styles.roadmapEyebrow, { color: isDark ? colors.accent : colors.primaryDark }]}>
              PLANNED · FUTURE ROADMAP
            </Text>
          </View>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            What&apos;s next for ShopTrip
          </Text>

          <View style={[styles.roadmapGrid, isWide && styles.roadmapGridWide]}>
            {/* Feature A: Healthy Bite */}
            <View
              style={[
                styles.roadmapCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={[styles.roadmapStatusPill, { backgroundColor: isDark ? '#1C2C24' : '#EAF3EC' }]}>
                <Text style={[styles.roadmapStatusText, { color: isDark ? colors.accent : colors.primaryDark }]}>
                  COMING SOON · NUTRITION RANKING
                </Text>
              </View>

              <Text style={[styles.roadmapTitle, { color: colors.text }]}>
                Healthy Bite
              </Text>
              <Text style={[styles.roadmapSummary, { color: colors.textSecondary }]}>
                Discover better alternatives to everyday snacks, with nutrition taking priority over price.
              </Text>

              <View style={styles.roadmapBulletList}>
                <View style={styles.roadmapBulletRow}>
                  <Text style={[styles.roadmapBulletDot, { color: colors.accent }]}>•</Text>
                  <Text style={[styles.roadmapBulletText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Category Alternatives: </Text>
                    Viewing snacks like Lay&apos;s or Kurkure will suggest higher-quality alternatives within the same category (e.g. baked chips, roasted snacks, protein-conscious options).
                  </Text>
                </View>
                <View style={styles.roadmapBulletRow}>
                  <Text style={[styles.roadmapBulletDot, { color: colors.accent }]}>•</Text>
                  <Text style={[styles.roadmapBulletText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Nutrition-First Scoring: </Text>
                    Rankings prioritize protein, saturated fats, sodium, disclosed additives, oil types, and preparation methods (baked vs fried).
                  </Text>
                </View>
                <View style={styles.roadmapBulletRow}>
                  <Text style={[styles.roadmapBulletDot, { color: colors.accent }]}>•</Text>
                  <Text style={[styles.roadmapBulletText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Evidence-Based Guidance: </Text>
                    Transparent ratings based on published label disclosures with comparable serving sizes, providing consumer guidance without medical claims.
                  </Text>
                </View>
              </View>
            </View>

            {/* Feature B: Smart Trip Planner */}
            <View
              style={[
                styles.roadmapCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={[styles.roadmapStatusPill, { backgroundColor: isDark ? '#1C2C24' : '#EAF3EC' }]}>
                <Text style={[styles.roadmapStatusText, { color: isDark ? colors.accent : colors.primaryDark }]}>
                  COMING SOON · BUDGET CONTROL
                </Text>
              </View>

              <Text style={[styles.roadmapTitle, { color: colors.text }]}>
                Smart Trip Planner
              </Text>
              <Text style={[styles.roadmapSummary, { color: colors.textSecondary }]}>
                Plan your shopping list before you leave, compare options and stay in control of your budget.
              </Text>

              <View style={styles.roadmapBulletList}>
                <View style={styles.roadmapBulletRow}>
                  <Text style={[styles.roadmapBulletDot, { color: colors.accent }]}>•</Text>
                  <Text style={[styles.roadmapBulletText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Pre-Trip Budgeting: </Text>
                    Set a target budget before visiting a supermarket, local mart, or kirana store, comparing planned spend against verified prices.
                  </Text>
                </View>
                <View style={styles.roadmapBulletRow}>
                  <Text style={[styles.roadmapBulletDot, { color: colors.accent }]}>•</Text>
                  <Text style={[styles.roadmapBulletText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Price Threshold Decisions: </Text>
                    Buy in-store when prices are favorable; otherwise route to online quick-commerce or marketplace options.
                  </Text>
                </View>
                <View style={styles.roadmapBulletRow}>
                  <Text style={[styles.roadmapBulletDot, { color: colors.accent }]}>•</Text>
                  <Text style={[styles.roadmapBulletText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Essentials & Contingency: </Text>
                    Categorise purchases into essentials vs optional with a 10–20% contingency alert if your basket exceeds the planned ceiling.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.roadmapDisclaimer, { color: colors.textMuted }]}>
            Planned future capabilities. The current release focuses on barcode scanning, multi-retailer search links, and active shopping trip organization. Nutritional analysis and budget models are not active in this prototype.
          </Text>
        </View>

        {/* ==================================================================== */}
        {/* 7. FINAL CALL TO ACTION (CTA)                                        */}
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
          <View style={styles.footerBrandRow}>
            <ShopTripLogo size="sm" />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              © 2026 ShopTrip · Built for smart, informed shopping.
            </Text>
          </View>

          <View style={styles.footerLinksRow}>
            <Pressable
              onPress={handleContactUs}
              accessibilityRole="link"
              accessibilityLabel="Contact ShopTrip Support"
            >
              <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                Contact Us
              </Text>
            </Pressable>

            <Text style={[styles.footerLinkDot, { color: colors.textMuted }]}>·</Text>

            <Pressable
              onPress={() => setActiveModal('privacy')}
              accessibilityRole="link"
              accessibilityLabel="Privacy Policy"
            >
              <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                Privacy Policy
              </Text>
            </Pressable>

            <Text style={[styles.footerLinkDot, { color: colors.textMuted }]}>·</Text>

            <Pressable
              onPress={() => setActiveModal('terms')}
              accessibilityRole="link"
              accessibilityLabel="Terms of Service"
            >
              <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                Terms of Service
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* POLICY & TERMS MODAL */}
      <Modal
        visible={activeModal !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.policyModalContent,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.policyModalHeader}>
              <Text style={[styles.policyModalTitle, { color: colors.text }]}>
                {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </Text>
              <Pressable
                style={[styles.closeModalBtn, { backgroundColor: colors.chipBg }]}
                onPress={() => setActiveModal(null)}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Text style={[styles.closeModalText, { color: colors.chipText }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.policyModalBody} showsVerticalScrollIndicator={true}>
              {activeModal === 'privacy' ? (
                <View style={styles.policyTextGroup}>
                  <Text style={[styles.policySubheading, { color: colors.text }]}>
                    1. Data Storage & Privacy
                  </Text>
                  <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
                    ShopTrip is designed with privacy as a foundational principle. In guest mode, your shopping trip items and entered shelf prices are stored exclusively in your local browser or device storage (`AsyncStorage`). No personally identifiable information is collected or sold.
                  </Text>

                  <Text style={[styles.policySubheading, { color: colors.text }]}>
                    2. Product Lookups & Metadata
                  </Text>
                  <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
                    Barcode scans and product searches are matched against our verified catalogue and the public Open Food Facts database under the Open Database License (ODbL). No tracking pixels or advertising telemetry monitor your searches.
                  </Text>

                  <Text style={[styles.policySubheading, { color: colors.text }]}>
                    3. External Retailer Links
                  </Text>
                  <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
                    When you tap to open an external merchant page (such as Blinkit, Zepto, Amazon, or BigBasket), you are redirected directly to that retailer&apos;s website or app. ShopTrip does not scrape user credentials or track user checkout activity on third-party sites.
                  </Text>
                </View>
              ) : (
                <View style={styles.policyTextGroup}>
                  <Text style={[styles.policySubheading, { color: colors.text }]}>
                    1. Product & Price Comparison
                  </Text>
                  <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
                    ShopTrip provides grocery product discovery, shelf price logging, and outbound search links to popular Indian retailers. Unless explicitly labeled as a verified database offer, online prices and availability are determined by each retailer&apos;s dark store, local inventory, and delivery address.
                  </Text>

                  <Text style={[styles.policySubheading, { color: colors.text }]}>
                    2. User Shelf Prices & Savings
                  </Text>
                  <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
                    Projected savings are calculated based on user-entered in-store shelf tags compared against comparable verified online offers. ShopTrip does not guarantee external merchant stock or prices at final checkout.
                  </Text>

                  <Text style={[styles.policySubheading, { color: colors.text }]}>
                    3. Open Food Facts Attribution
                  </Text>
                  <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
                    Product metadata is partially derived from Open Food Facts contributors under ODbL. Catalogue presence does not imply live stock or partnership with manufacturers.
                  </Text>
                </View>
              )}
            </ScrollView>

            <Pressable
              style={[
                styles.modalDoneBtn,
                { backgroundColor: isDark ? colors.accent : colors.primaryDark },
              ]}
              onPress={() => setActiveModal(null)}
            >
              <Text
                style={[
                  styles.modalDoneText,
                  { color: isDark ? colors.accentText : '#FFFFFF' },
                ]}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    maxWidth: 1380,
    paddingHorizontal: 40,
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
  primaryCtaIcon: {
    fontSize: 16,
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
  previewTagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
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

  /* ROADMAP COMING SOON */
  roadmapPillHeader: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  roadmapEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  roadmapGrid: {
    gap: 16,
  },
  roadmapGridWide: {
    flexDirection: 'row',
  },
  roadmapCard: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    gap: 12,
  },
  roadmapStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roadmapStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  roadmapSummary: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  roadmapBulletList: {
    gap: 8,
    marginTop: 4,
  },
  roadmapBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  roadmapBulletDot: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  roadmapBulletText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  roadmapDisclaimer: {
    marginTop: 16,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
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
    gap: 16,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 11,
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerLinkDot: {
    fontSize: 12,
  },

  /* POLICY & TERMS MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  policyModalContent: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  policyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  policyModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 14,
    fontWeight: '800',
  },
  policyModalBody: {
    marginBottom: 20,
  },
  policyTextGroup: {
    gap: 14,
    paddingVertical: 4,
  },
  policySubheading: {
    fontSize: 14,
    fontWeight: '800',
  },
  policyParagraph: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalDoneBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
