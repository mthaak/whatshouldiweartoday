import * as ExpoLocation from 'expo-location';
import { EventEmitter } from 'eventemitter3'

import * as Store from './store';
import Location from '../common/Location'

import { GOOGLE_GEOCODING_API_KEY } from '../env'

const GEOCODING_API_KEY = GOOGLE_GEOCODING_API_KEY;
ExpoLocation.setGoogleApiKey(GEOCODING_API_KEY);

class LocationService {

  emitter: EventEmitter;
  permission: Promise<NotificationPermissionStatus>;
  location: Promise<Object>;
  isEnabled: bool;

  constructor() {
    this.emitter = new EventEmitter();
    this.isEnabled = true; // enabled by default
  }

  async requestPermission() {
    if (!this.isEnabled)
      return;
    let permission = (await ExpoLocation.requestPermissionsAsync());
    if (!permission.granted)
      console.error('Permission to use location not given by user')
    return permission;
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
      this.emitter.emit('update');
    } catch (error) {
      console.error('Could not retrieve current location: ' + error);
      alert('Could not retrieve current location: ' + error);
    }
  }

  getPermission(): Promise<String> {
    if (this.permission)
      return this.permission;
    this.permission = this.requestPermission();
    return this.permission;
  }

  getLocationAsync(forceFresh: bool = false): Promise<Object> {
    if (!this.location || forceFresh) {
      this.location = this.retrieveLocation().then(location => {
        this.emitter.emit('update');
        return location;
      });
    }
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

const locationService = new LocationService();

export default locationService;
