import * as ExpoLocation from 'expo-location';

import { store } from './store';

import Location from './Location'

const GEOCODING_API_KEY = 'AIzaSyCNvBOIe9kVFwueb6RaOfQlfnQO9bUtNVw';
ExpoLocation.setApiKey(GEOCODING_API_KEY); // renamed to setGoogleApiKey later

let permission = null;

export async function requestPermission() {
  permission = (await ExpoLocation.requestPermissionsAsync()).status;
  if (permission !== 'granted')
    console.log('Permission to use location not given by user')
}

export async function updateLocation() {
  if (permission === 'granted') {
    let location = await ExpoLocation.getCurrentPositionAsync({});

    let addressResults = await ExpoLocation.reverseGeocodeAsync(location.coords);

    let city = getCity(addressResults)
    if (city) {
      store.profile.home = new Location(location.coords.latitude, location.coords.longitude, city);
    } else {
      store.profile.home = new Location(location.coords.latitude, location.coords.longitude, city);
      console.log('Could not extract city from reverse geocode')
    }
  }
}

function getCity(results: Array) {
  let found = results.find(result => 'city' in result);
  if (found)
    return found.city;
  else
    return null;
}
