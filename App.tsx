import { Lato_400Regular, useFonts } from "@expo-google-fonts/lato";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import LocationService from "./services/LocationService";
import { NotificationService } from "./services/NotificationService";
import Store from "./services/Store";
import {
  setUpBackgroundTasks,
  startBackgroundTasks,
  stopBackgroundTasks,
} from "./services/background";

export default function App(): JSX.Element | null {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [areFontsLoaded] = useFonts({
    Lato_400Regular,
  });

  Store.initializeStorage();

  // LocationService.setEnabled(false);

  if (!Constants.platform) return null;

  if (Constants.platform.web) {
    LocationService.requestPermission().then((granted) => {
      if (granted) LocationService.getLocationAsync();
    });
    // Notifications and background tasks not supported in web
  } else if (Constants.platform.android || Constants.platform.ios) {
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
          Store.retrieveProfile().then((profile) => {
            if (profile?.alert.enabled) startBackgroundTasks();
            else stopBackgroundTasks();
          });
        });
      }
    });
  }

  if (!isLoadingComplete || !areFontsLoaded) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
