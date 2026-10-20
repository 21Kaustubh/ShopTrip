import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, Text, useColorScheme as useDeviceColorScheme } from 'react-native';

import { ThemeTokens, type AppThemeTokens } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: AppThemeTokens;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = '@shoptrip_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useDeviceColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setThemeState(saved);
        }
      } catch (err) {
        console.warn('Failed to load saved theme preference:', err);
      }
    }
    loadSavedTheme();
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to persist theme preference:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';
  const colors = isDark ? ThemeTokens.dark : ThemeTokens.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light' as ThemeMode,
      isDark: false,
      colors: ThemeTokens.light,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}

/**
 * Accessible header button for switching between light and dark modes.
 */
export function ThemeToggle({ style }: { style?: any }) {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityHint="Toggles between ShopTrip dark and light themes"
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.toggleButton,
        isDark ? styles.toggleButtonDark : styles.toggleButtonLight,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.toggleIcon, isDark ? styles.toggleIconDark : styles.toggleIconLight]}>
        {isDark ? '☼' : '☽'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonLight: {
    backgroundColor: '#E8EDE2',
    borderWidth: 1,
    borderColor: '#D8DFD2',
  },
  toggleButtonDark: {
    backgroundColor: '#213329',
    borderWidth: 1,
    borderColor: '#2F483A',
  },
  toggleIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: -1,
  },
  toggleIconLight: {
    color: '#1D4438',
  },
  toggleIconDark: {
    color: '#D8F28A',
  },
  pressed: {
    opacity: 0.75,
  },
});
