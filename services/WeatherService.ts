import { EventEmitter } from 'eventemitter3'
import { isToday, isInHour } from '../common/timeutils'
import { TemperatureUnit } from '../common/enums'

const weatherFromFile = require('../data/weather_18102020.json');
import { OPENWEATHERMAP_APPID } from '../env'

let OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall'
let LAT = 51.539720;
let LON = -0.097388;
let APPID = OPENWEATHERMAP_APPID;
let UNITS = 'metric';

class WeatherService {

  emitter: EventEmitter;
  weatherPromise: Promise<Object>;

  constructor() {
    this.emitter = new EventEmitter();
    // if (isToday(weatherFromFile['current'].dt)) {
    //   console.log('Using weather forecast from file')
    //   this.weatherPromise = Promise.resolve(this.weatherFromFile);
    // } else {
    //   console.log('Retrieving weather forecast from openweathermap.org...');
    //   this.weatherPromise = this.retrieveWeather();
    // }
  }

  getWeatherAsync(location: Location, unit: TemperatureUnit, forceFresh: bool = false) {
    if (!this.weatherPromise || forceFresh) {
      this.weatherPromise = this.retrieveWeather(location, unit).then(weather => {
        this.emitter.emit('update');
        return weather;
      });
    }
    return this.weatherPromise;
  }

  async retrieveWeather(location: Location, unit: TemperatureUnit): Promise<Object> {
    console.log('Retrieving weather forecast from openweathermap.org...');
    let url = this.buildOpenWeatherMapUrl(location, unit);
    let response = await fetch(url);
    let json = response.json();
    return json;
  }

  buildOpenWeatherMapUrl(location: Location, unit: TemperatureUnit) {
    let lat = location.lat;
    let lon = location.lon;
    var units = 'metric';
    if (unit == TemperatureUnit.FAHRENHEIT)
      units = 'imperial';
    return `${OPENWEATHERMAP_BASE_URL}?lat=${lat}&lon=${lon}&appid=${APPID}&units=${units}&exclude=minutely`
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback);
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback);
  }

}

let weatherService = new WeatherService();

export default weatherService;
