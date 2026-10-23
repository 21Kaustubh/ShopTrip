import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { ShopTripLogo } from '../components/ShopTripLogo';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function WelcomeScreen() {
  const { colors, isDark } = useAppTheme();
  const { login, register, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const result =
        mode === 'login'
          ? await login(cleanEmail, password)
          : await register(cleanEmail, password);

      if (result.success) {
        router.replace('/home' as any);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/home' as any);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* SHARED ACCESSIBLE HEADER WITH BACK TO LANDING PAGE */}
      <ScreenHeader
        title="Account & Access"
        eyebrow="ShopTrip"
        fallbackRoute="/"
        backLabel="Back to landing page"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* LOGO & BRAND HEADER */}
          <View style={styles.brandHeroBlock}>
            <ShopTripLogo size="lg" />
            <Text style={[styles.brandHeroSub, { color: colors.textSecondary }]}>
              Organize shopping trips, scan items, and make informed choices.
            </Text>
          </View>

          {/* VALUE PROP CARD */}
          <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}>
            <Text style={[styles.heroKicker, { color: colors.heroKicker }]}>
              SHOPTRIP ACCESS
            </Text>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>
              Sign in or continue as guest.
            </Text>
            <Text style={styles.heroDesc}>
              Create an account to save shopping trips, or explore immediately in guest mode with all local features enabled.
            </Text>
          </View>

          {/* AUTHENTICATION FORM CARD */}
          <View
            style={[
              styles.authCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {/* TAB SELECTOR: LOGIN VS SIGN UP */}
            <View style={[styles.tabBar, { backgroundColor: colors.cardMuted }]}>
              <Pressable
                style={[
                  styles.tab,
                  mode === 'login' && [
                    styles.activeTab,
                    { backgroundColor: colors.card },
                  ],
                ]}
                onPress={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === 'login' }}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: mode === 'login' ? colors.text : colors.textSecondary,
                    },
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tab,
                  mode === 'signup' && [
                    styles.activeTab,
                    { backgroundColor: colors.card },
                  ],
                ]}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === 'signup' }}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        mode === 'signup' ? colors.text : colors.textSecondary,
                    },
                  ]}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* ERROR BANNER */}
            {errorMessage && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: isDark ? '#3E1C1C' : '#FDE8E8' },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    { color: isDark ? '#FCA5A5' : '#991B1B' },
                  ]}
                >
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* INPUT FIELDS */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                EMAIL ADDRESS
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.inputPlaceholder}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* SUBMIT BUTTON */}
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: colors.accent },
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.accentText} />
              ) : (
                <>
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: colors.accentText },
                    ]}
                  >
                    {mode === 'login' ? 'Sign In to ShopTrip' : 'Create ShopTrip Account'}
                  </Text>
                  <Text
                    style={[
                      styles.primaryButtonArrow,
                      { color: colors.accentText },
                    ]}
                  >
                    →
                  </Text>
                </>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                OR
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            {/* CONTINUE AS GUEST ACTION */}
            <Pressable
              style={[styles.guestButton, { backgroundColor: colors.chipBg }]}
              onPress={handleGuest}
              accessibilityRole="button"
              accessibilityLabel="Continue as Guest"
            >
              <View style={styles.guestCopy}>
                <Text style={[styles.guestTitle, { color: colors.chipText }]}>
                  Continue as Guest
                </Text>
                <Text
                  style={[
                    styles.guestSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Explore, scan barcodes, and manage trips locally without creating an account.
                </Text>
              </View>
              <Text style={[styles.guestArrow, { color: colors.chipText }]}>
                →
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeroBlock: {
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  brandHeroSub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 18,
  },
  heroCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
  },
  heroKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 8,
  },
  heroDesc: {
    color: '#D7E5DC',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  authCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButtonArrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
  },
  guestButton: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestCopy: {
    flex: 1,
    paddingRight: 10,
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guestSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  guestArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
});
