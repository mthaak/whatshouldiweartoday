import * as ExpoLocation from 'expo-location'
import { EventEmitter } from 'eventemitter3'

import Location from '../common/Location'

import { GOOGLE_GEOCODING_API_KEY } from '@env'

ExpoLocation.setGoogleApiKey(GOOGLE_GEOCODING_API_KEY)

const REFRESH_PERIOD = 900 // minimal time (s) between each location refresh

class LocationService {

  emitter: EventEmitter
  permission: Promise<bool>
  hasPermissionGranted: bool = false
  locationPromise: Promise<Record>
  isEnabled: bool = true  // enabled by default
  isRefreshing: bool = false
  timeLastRefreshed: Date

  constructor() {
    this.emitter = new EventEmitter()
    this.isEnabled = true
  }

  async getLocationAsync(forceFresh: bool = false): Promise<Record> {
    if (!this.isRefreshing &&
      (!this.locationPromise
        || !this.timeLastRefreshed
        || (Date.now() - this.timeLastRefreshed) / 1E3 > REFRESH_PERIOD
        || forceFresh)) {
      this.isRefreshing = true
      this.locationPromise = this.retrieveLocation().then(location => {
        if (location) {
          this.timeLastRefreshed = Date.now()
          this.emitter.emit('update')
        }
        return location
      }).finally(() => this.isRefreshing = false)
    }
    return this.locationPromise
  }

  async retrieveLocation() {
    if (!this.isEnabled) { return }
    try {
      const location = await ExpoLocation.getCurrentPositionAsync({})
      const results = await ExpoLocation.reverseGeocodeAsync(location.coords)
      const address = results.find(result => 'city' in result) // not all results contain city
      if (address) {
        return new Location(location.coords.latitude,
          location.coords.longitude, address.city, address.country)
      } else {
        console.error('Could not extract city from reverse geocode')
        return null
      }
    } catch (error) {
      console.error('Could not retrieve current location: ' + error.message)
      alert('Could not retrieve current location: ' + error.message)
      return null
    }
  }

  async getPermission(): Promise<bool> {
    if (this.permission) { return await this.permission }
    this.permission = this.requestPermission()
    return await this.permission
  }

  async requestPermission(): Promise<bool> {
    if (!this.isEnabled) { return }
    this.hasPermissionGranted = false
    const permission = (await ExpoLocation.requestPermissionsAsync())
    if (!permission.granted) {
      console.error('Permission to use location not given by user')
      return false
    }
    this.hasPermissionGranted = true
    return true
  }

  hasPermission(): bool {
    return this.hasPermissionGranted
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback)
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback)
  }

  setEnabled(state: bool) {
    this.isEnabled = state
  }

  isEnabled() {
    return this.isEnabled
  }
}

const locationService = new LocationService()

export default locationService
