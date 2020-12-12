import * as ExpoLocation from 'expo-location';
import { EventEmitter } from 'eventemitter3'

import * as Store from './store';
import Location from './Location'

import { GOOGLE_GEOCODING_API_KEY } from '../env'

const GEOCODING_API_KEY = GOOGLE_GEOCODING_API_KEY;
ExpoLocation.setApiKey(GEOCODING_API_KEY); // renamed to setGoogleApiKey later

class LocationService {

  emitter: EventEmitter;
  permission: Promise<String>;
  location: location;

  constructor() {
    this.emitter = new EventEmitter();
  }

  async requestPermission() {
    let permission = (await ExpoLocation.requestPermissionsAsync()).status;
    if (permission !== 'granted')
      console.error('Permission to use location not given by user')
    return permission;
  }

  async updateLocation() {
    let location = await ExpoLocation.getCurrentPositionAsync({});
    let results = await ExpoLocation.reverseGeocodeAsync(location.coords);
    let address = results.find(result => 'city' in result); // not all results contain city
    if (address) {
      this.location = new Location(location.coords.latitude,
        location.coords.longitude, address.city, address.country);
    } else {
      this.location = null;
      console.error('Could not extract city from reverse geocode')
    }
  }

  async updateLocationEmit() {
    this.updateLocation().then(() =>
      this.emitter.emit('update')
    )
  }

  getPermission() {
    if (this.permission)
      return this.permission;
    this.permission = this.requestPermission();
    return this.permission;
  }

  getLocation() {
    return this.location;
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback);
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback);
  }

}

let locationService = new LocationService();

export default locationService;
