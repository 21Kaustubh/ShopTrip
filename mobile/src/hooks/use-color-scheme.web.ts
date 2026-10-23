import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the
 * client side for web. useSyncExternalStore provides a server snapshot
 * ('light') used during SSR/hydration and the live client value thereafter,
 * without triggering a state-update inside an effect.
 */

// No external store to subscribe to; the color-scheme value is read
// synchronously from the environment on the client.
function subscribe(_callback: () => void) {
  return () => {};
}

export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,   // client snapshot  – always true after hydration
    () => false,  // server snapshot  – false during SSR / static render
  );

  return isHydrated ? colorScheme : 'light';
}
