import * as ExpoLocation from 'expo-location';

import * as Store from './store';

import Location from './Location'

import { GOOGLE_GEOCODING_API_KEY } from '@env'

const GEOCODING_API_KEY = GOOGLE_GEOCODING_API_KEY;
ExpoLocation.setApiKey(GEOCODING_API_KEY); // renamed to setGoogleApiKey later

let permission = null;

export async function requestPermission() {
  permission = (await ExpoLocation.requestPermissionsAsync()).status;
  if (permission !== 'granted')
    console.error('Permission to use location not given by user')
}

export async function updateLocation() {
  if (permission === 'granted') {
    let location = await ExpoLocation.getCurrentPositionAsync({});

    let addressResults = await ExpoLocation.reverseGeocodeAsync(location.coords);

    let city = getCity(addressResults)
    let profile = Store.retrieveProfile()
    if (city) {
      profile.home = new Location(location.coords.latitude, location.coords.longitude, city);
    } else {
      profile.home = 'Unknown';
      console.error('Could not extract city from reverse geocode')
    }
    Store.saveProfile(profile);
  }
}

function getCity(results: Array) {
  let found = results.find(result => 'city' in result);
  if (found)
    return found.city;
  else
    return null;
}
