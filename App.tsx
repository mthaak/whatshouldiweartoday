import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { useFonts, Lato_400Regular } from '@expo-google-fonts/lato';
import { initializeStorage } from './services/store'
import { View, Text } from 'react-native';

import locationService from './services/LocationService'

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  let [areFontsLoaded] = useFonts({
    Lato_400Regular,
  });

  initializeStorage();

  // locationService.requestPermission().then(permission => {
  //   if (permission === "granted")
  //     locationService.updateLocationEmit();
  // });

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
