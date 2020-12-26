import * as ExpoLocation from 'expo-location';
import { EventEmitter } from 'eventemitter3'

import * as Store from './store';
import Location from '../common/Location'

import { GOOGLE_GEOCODING_API_KEY } from '../env'

const GEOCODING_API_KEY = GOOGLE_GEOCODING_API_KEY;
ExpoLocation.setGoogleApiKey(GEOCODING_API_KEY);

class LocationService {

  emitter: EventEmitter;
  permission: Promise<String>;
  location: Promise<Object>;
  isEnabled: bool;

  constructor() {
    this.emitter = new EventEmitter();
    this.isEnabled = true; // enablded by default
  }

  async requestPermission() {
    if (!this.isEnabled)
      return;
    let permission = (await ExpoLocation.requestPermissionsAsync()).status;
    if (permission !== 'granted')
      console.error('Permission to use location not given by user')
    return permission;
  }

  async retrieveLocation() {
    if (!this.isEnabled)
      return;
    let location = await ExpoLocation.getCurrentPositionAsync({});
    let results = await ExpoLocation.reverseGeocodeAsync(location.coords);
    let address = results.find(result => 'city' in result); // not all results contain city
    if (address) {
      return new Location(location.coords.latitude,
        location.coords.longitude, address.city, address.country);
    } else {
      return null;
      console.error('Could not extract city from reverse geocode')
    }
    this.emitter.emit('update');
  }

  getPermission(): Promise<String> {
    if (this.permission)
      return this.permission;
    this.permission = this.requestPermission();
    return this.permission;
  }

  getLocationAsync(): Promise<Object> {
    if (this.location)
      return this.location;
    this.location = this.retrieveLocation();
    return this.location;
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback);
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback);
  }

  setEnabled(state: bool) {
    this.isEnabled = state;
  }

  isEnabled() {
    return this.isEnabled;
  }

}

let locationService = new LocationService();

export default locationService;
