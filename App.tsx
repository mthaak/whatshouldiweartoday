import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { useFonts, Lato_400Regular } from '@expo-google-fonts/lato';
import Constants from 'expo-constants';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import Store from './services/Store';
import LocationService from './services/LocationService';
import { NotificationService } from './services/NotificationService';
import { setUpBackgroundTasks } from './services/background';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  let [areFontsLoaded] = useFonts({
    Lato_400Regular,
  });

  Store.initializeStorage();

  // LocationService.setEnabled(false);
  if (Constants.platform.web) {
    LocationService.requestPermission();
    // Notifications and background tasks not supported in web
  } else if (Constants.platform.android || Constants.platform.ios) {
    Promise.all([
      LocationService.requestPermission(),
      NotificationService.requestPermission()
    ]).then((values) => {
      if (values.every(Boolean))
        setUpBackgroundTasks()
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
