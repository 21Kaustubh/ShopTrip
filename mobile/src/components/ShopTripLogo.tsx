import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export interface ShopTripLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Reusable ShopTrip Logo Component.
 * Features a crisp, geometric shopping-bag symbol with an integrated route-pin motif
 * and the exact brand wordmark "ShopTrip" (both S and T capitalised).
 */
export function ShopTripLogo({
  size = 'md',
  showWordmark = true,
  style,
  accessibilityLabel = 'ShopTrip',
}: ShopTripLogoProps) {
  const { colors, isDark } = useAppTheme();

  const config = {
    sm: {
      bagW: 22,
      bagH: 22,
      handleW: 11,
      handleH: 7,
      handleBorder: 1.8,
      dotSize: 5,
      pinOuter: 10,
      fontSize: 18,
      letterSpacing: -0.6,
      gap: 8,
    },
    md: {
      bagW: 28,
      bagH: 28,
      handleW: 14,
      handleH: 9,
      handleBorder: 2.2,
      dotSize: 6,
      pinOuter: 13,
      fontSize: 22,
      letterSpacing: -0.8,
      gap: 10,
    },
    lg: {
      bagW: 42,
      bagH: 42,
      handleW: 22,
      handleH: 13,
      handleBorder: 3,
      dotSize: 9,
      pinOuter: 19,
      fontSize: 32,
      letterSpacing: -1.2,
      gap: 14,
    },
  }[size];

  // Dynamic brand colors depending on theme
  const bagColor = isDark ? colors.accent : colors.primaryDark;
  const motifColor = isDark ? colors.primaryDark : colors.accent;
  const handleColor = isDark ? colors.accent : colors.primaryDark;

  return (
    <View
      style={[styles.row, { gap: config.gap }, style]}
      accessible
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
    >
      {/* SHOPPING BAG + LOCATION PIN SYMBOL */}
      <View
        style={[
          styles.symbolContainer,
          {
            width: config.bagW,
            height: config.bagH + config.handleH,
          },
        ]}
      >
        {/* Curved Bag Handle */}
        <View
          style={[
            styles.bagHandle,
            {
              width: config.handleW,
              height: config.handleH,
              borderWidth: config.handleBorder,
              borderBottomWidth: 0,
              borderColor: handleColor,
              borderTopLeftRadius: config.handleW / 2,
              borderTopRightRadius: config.handleW / 2,
            },
          ]}
        />

        {/* Bag Body */}
        <View
          style={[
            styles.bagBody,
            {
              width: config.bagW,
              height: config.bagH,
              backgroundColor: bagColor,
              borderRadius: Math.max(5, config.bagW * 0.24),
            },
          ]}
        >
          {/* Location-Pin / Route Motif inside Bag */}
          <View
            style={[
              styles.pinRing,
              {
                width: config.pinOuter,
                height: config.pinOuter,
                borderRadius: config.pinOuter / 2,
                borderColor: motifColor,
                borderWidth: Math.max(1.2, config.handleBorder * 0.7),
              },
            ]}
          >
            <View
              style={[
                styles.pinDot,
                {
                  width: config.dotSize,
                  height: config.dotSize,
                  borderRadius: config.dotSize / 2,
                  backgroundColor: motifColor,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* BRAND WORDMARK: "ShopTrip" with capital S and T */}
      {showWordmark && (
        <View style={styles.wordmarkBox}>
          <Text
            style={[
              styles.wordmark,
              {
                fontSize: config.fontSize,
                letterSpacing: config.letterSpacing,
                color: colors.text,
              },
            ]}
          >
            Shop<Text style={{ color: isDark ? colors.accent : colors.primary }}>Trip</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bagHandle: {
    alignSelf: 'center',
    marginBottom: -1,
  },
  bagBody: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  pinRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {},
  wordmarkBox: {
    justifyContent: 'center',
  },
  wordmark: {
    fontWeight: '800',
    includeFontPadding: false,
  },
});
