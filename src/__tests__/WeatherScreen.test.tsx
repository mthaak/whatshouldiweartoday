import { act, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import WeatherScreen from "../screens/WeatherScreen";
import LocationService from "../services/LocationService";
import Store from "../services/Store";
import WeatherService from "../services/WeatherService";
import {
  mockLocation,
  mockNavigation,
  mockProfile,
  mockWeatherData,
} from "./mockData";

// Mock Expo modules
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 0,
      longitude: 0,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: 0,
  }),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue(null),
}));

jest.mock("expo-asset", () => ({
  Asset: {
    fromModule: jest.fn().mockReturnValue({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock the services
jest.mock("../services/WeatherService");
jest.mock("../services/LocationService");
jest.mock("../services/Store");

// Mock react-native-elements Icon
jest.mock("react-native-elements", () => ({
  Icon: () => "Icon",
  Header: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Button: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("WeatherScreen", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations with delays
    (Store.retrieveProfile as jest.Mock).mockImplementation(() => mockProfile);
    (LocationService.getLocationAsync as jest.Mock).mockImplementation(
      () => mockLocation,
    );
    (WeatherService.getWeatherAsync as jest.Mock).mockImplementation(
      () => mockWeatherData,
    );
  });

  it("shows no data message initially", async () => {
    const { getByText } = render(<WeatherScreen navigation={mockNavigation} />);

    // Check for no data message
    expect(getByText("No weather data available")).toBeTruthy();
  }, 15000);

  it("displays weather data when loaded", async () => {
    const { getByText } = render(<WeatherScreen navigation={mockNavigation} />);

    // Add a small delay to ensure component has time to mount
    await new Promise((resolve) => setTimeout(resolve, 200));

    await waitFor(
      () => {
        expect(getByText("20°C")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  }, 15000);

  it("shows error message when weather fetch fails", async () => {
    // Suppress console.error for this specific test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock weather service to throw error
    (WeatherService.getWeatherAsync as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { getByText } = render(<WeatherScreen navigation={mockNavigation} />);

    // Wait for error message to be displayed
    await waitFor(
      () => {
        expect(getByText(/Failed to fetch weather data/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );

    // Restore console.error
    consoleSpy.mockRestore();
  }, 15000);

  it("refreshes data when pull-to-refresh is triggered", async () => {
    const { getByText } = render(<WeatherScreen navigation={mockNavigation} />);
    
    // Add a small delay to ensure component has time to mount
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Wait for initial data to load
    await waitFor(
      () => {
        expect(getByText("20°C")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    // Trigger refresh by calling refreshData directly
    await act(async () => {
      const scrollView = screen.getByTestId("refresh-control");
      const refreshControl = scrollView.props.refreshControl;
      refreshControl.props.onRefresh();
    });

    // Wait for refresh to complete and verify service calls
    await waitFor(
      () => {
        expect(WeatherService.getWeatherAsync).toHaveBeenCalledTimes(2);
        expect(LocationService.getLocationAsync).toHaveBeenCalledTimes(2);
      },
      { timeout: 10000 },
    );
  }, 15000);
});
