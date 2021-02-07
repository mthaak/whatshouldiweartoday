import { EventEmitter } from 'eventemitter3'
import { OPENWEATHERMAP_APPID } from '@env'
import { TemperatureUnit } from '../common/enums'

const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall'

class WeatherService {
  emitter: EventEmitter
  weatherPromise: Promise<WeatherForecast>

  constructor() {
    this.emitter = new EventEmitter()
  }

  async getWeatherAsync(location: Location, unit: TemperatureUnit, forceFresh: bool = false) {
    if (!this.weatherPromise || forceFresh) {
      this.weatherPromise = this.retrieveWeather(location, unit).then(weather => {
        this.emitter.emit('update')
        return weather
      })
    }
    return this.weatherPromise
  }

  async retrieveWeather(location: Location, unit: TemperatureUnit): Promise<WeatherForecast> {
    console.log('Retrieving weather forecast from openweathermap.org...')
    const url = this.buildOpenWeatherMapUrl(location, unit)
    console.log('Fetch ' + url)
    const response = await fetch(url)
    const json = response.json()
    return await json
  }

  buildOpenWeatherMapUrl(location: Location, unit: TemperatureUnit) {
    const lat = location.lat
    const lon = location.lon
    let units = 'metric'
    if (unit == TemperatureUnit.FAHRENHEIT) { units = 'imperial' }
    return `${OPENWEATHERMAP_BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_APPID}&units=${units}&exclude=minutely`
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback)
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback)
  }
}

const weatherService = new WeatherService()

export default weatherService
