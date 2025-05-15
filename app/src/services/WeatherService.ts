import { EventEmitter } from "eventemitter3";

import { retrieveWeather } from "../../../shared/src/services/weather";
import WeatherForecast from "../../../shared/src/types/WeatherForecast";
import { TemperatureUnit } from "../../../shared/src/types/enums";
import Location from "../models/Location";
import ConfigService from "./ConfigService";

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
    const appId = ConfigService.getOpenWeatherMapAppId();
    if (!appId) {
      console.error(
        "OpenWeather API key is not loaded from environment variables",
      );
      throw new Error("OpenWeather API key is missing");
    }

    if (
      !this.isRefreshing &&
      (!this.weatherPromise ||
        !this.timeLastRefreshed ||
        (Date.now() - this.timeLastRefreshed) / 1e3 > REFRESH_PERIOD ||
        forceFresh)
    ) {
      this.isRefreshing = true;
      this.weatherPromise = retrieveWeather(location, unit, appId)
        .then((weather) => {
          this.timeLastRefreshed = Date.now();
          this.emitter.emit("update");
          return weather;
        })
        .finally(() => (this.isRefreshing = false));
    }
    return this.weatherPromise;
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
