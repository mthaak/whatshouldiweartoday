import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "eventemitter3";

import Time from "../models/Time";
import UserProfile from "../models/UserProfile";
import { Gender, TemperatureUnit } from "../models/enums";

const INITIAL_PROFILE = new UserProfile(
  null,
  Gender.MAN,
  null,
  new UserProfile.Commute(
    [true, true, true, true, true, false, false], // Monday - Sunday
    new Time(8, 30),
    new Time(17, 30),
  ),
  new UserProfile.Alert(
    false,
    [true, true, true, true, true, false, false], // Monday - Sunday
    new Time(7, 30),
  ),
  TemperatureUnit.CELSIUS,
);

class Store {
  emitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  async initializeStorage() {
    // await this.resetProfile();
    const existingProfile = await this.retrieveProfile();
    if (existingProfile === null) {
      this.saveProfile(INITIAL_PROFILE);
    }
  }

  async saveProfile(profile: UserProfile) {
    try {
      await AsyncStorage.setItem("@store:profile", JSON.stringify(profile));
      this.emitter.emit("update");
    } catch (e) {
      console.error("Failed to save the profile to storage");
      throw e;
    }
  }

  async retrieveProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorage.getItem("@store:profile");
      if (profile === null) {
        return null;
      }
      const object = JSON.parse(profile);
      return UserProfile.fromObject(object);
    } catch (e) {
      console.error("Failed to retrieve profile from storage");
      throw e;
    }
  }

  async resetProfile() {
    try {
      return await this.saveProfile(INITIAL_PROFILE);
    } catch (e) {
      console.error("Failed to reset profile");
      throw e;
    }
  }

  subscribe(callback: any) {
    this.emitter.addListener("update", callback);
  }

  unsubscribe(callback: any) {
    this.emitter.removeListener("update", callback);
  }
}

const store = new Store();

export default store;
