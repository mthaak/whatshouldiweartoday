import { Lato_400Regular, useFonts } from "@expo-google-fonts/lato";
import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./src/hooks/useCachedResources";
import useColorScheme from "./src/hooks/useColorScheme";
import Navigation from "./src/navigation";
import LocationService from "./src/services/LocationService";
import { NotificationService } from "./src/services/NotificationService";
import Store from "./src/services/Store";
import {
  setUpBackgroundTasks,
  startBackgroundTasks,
  stopBackgroundTasks,
} from "./src/services/background";

export default function App(): JSX.Element | null {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [areFontsLoaded] = useFonts({
    Lato_400Regular,
  });
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);
  const [isBackgroundTasksSetUp, setIsBackgroundTasksSetUp] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Store.initializeStorage();
        setIsStoreInitialized(true);
      } catch (error) {
        console.error("Failed to initialize store:", error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const isWeb = Platform.OS === "web";
    const isMobile = Platform.OS === "android" || Platform.OS === "ios";

    if (isWeb) {
      LocationService.requestPermission().then((granted) => {
        if (granted) LocationService.getLocationAsync();
      });
      // Notifications and background tasks not supported in web
    } else if (isMobile && !isBackgroundTasksSetUp) {
      // Wait for permissions before setting up background tasks
      Promise.all([
        LocationService.requestPermission().then((granted) => {
          if (granted) LocationService.getLocationAsync();
          return granted;
        }),
        NotificationService.requestPermission(),
      ]).then((values) => {
        if (values.every(Boolean)) {
          // if has all permissions
          setUpBackgroundTasks().then(() => {
            setIsBackgroundTasksSetUp(true);
            Store.retrieveProfile().then((profile) => {
              if (profile?.alert.enabled) startBackgroundTasks();
              else stopBackgroundTasks();
            });
          });
        }
      });
    }
  }, [isBackgroundTasksSetUp]);

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
