import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShopTripLogo } from '../components/ShopTripLogo';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle, useAppTheme } from '../context/ThemeContext';
import { useTrip } from '../context/TripContext';

export default function AppHomeScreen() {
  const { colors, isDark } = useAppTheme();
  const { user, isGuest, logout } = useAuth();
  const { productCount, totalItems, totalSavings } = useTrip();
  const hasTrip = productCount > 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOPBAR */}
        <View style={styles.topbar}>
          <Pressable onPress={() => router.push('/')} accessibilityLabel="ShopTrip Home">
            <ShopTripLogo size="md" />
          </Pressable>

          <View style={styles.topbarActions}>
            <ThemeToggle />

            {isGuest ? (
              <Pressable
                style={[
                  styles.accountBadge,
                  {
                    backgroundColor: colors.chipBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push('/welcome' as any)}
              >
                <Text style={[styles.accountBadgeText, { color: colors.chipText }]}>
                  Sign in
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.avatar,
                  {
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={logout}
                accessibilityLabel="Log out"
              >
                <Text style={[styles.avatarText, { color: colors.badgeText }]}>
                  {user?.email ? user.email.slice(0, 1).toUpperCase() : 'U'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* HERO CARD */}
        <View style={[styles.hero, { backgroundColor: colors.heroBg }]}>
          <Text style={[styles.eyebrow, { color: colors.heroKicker }]}>
            SMARTER SHOPPING, ONE TRIP AT A TIME
          </Text>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>
            Spend with{`\n`}clarity.
          </Text>
          <Text style={styles.heroDescription}>
            Scan barcodes at the shelf, evaluate recorded retailer options, and build a trip that makes financial sense.
          </Text>
          <Pressable
            style={[styles.heroButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/trip')}
          >
            <Text style={[styles.heroButtonText, { color: colors.accentText }]}>
              {hasTrip ? 'Continue my trip' : 'Start a shopping trip'}
            </Text>
            <Text style={[styles.heroButtonArrow, { color: colors.accentText }]}>→</Text>
          </Pressable>
        </View>

        {/* TRIP SAVINGS INSIGHT CARD */}
        <View
          style={[
            styles.insightCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View>
            <Text style={[styles.insightLabel, { color: colors.textMuted }]}>
              POTENTIAL SAVINGS
            </Text>
            <Text
              style={[
                styles.insightValue,
                { color: isDark ? colors.accent : colors.primaryDark },
              ]}
            >
              ₹{totalSavings.toFixed(0)}
            </Text>
            <Text style={[styles.insightCaption, { color: colors.textSecondary }]}>
              {hasTrip ? 'Across your active shopping trip' : 'Your trip starts here'}
            </Text>
          </View>
          <View style={[styles.insightBadge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.insightBadgeValue, { color: colors.badgeText }]}>
              {totalItems}
            </Text>
            <Text style={[styles.insightBadgeLabel, { color: colors.badgeText }]}>
              {totalItems === 1 ? 'ITEM' : 'ITEMS'}
            </Text>
          </View>
        </View>

        {/* SECTION HEADING */}
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What do you want to do?
          </Text>
          <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
            CHOOSE A PATH
          </Text>
        </View>

        {/* ACTION CARDS */}
        <View style={styles.actionStack}>
          <Pressable
            style={[
              styles.primaryAction,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => router.push('/scan')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: isDark ? '#213329' : colors.primaryDark },
              ]}
            >
              <Text style={[styles.actionGlyph, { color: colors.accent }]}>⌁</Text>
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.primaryActionTitle, { color: colors.text }]}>
                Scan an item
              </Text>
              <Text
                style={[styles.primaryActionSubtitle, { color: colors.textSecondary }]}
              >
                Point camera at barcode for a quick match
              </Text>
            </View>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryAction, { backgroundColor: colors.cardMuted }]}
            onPress={() => router.push('/search')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.chipBg }]}>
              <Text style={[styles.secondaryGlyph, { color: colors.chipText }]}>⌕</Text>
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.secondaryActionTitle, { color: colors.text }]}>
                Search a product
              </Text>
              <Text
                style={[
                  styles.secondaryActionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Find by name, brand, or barcode digits
              </Text>
            </View>
            <Text style={[styles.secondaryArrow, { color: colors.textSecondary }]}>→</Text>
          </Pressable>
        </View>

        {/* HOW IT WORKS */}
        <View
          style={[
            styles.howCard,
            { backgroundColor: isDark ? '#14201A' : colors.primaryDark },
          ]}
        >
          <Text style={[styles.howEyebrow, { color: colors.heroKicker }]}>
            HOW SHOPTRIP WORKS
          </Text>
          <View style={styles.steps}>
            <Step
              number="01"
              title="Find"
              body="Scan a barcode in the aisle or search the database."
              accentColor={colors.accent}
            />
            <View
              style={[
                styles.stepLine,
                { backgroundColor: isDark ? '#243A2F' : '#2D5948' },
              ]}
            />
            <Step
              number="02"
              title="Compare"
              body="Review verified recorded retailer offers in one clear view."
              accentColor={colors.accent}
            />
            <View
              style={[
                styles.stepLine,
                { backgroundColor: isDark ? '#243A2F' : '#2D5948' },
              ]}
            />
            <Step
              number="03"
              title="Decide"
              body="Organize your cart and checkout with full confidence."
              accentColor={colors.accent}
            />
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          Database-backed shopping assistant. Prices reflect verified recorded offers.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({
  number,
  title,
  body,
  accentColor,
}: {
  number: string;
  title: string;
  body: string;
  accentColor: string;
}) {
  return (
    <View style={styles.step}>
      <Text style={[styles.stepNumber, { color: accentColor }]}>{number}</Text>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  topbar: {
    paddingTop: 10,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topbarActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  accountBadgeText: { fontSize: 11, fontWeight: '800' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800' },
  hero: { borderRadius: 28, padding: 25, paddingTop: 28, overflow: 'hidden', marginTop: 10 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.05 },
  heroTitle: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.7,
    marginTop: 14,
  },
  heroDescription: {
    color: '#D7E5DC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    maxWidth: 320,
  },
  heroButton: {
    minHeight: 52,
    marginTop: 24,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroButtonText: { fontSize: 14, fontWeight: '800' },
  heroButtonArrow: { fontSize: 20, fontWeight: '700' },
  insightCard: {
    marginTop: 14,
    padding: 20,
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.9 },
  insightValue: { fontSize: 31, fontWeight: '800', letterSpacing: -1.1, marginTop: 3 },
  insightCaption: { fontSize: 11, marginTop: 2 },
  insightBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBadgeValue: { fontWeight: '800', fontSize: 20 },
  insightBadgeLabel: { fontSize: 8, letterSpacing: 0.8, fontWeight: '800', marginTop: 1 },
  sectionHeading: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  sectionHint: { fontSize: 9, fontWeight: '800', letterSpacing: 0.85 },
  actionStack: { gap: 10 },
  primaryAction: {
    borderRadius: 18,
    padding: 15,
    minHeight: 82,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryAction: {
    borderRadius: 18,
    padding: 15,
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGlyph: { fontSize: 27, fontWeight: '600', marginTop: -3 },
  secondaryGlyph: { fontSize: 28, fontWeight: '500', marginTop: -4 },
  actionCopy: { flex: 1, marginLeft: 13 },
  primaryActionTitle: { fontSize: 15, fontWeight: '800' },
  primaryActionSubtitle: { fontSize: 11, marginTop: 3 },
  secondaryActionTitle: { fontSize: 15, fontWeight: '800' },
  secondaryActionSubtitle: { fontSize: 11, marginTop: 3 },
  actionArrow: { fontSize: 18 },
  secondaryArrow: { fontSize: 18 },
  howCard: { marginTop: 26, borderRadius: 23, padding: 21 },
  howEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  steps: { marginTop: 16 },
  step: { flexDirection: 'row' },
  stepLine: { width: 1, height: 16, marginLeft: 12, marginVertical: 4 },
  stepNumber: {
    width: 34,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingTop: 2,
  },
  stepCopy: { flex: 1 },
  stepTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  stepBody: {
    color: '#BED0C4',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
    paddingRight: 8,
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 20,
  },
});
