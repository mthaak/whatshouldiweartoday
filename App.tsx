import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { useFonts, Lato_400Regular } from '@expo-google-fonts/lato';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import store from './services/store';
import locationService from './services/LocationService';
import { notificationService } from './services/NotificationService';
import { setUpBackgroundTasks } from './services/background';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  let [areFontsLoaded] = useFonts({
    Lato_400Regular,
  });

  store.initializeStorage();

  // locationService.setEnabled(false);
  Promise.all([
    locationService.requestPermission(),
    notificationService.requestPermission()
  ]).then(() => setUpBackgroundTasks());

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
