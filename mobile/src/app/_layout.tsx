import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { TripProvider } from '../context/TripContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TripProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </TripProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
