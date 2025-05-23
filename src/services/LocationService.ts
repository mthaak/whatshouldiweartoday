import * as ExpoLocation from "expo-location";
import { EventEmitter } from "eventemitter3";

import Location from "../models/Location";
import { ReverseGeocodeResponse } from "../models/ReverseGeocodeResponse";
import ConfigService from "./ConfigService";

const REVERSE_GEOCODE_BASE_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";

const REFRESH_PERIOD = 900; // minimal time (s) between each location refresh

class LocationService {
  emitter;
  permission: Promise<boolean> | null = null;
  hasPermissionGranted = false;
  locationPromise: Promise<Location | null> | null = null;
  isEnabled = true; // enabled by default
  isRefreshing = false;
  timeLastRefreshed: number | null = null;

  constructor() {
    this.emitter = new EventEmitter();
    this.isEnabled = true;
  }

  async getLocationAsync(forceFresh = false): Promise<Location | null> {
    if (
      !this.isRefreshing &&
      (!this.locationPromise ||
        !this.timeLastRefreshed ||
        (Date.now() - this.timeLastRefreshed) / 1e3 > REFRESH_PERIOD ||
        forceFresh)
    ) {
      this.isRefreshing = true;
      this.locationPromise = this.retrieveLocation()
        .then((location) => {
          if (location) {
            this.timeLastRefreshed = Date.now();
            this.emitter.emit("update");
          }
          return location;
        })
        .finally(() => (this.isRefreshing = false));
    }
    return this.locationPromise;
  }

  async retrieveLocation(): Promise<Location | null> {
    if (!this.isEnabled) {
      return null;
    }
    try {
      const location = await ExpoLocation.getCurrentPositionAsync({});
      const address = await this.reverseGeocode(location.coords);
      return new Location(
        location.coords.latitude,
        location.coords.longitude,
        address?.city ?? null,
        address?.country ?? null,
      );
    } catch (error: any) {
      console.error("Could not retrieve current location: " + error.message);
      alert("Could not retrieve current location: " + error.message);
      return null;
    }
  }

  async reverseGeocode(coords: {
    latitude: number;
    longitude: number;
  }): Promise<{ city?: string; country?: string } | null> {
    if (!this.isEnabled) {
      return null;
    }
    try {
      const url = this.buildReverseGeocodeUrl(coords);
      const response = await fetch(url);
      const json = (await response.json()) as ReverseGeocodeResponse;
      if (json.results.length === 0) {
        throw new Error("No results");
      }
      return {
        city: json.results[0].address_components.find(
          (component) =>
            component.types.includes("locality") ||
            component.types.includes("postal_town"),
        )?.long_name,
        country: json.results[0].address_components.find((component) =>
          component.types.includes("country"),
        )?.long_name,
      };
    } catch (error: any) {
      console.error("Could not reverse geocode: " + error.message);
      alert("Could not reverse geocode: " + error.message);
      return null;
    }
  }

  buildReverseGeocodeUrl(coords: { latitude: number; longitude: number }) {
    const apiKey = ConfigService.getGoogleGeocodingApiKey();
    if (!apiKey) {
      throw new Error("Google Geocoding API key is not configured");
    }
    return `${REVERSE_GEOCODE_BASE_URL}?latlng=${coords.latitude},${coords.longitude}&result_type=street_address&key=${apiKey}`;
  }

  async getPermission(): Promise<boolean> {
    if (this.permission) {
      return await this.permission;
    }
    this.permission = this.requestPermission();
    return await this.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }
    this.hasPermissionGranted = false;
    const permissionFg = await ExpoLocation.requestForegroundPermissionsAsync();
    if (!permissionFg.granted) {
      console.error(
        "Permission to use location in foreground not given by user",
      );
      return false;
    }
    return true;
  }

  hasPermission(): boolean {
    return this.hasPermissionGranted;
  }

  subscribe(callback: any) {
    this.emitter.addListener("update", callback);
  }

  unsubscribe(callback: any) {
    this.emitter.removeListener("update", callback);
  }

  setEnabled(state: boolean) {
    this.isEnabled = state;
  }
}

const locationService = new LocationService();

export default locationService;
