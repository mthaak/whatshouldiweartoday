import { EventEmitter } from "eventemitter3";

import Location from "../models/Location";
import WeatherForecast from "../models/WeatherForecast";
import { TemperatureUnit } from "../models/enums";
import ConfigService from "./ConfigService";

const OPENWEATHERMAP_BASE_URL =
  "https://api.openweathermap.org/data/3.0/onecall";
const REFRESH_PERIOD = 900; // minimal time (s) between each forecast refresh

class WeatherService {
  emitter;
  weatherPromise: Promise<WeatherForecast> | null = null;
  isRefreshing = false;
  timeLastRefreshed: number | null = null;

  constructor() {
    this.emitter = new EventEmitter();
  }

  async getWeatherAsync(
    location: Location,
    unit: TemperatureUnit,
    forceFresh = false,
  ) {
    if (
      !this.isRefreshing &&
      (!this.weatherPromise ||
        !this.timeLastRefreshed ||
        (Date.now() - this.timeLastRefreshed) / 1e3 > REFRESH_PERIOD ||
        forceFresh)
    ) {
      this.isRefreshing = true;
      this.weatherPromise = this.retrieveWeather(location, unit)
        .then((weather) => {
          this.timeLastRefreshed = Date.now();
          this.emitter.emit("update");
          return weather;
        })
        .finally(() => (this.isRefreshing = false));
    }
    return this.weatherPromise;
  }

  async retrieveWeather(
    location: Location,
    unit: TemperatureUnit,
  ): Promise<WeatherForecast> {
    const url = this.buildOpenWeatherMapUrl(location, unit);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeather API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url.replace(ConfigService.getOpenWeatherMapAppId(), 'REDACTED'), // Log URL without API key
      });
      throw new Error(
        `OpenWeather API Error: ${response.status} ${response.statusText}`,
      );
    }

    const json = response.json();
    return await json;
  }

  buildOpenWeatherMapUrl(location: Location, unit: TemperatureUnit) {
    const appId = ConfigService.getOpenWeatherMapAppId();
    if (!appId) {
      console.error('OpenWeather API key is not loaded from environment variables');
      throw new Error('OpenWeather API key is missing');
    }

    const lat = location.lat;
    const lon = location.lon;
    let units_system = "metric";
    if (unit === TemperatureUnit.FAHRENHEIT) {
      units_system = "imperial";
    }
    return `${OPENWEATHERMAP_BASE_URL}?lat=${lat}&lon=${lon}&appid=${appId}&units_system=${units_system}&exclude=minutely&version=3.0`;
  }

  subscribe(callback: any) {
    this.emitter.addListener("update", callback);
  }

  unsubscribe(callback: any) {
    this.emitter.removeListener("update", callback);
  }
}

const weatherService = new WeatherService();

export default weatherService;
