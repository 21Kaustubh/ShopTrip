import { router } from 'expo-router';
import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeToggle, useAppTheme } from '../context/ThemeContext';

export interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  showBack?: boolean;
  backLabel?: string;
  fallbackRoute?: string;
  onBack?: () => void;
  rightElement?: ReactNode;
}

/**
 * Reusable header component for secondary screens.
 * Provides accessible, safe back navigation with fallback protection,
 * consistent ShopTrip branding, and integrated theme switching.
 */
export function ScreenHeader({
  title,
  eyebrow = 'ShopTrip',
  showBack = true,
  backLabel = 'Go back',
  fallbackRoute = '/home',
  onBack,
  rightElement,
}: ScreenHeaderProps) {
  const { colors } = useAppTheme();

  const handlePressBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  };

  return (
    <View
      style={[
        styles.topbar,
        {
          borderBottomColor: colors.border,
          backgroundColor: colors.topbarBg,
        },
      ]}
    >
      <View style={styles.leftGroup}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.chipBg },
              pressed && styles.pressed,
            ]}
            onPress={handlePressBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backArrow, { color: colors.chipText }]}>←</Text>
          </Pressable>
        )}

        <View style={styles.titlesBox}>
          <Text
            numberOfLines={1}
            style={[styles.eyebrow, { color: colors.textMuted }]}
          >
            {eyebrow}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        {rightElement ? rightElement : <ThemeToggle />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
    marginTop: -2,
  },
  titlesBox: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
