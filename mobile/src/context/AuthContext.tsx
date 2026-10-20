import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface UserProfile {
  id: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

const TOKEN_KEY = '@shoptrip_auth_token';
const USER_KEY = '@shoptrip_auth_user';
const GUEST_KEY = '@shoptrip_is_guest';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session or guest choice on app startup
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedGuest = await AsyncStorage.getItem(GUEST_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsGuest(false);
        } else if (storedGuest === 'true') {
          setIsGuest(true);
        } else {
          // Default to guest on initial install until user explicitly logs in or registers
          setIsGuest(true);
        }
      } catch (err) {
        console.warn('Failed to restore authentication session:', err);
        setIsGuest(true);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Login failed. Please verify your credentials.',
        };
      }

      const receivedToken = data.token;
      const receivedUser = data.user;

      setToken(receivedToken);
      setUser(receivedUser);
      setIsGuest(false);

      await AsyncStorage.setItem(TOKEN_KEY, receivedToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      await AsyncStorage.removeItem(GUEST_KEY);

      return { success: true };
    } catch (err: any) {
      console.warn('Login request error:', err);
      return {
        success: false,
        error:
          'Unable to reach authentication server. Please check your network connection or backend configuration.',
      };
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Registration failed. Please try again.',
        };
      }

      const receivedToken = data.token;
      const receivedUser = data.user;

      setToken(receivedToken);
      setUser(receivedUser);
      setIsGuest(false);

      await AsyncStorage.setItem(TOKEN_KEY, receivedToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      await AsyncStorage.removeItem(GUEST_KEY);

      return { success: true };
    } catch (err: any) {
      console.warn('Registration request error:', err);
      return {
        success: false,
        error:
          'Unable to reach authentication server. Please check your network connection or backend configuration.',
      };
    }
  };

  const continueAsGuest = async () => {
    setIsGuest(true);
    setUser(null);
    setToken(null);
    try {
      await AsyncStorage.setItem(GUEST_KEY, 'true');
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (err) {
      console.warn('Error saving guest state:', err);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      setIsGuest(true);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.setItem(GUEST_KEY, 'true');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isGuest,
        isLoading,
        login,
        register,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
