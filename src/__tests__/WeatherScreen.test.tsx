import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import WeatherScreen from '../screens/WeatherScreen';
import WeatherService from '../services/WeatherService';
import LocationService from '../services/LocationService';
import Store from '../services/Store';
import { mockNavigation, mockProfile, mockLocation, mockWeatherData } from './mockData';

// Mock the services
jest.mock('../services/WeatherService');
jest.mock('../services/LocationService');
jest.mock('../services/Store');

// Mock react-native-elements Icon
jest.mock('react-native-elements', () => ({
  Icon: () => 'Icon',
  Header: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Button: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('WeatherScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations with delays
    (Store.retrieveProfile as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockProfile), 100))
    );
    (LocationService.getLocationAsync as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockLocation), 100))
    );
    (WeatherService.getWeatherAsync as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockWeatherData), 100))
    );
  });

  it('shows no data message initially', async () => {
    const { getByText } = render(<WeatherScreen navigation={mockNavigation} />);
    
    // Check for no data message
    expect(getByText('No weather data available')).toBeTruthy();

    // Wait for data to load
    await waitFor(() => {
      expect(getByText('22°C')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('displays weather data when loaded', async () => {
    const { getByText } = render(
      <WeatherScreen navigation={mockNavigation} />
    );

    // Wait for weather data to be displayed
    await waitFor(() => {
      expect(getByText('22°C')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('shows error message when weather fetch fails', async () => {
    // Mock weather service to throw error
    (WeatherService.getWeatherAsync as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { getByText } = render(
      <WeatherScreen navigation={mockNavigation} />
    );

    // Wait for error message to be displayed
    await waitFor(() => {
      expect(getByText(/Failed to fetch weather data/i)).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('refreshes data when pull-to-refresh is triggered', async () => {
    const { getByTestId, getByText } = render(<WeatherScreen navigation={mockNavigation} />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(getByText('22°C')).toBeTruthy();
    }, { timeout: 10000 });

    // Trigger refresh by calling refreshData directly
    await act(async () => {
      const scrollView = getByTestId('refresh-control');
      const refreshControl = scrollView.props.refreshControl;
      refreshControl.props.onRefresh();
    });

    // Wait for refresh to complete and verify service calls
    await waitFor(() => {
      expect(WeatherService.getWeatherAsync).toHaveBeenCalledTimes(2);
      expect(LocationService.getLocationAsync).toHaveBeenCalledTimes(2);
    }, { timeout: 10000 });
  }, 15000);
}); 