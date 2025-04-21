import WeatherForecast from "../types/WeatherForecast";
import { TemperatureUnit } from "../types/enums";

const OPENWEATHERMAP_BASE_URL =
  "https://api.openweathermap.org/data/3.0/onecall";

export async function retrieveWeather(
    location: {lat: number, lon: number},
    unit: TemperatureUnit,
    openWeatherMapAppId: string,
  ): Promise<WeatherForecast> {
    const url = buildOpenWeatherMapUrl(location, unit, openWeatherMapAppId);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeather API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url.replace(openWeatherMapAppId, "REDACTED"), // Log URL without API key
      });
      throw new Error(
        `OpenWeather API Error: ${response.status} ${response.statusText}`,
      );
    }

    const json = response.json();
    return await json;
  }

  function buildOpenWeatherMapUrl(location: {lat: number, lon: number}, unit: TemperatureUnit, openWeatherMapAppId: string) {
    const lat = location.lat;
    const lon = location.lon;
    let units = "metric";
    if (unit === TemperatureUnit.FAHRENHEIT) {
      units = "imperial";
    }
    return `${OPENWEATHERMAP_BASE_URL}?lat=${lat}&lon=${lon}&appid=${openWeatherMapAppId}&units=${units}&exclude=minutely&version=3.0`;
  }