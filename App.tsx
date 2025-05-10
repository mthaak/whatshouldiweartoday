import { Lato_400Regular, useFonts } from "@expo-google-fonts/lato";
import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { signInAnonymouslyUser } from "./src/config/firebase";
import useCachedResources from "./src/hooks/useCachedResources";
import useColorScheme from "./src/hooks/useColorScheme";
import Navigation from "./src/navigation";
import LocationService from "./src/services/LocationService";
import Store from "./src/services/Store";

export default function App(): JSX.Element | null {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [areFontsLoaded] = useFonts({
    Lato_400Regular,
  });
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await signInAnonymouslyUser(); // Sign in anonymously
        await Store.initializeStorage();
        await LocationService.requestPermission();
        setIsStoreInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, []);

  if (!isLoadingComplete || !areFontsLoaded || !isStoreInitialized) {
    return null;
  }

  return (
    <SafeAreaProvider testID="app-root">
      <Navigation colorScheme={colorScheme ?? "light"} />
      <StatusBar />
    </SafeAreaProvider>
  );
}
