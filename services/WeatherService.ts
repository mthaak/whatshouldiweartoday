import { EventEmitter } from 'eventemitter3'
import { OPENWEATHERMAP_APPID } from '@env'
import { TemperatureUnit } from '../common/enums'
import WeatherForecast from '../common/WeatherForecast'
import Location from '../common/Location'

const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall'
const REFRESH_PERIOD = 900 // minimal time (s) between each forecast refresh

class WeatherService {

  emitter
  weatherPromise: Promise<WeatherForecast> | null = null
  isRefreshing = false
  timeLastRefreshed: number | null = null

  constructor() {
    this.emitter = new EventEmitter()
  }

  async getWeatherAsync(location: Location, unit: TemperatureUnit, forceFresh = false) {
    if (!this.isRefreshing &&
      (!this.weatherPromise
        || !this.timeLastRefreshed
        || (Date.now() - this.timeLastRefreshed) / 1E3 > REFRESH_PERIOD
        || forceFresh)) {
      this.isRefreshing = true
      this.weatherPromise = this.retrieveWeather(location, unit).then(weather => {
        this.timeLastRefreshed = Date.now()
        this.emitter.emit('update')
        return weather
      }).finally(() => this.isRefreshing = false)
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

  subscribe(callback: any) {
    this.emitter.addListener('update', callback)
  }

  unsubscribe(callback: any) {
    this.emitter.removeListener('update', callback)
  }
}

const weatherService = new WeatherService()

export default weatherService
