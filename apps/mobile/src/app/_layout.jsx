import { useAuth } from "@/utils/auth/useAuth";
import { AuthModal } from "@/utils/auth/useAuthModal";
import { useTheme } from "@/utils/themeStore";
import { initPurchases, logRevenueCatDiagnostics } from "@/utils/purchases";
import { Toast } from "@/components/ui";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Keep branded splash visible until auth/theme are ready, then hide
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const loadTheme = useTheme((s) => s.loadTheme);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    initPurchases();
    if (__DEV__) {
      const t = setTimeout(() => logRevenueCatDiagnostics(), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Don't render app until ready so native splash (from app.json splash config) stays visible
  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="result" />
        </Stack>
        <AuthModal />
        <Toast />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
