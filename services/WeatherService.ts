import EventEmitter from 'events'
import { isToday, isInHour } from '../common/timeutils'

const weatherFromFile = require('../data/weather_18102020.json');
import { OPENWEATHERMAP_APPID } from '@env'

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
    if (isToday(weatherFromFile['current'].dt)) {
      console.log('Using weather forecast from file')
      this.weatherPromise = Promise.resolve(this.weatherFromFile);
    } else {
      console.log('Retrieving weather forecast from openweathermap.org...');
      this.weatherPromise = this.retrieveWeather();
    }
  }

  getWeatherAsync() {
    return this.weatherPromise;
  }

  getCurrentWeatherAsync() {
    return this.getWeather()
      .then(weather => weather['current']);
  }

  retrieveWeather(): Promise<Object> {
    return fetch(this.buildOpenWeatherMapUrl())
      .then(response => response.json())
      .catch(error => {
        console.error(error);
      });
  }

  buildOpenWeatherMapUrl() {
    return `${OPENWEATHERMAP_BASE_URL}?lat=${LAT}&lon=${LON}&appid=${APPID}&units=${UNITS}&exclude=minutely`
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
