import React from 'react';
import { View, Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import App from '../../App';
import WeatherService from '../services/WeatherService';
import LocationService from '../services/LocationService';
import Store from '../services/Store';
import { NotificationService } from '../services/NotificationService';
import { setUpBackgroundTasks, startBackgroundTasks, stopBackgroundTasks } from '../services/background';
import useCachedResources from '../hooks/useCachedResources';
import useColorScheme from '../hooks/useColorScheme';
import { useFonts } from '@expo-google-fonts/lato';
import Constants from 'expo-constants';
import ConfigService from '../services/ConfigService';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { mockProfile, mockLocation, mockWeatherData } from './mockData';

// Define mock components outside of mock factory
const MockNavigation = () => null;
MockNavigation.displayName = 'MockNavigation';

// Mock Navigation component
jest.mock('../navigation', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => {
      return React.createElement(View, { testID: 'navigation-root' }, [
        React.createElement(Text, { key: 'temp' }, '22°C')
      ]);
    }
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  createNavigationContainerRef: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DefaultTheme: {},
  DarkTheme: {},
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: () => null,
  }),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  makeUrl: jest.fn(() => 'test-url'),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getInitialURL: jest.fn(),
  parse: jest.fn(),
  useURL: jest.fn(),
  useLinking: jest.fn(),
}));

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children, testID }: { children: React.ReactNode, testID?: string }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID }, children);
  },
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock the services
jest.mock('../services/WeatherService');
jest.mock('../services/LocationService');
jest.mock('../services/Store');
jest.mock('../services/NotificationService');
jest.mock('../services/background');
jest.mock('../hooks/useCachedResources');
jest.mock('../hooks/useColorScheme');
jest.mock('@expo-google-fonts/lato', () => ({
  useFonts: jest.fn().mockReturnValue([true, null])
}));

// Mock Constants
(Constants.platform as any) = {
  web: false,
  android: true,
  ios: false
};

// Set up test configuration
ConfigService.setOpenWeatherMapAppId('test-api-key');
ConfigService.setGoogleGeocodingApiKey('test-google-api-key');

describe('App', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (WeatherService.getWeatherAsync as jest.Mock).mockResolvedValue(mockWeatherData);
    (LocationService.getLocationAsync as jest.Mock).mockResolvedValue(mockLocation);
    (LocationService.requestPermission as jest.Mock).mockResolvedValue(true);
    (NotificationService.requestPermission as jest.Mock).mockResolvedValue(true);
    (Store.retrieveProfile as jest.Mock).mockResolvedValue(mockProfile);
    (Store.initializeStorage as jest.Mock).mockResolvedValue(undefined);
    (setUpBackgroundTasks as jest.Mock).mockResolvedValue(undefined);
    (useCachedResources as jest.Mock).mockReturnValue(true);
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('renders the weather screen with weather data', async () => {
    // Mock the loading states to be complete immediately
    (useCachedResources as jest.Mock).mockReturnValue(true);
    (useFonts as jest.Mock).mockReturnValue([true, null]);
    
    const { getByTestId, getByText } = render(<App />);
    
    // Wait for the app to load and verify key elements
    await waitFor(() => {
      expect(getByTestId('app-root')).toBeTruthy();
      expect(getByTestId('navigation-root')).toBeTruthy();
      expect(getByText('22°C')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);
}); 