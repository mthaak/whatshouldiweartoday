import '@testing-library/jest-native/extend-expect';

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    platform: {
      web: false,
      android: true,
      ios: false
    }
  }
}));

// Mock expo-fonts
jest.mock('@expo-google-fonts/lato', () => ({
  useFonts: () => [true]
}));

// Mock react-native hooks
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light'
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
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
  useLinking: jest.fn()
})); 