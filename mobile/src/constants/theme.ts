import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#163027',
    background: '#F6F7F3',
    backgroundElement: '#E8EDE2',
    backgroundSelected: '#EDF4D8',
    textSecondary: '#65756C',
  },
  dark: {
    text: '#F2F6F3',
    background: '#0D1511',
    backgroundElement: '#213329',
    backgroundSelected: '#263C30',
    textSecondary: '#A2B4AA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const ThemeTokens = {
  light: {
    isDark: false,
    background: '#F6F7F3',
    card: '#FFFFFF',
    cardBorder: '#E2E5DD',
    cardMuted: '#F7F8F5',
    text: '#163027',
    textSecondary: '#65756C',
    textMuted: '#84908A',
    primary: '#1D4438',
    primaryDark: '#17382D',
    accent: '#D8F28A',
    accentText: '#17382D',
    chipBg: '#E8EDE2',
    chipText: '#1D4438',
    badgeBg: '#EDF4D8',
    badgeText: '#254A3D',
    heroBg: '#1D4438',
    heroText: '#FFFFFF',
    heroKicker: '#C8DE98',
    inputBg: '#FFFFFF',
    inputBorder: '#D4DDD1',
    inputText: '#163027',
    inputPlaceholder: '#85938B',
    successDot: '#2E7D32',
    warningDot: '#D97706',
    dangerText: '#A03E3E',
    border: '#E2E5DD',
    topbarBg: '#F6F7F3',
  },
  dark: {
    isDark: true,
    background: '#0D1511',
    card: '#16221C',
    cardBorder: '#23362C',
    cardMuted: '#1B2A23',
    text: '#F2F6F3',
    textSecondary: '#A2B4AA',
    textMuted: '#7A8C82',
    primary: '#D8F28A',
    primaryDark: '#1F332A',
    accent: '#D8F28A',
    accentText: '#17382D',
    chipBg: '#213329',
    chipText: '#D8F28A',
    badgeBg: '#263C30',
    badgeText: '#D8F28A',
    heroBg: '#162620',
    heroText: '#FFFFFF',
    heroKicker: '#C8DE98',
    inputBg: '#131F19',
    inputBorder: '#2C4237',
    inputText: '#F2F6F3',
    inputPlaceholder: '#6E8177',
    successDot: '#4CAF50',
    warningDot: '#F59E0B',
    dangerText: '#E57373',
    border: '#23362C',
    topbarBg: '#0D1511',
  },
} as const;

export type AppThemeTokens = {
  isDark: boolean;
  background: string;
  card: string;
  cardBorder: string;
  cardMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  accentText: string;
  chipBg: string;
  chipText: string;
  badgeBg: string;
  badgeText: string;
  heroBg: string;
  heroText: string;
  heroKicker: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  successDot: string;
  warningDot: string;
  dangerText: string;
  border: string;
  topbarBg: string;
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
