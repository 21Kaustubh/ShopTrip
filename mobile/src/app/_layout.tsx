import { Stack } from 'expo-router';
import { TripProvider } from '../context/TripContext';

export default function RootLayout() {
  return (
    <TripProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </TripProvider>
  );
}