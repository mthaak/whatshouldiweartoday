import * as ExpoLocation from 'expo-location';
import { EventEmitter } from 'eventemitter3'

import Location from '../common/Location'

import { GOOGLE_GEOCODING_API_KEY } from '@env'

ExpoLocation.setGoogleApiKey(GOOGLE_GEOCODING_API_KEY);

class LocationService {

  emitter: EventEmitter;
  permission: Promise<bool>;
  hasPermissionGranted: bool = false;
  locationPromise: Promise<Object>;
  hasLocation: bool = false;
  isEnabled: bool;

  constructor() {
    this.emitter = new EventEmitter();
    this.isEnabled = true; // enabled by default
  }

  async requestPermission(): Promise<bool> {
    if (!this.isEnabled)
      return;
    this.hasPermissionGranted = false;
    let permission = (await ExpoLocation.requestPermissionsAsync());
    if (!permission.granted) {
      console.error('Permission to use location not given by user');
      return false;
    }
    this.hasPermissionGranted = true;
    return true;
  }

  async retrieveLocation() {
    if (!this.isEnabled)
      return;
    try {
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
    } catch (error) {
      console.error('Could not retrieve current location: ' + error.message);
      alert('Could not retrieve current location: ' + error.message);
      return null;
    }
  }

  getPermission(): Promise<bool> {
    if (this.permission)
      return this.permission;
    this.permission = this.requestPermission();
    return this.permission;
  }

  hasPermission(): bool {
    return this.hasPermissionGranted;
  }

  getLocationAsync(forceFresh: bool = false): Promise<Object> {
    if (!this.locationPromise || !this.hasLocation || forceFresh) {
      this.locationPromise = this.retrieveLocation().then(location => {
        if (location) {
          this.emitter.emit('update');
          this.hasLocation = true;
        }
        return location;
      });
    }
    return this.locationPromise;
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

const locationService = new LocationService();

export default locationService;
