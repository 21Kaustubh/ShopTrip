import { router } from 'expo-router';
import { useState } from 'react';
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

import { useAuth } from '../context/AuthContext';
import { ThemeToggle, useAppTheme } from '../context/ThemeContext';

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
        router.replace('/');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topbar, { borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.mark, { backgroundColor: isDark ? colors.accent : colors.primaryDark }]}>
            <View style={[styles.markDot, { backgroundColor: isDark ? colors.primaryDark : colors.accent }]} />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>shoptrip</Text>
        </View>

        <ThemeToggle />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HERO VALUE PROP */}
          <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}>
            <Text style={[styles.heroKicker, { color: colors.heroKicker }]}>
              SMART IN-STORE COMPANION
            </Text>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>
              Compare at the shelf.{`\n`}Never overpay.
            </Text>
            <Text style={styles.heroDesc}>
              Scan barcodes in the aisle, check online retailer alternatives, and maximize your savings before you reach the checkout counter.
            </Text>
          </View>

          {/* AUTHENTICATION FORM CARD */}
          <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* TAB SELECTOR: LOGIN VS SIGN UP */}
            <View style={[styles.tabBar, { backgroundColor: colors.cardMuted }]}>
              <Pressable
                style={[styles.tab, mode === 'login' && [styles.activeTab, { backgroundColor: colors.card }]]}
                onPress={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
              >
                <Text style={[styles.tabText, { color: mode === 'login' ? colors.text : colors.textSecondary }]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'signup' && [styles.activeTab, { backgroundColor: colors.card }]]}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
              >
                <Text style={[styles.tabText, { color: mode === 'signup' ? colors.text : colors.textSecondary }]}>
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* ERROR BANNER */}
            {errorMessage && (
              <View style={[styles.errorBanner, { backgroundColor: isDark ? '#3E1C1C' : '#FDE8E8' }]}>
                <Text style={[styles.errorText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* INPUT FIELDS */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
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
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
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
            >
              {loading ? (
                <ActivityIndicator color={colors.accentText} />
              ) : (
                <>
                  <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>
                    {mode === 'login' ? 'Log In to ShopTrip' : 'Create Account'}
                  </Text>
                  <Text style={[styles.primaryButtonArrow, { color: colors.accentText }]}>→</Text>
                </>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* CONTINUE AS GUEST ACTION */}
            <Pressable
              style={[styles.guestButton, { backgroundColor: colors.chipBg }]}
              onPress={handleGuest}
            >
              <View style={styles.guestCopy}>
                <Text style={[styles.guestTitle, { color: colors.chipText }]}>
                  Continue as Guest
                </Text>
                <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
                  Explore, scan barcodes, and manage trips locally without creating an account.
                </Text>
              </View>
              <Text style={[styles.guestArrow, { color: colors.chipText }]}>→</Text>
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
  topbar: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.9,
    marginTop: 10,
  },
  heroDesc: {
    color: '#D7E5DC',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  authCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  errorBanner: {
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    outlineStyle: 'none',
  } as any,
  primaryButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButtonArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  guestButton: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestCopy: {
    flex: 1,
    marginRight: 10,
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guestSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  guestArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
});
