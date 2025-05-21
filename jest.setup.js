import "@testing-library/jest-native/extend-expect";

// Mock expo-constants
jest.mock("expo-constants", () => ({
  default: {
    platform: {
      web: false,
      android: true,
      ios: false,
    },
  },
}));

// Mock expo-fonts
jest.mock("@expo-google-fonts/lato", () => ({
  useFonts: () => [true],
}));

// Mock react-native hooks
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  default: () => "light",
}));

// Mock expo-modules-core
jest.mock("expo-modules-core", () => ({
  Platform: {
    select: jest.fn((obj) => obj.ios),
    OS: "ios",
  },
}));

// Mock expo-localization
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
  getCalendars: () => [{ calendar: "gregorian" }],
  getTimeZone: () => "UTC",
}));

// Mock expo-dev-client
jest.mock("expo-dev-client", () => ({}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
  createURL: jest.fn(),
  makeUrl: jest.fn(() => "test-url"),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getInitialURL: jest.fn(),
  parse: jest.fn(),
  useURL: jest.fn(),
  useLinking: jest.fn(),
}));

// Mock Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  select: jest.fn((obj) => obj.ios),
}));
