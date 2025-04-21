import Location from "../models/Location";
import Time from "../models/Time";
import UserProfile from "../../shared/types/UserProfile";
import WeatherForecast from "../../shared/types/WeatherForecast";
import { Gender, TemperatureUnit } from "../../shared/types/enums";

export const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn().mockReturnValue(jest.fn()),
};

export const mockProfile: UserProfile = {
  name: null,
  gender: Gender.MAN,
  home: null,
  tempUnit: TemperatureUnit.CELSIUS,
  commute: {
    days: [true, true, true, true, true, false, false], // Monday - Sunday
    leaveTime: new Time(9, 0),
    returnTime: new Time(17, 0),
  },
  alert: {
    enabled: true,
  },
} as UserProfile;

export const mockLocation: Location = {
  lat: 40.7128,
  lon: -74.006,
  city: "New York",
  country: "US",
} as Location;

export const mockWeatherData: WeatherForecast = {
  current: {
    temp: 20,
    feels_like: 19,
    humidity: 65,
    wind_speed: 5,
    weather: [
      {
        main: "Clear",
        description: "clear sky",
        icon: "01d",
      },
    ],
  },
  daily: [
    {
      dt: Date.now() / 1000,
      temp: {
        day: 22,
        min: 18,
        max: 25,
      },
      feels_like: {
        day: 21,
      },
      weather: [
        {
          main: "Clear",
          description: "clear sky",
          icon: "01d",
        },
      ],
    },
  ],
  hourly: [
    {
      dt: Date.now() / 1000,
      temp: 21,
      feels_like: 20,
      weather: [
        {
          main: "Clear",
          description: "clear sky",
          icon: "01d",
        },
      ],
    },
  ],
} as WeatherForecast;
