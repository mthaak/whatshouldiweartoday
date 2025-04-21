import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "eventemitter3";
import { httpsCallable } from "firebase/functions";

import { auth, functions } from "../config/firebase";
import Time from "../models/Time";
import UserProfile from "../models/UserProfile";
import { Gender, TemperatureUnit } from "../../shared/src/types/enums";

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
  emitter: EventEmitter;

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
      if (!auth.currentUser) return;

      // Save to Firestore
      const updateProfile = httpsCallable(functions, "updateProfile");
      await updateProfile({
        profile: {
          name: profile.name,
          gender: profile.gender,
          home: profile.home
            ? {
                lat: profile.home.lat,
                lon: profile.home.lon,
              }
            : null,
          commute: {
            days: profile.commute.days,
            leaveTime: {
              hours: profile.commute.leaveTime.hours,
              minutes: profile.commute.leaveTime.minutes,
            },
            returnTime: {
              hours: profile.commute.returnTime.hours,
              minutes: profile.commute.returnTime.minutes,
            },
          },
          alert: {
            days: profile.alert.days,
            enabled: profile.alert.enabled,
            time: {
              hours: profile.alert.time.hours,
              minutes: profile.alert.time.minutes,
            },
          },
          tempUnit: profile.tempUnit,
        },
        timezone: Localization.timezone,
      });
      console.log("Profile saved to Firestore");

      // Save to local storage
      await AsyncStorage.setItem("@store:profile", JSON.stringify(profile));
      this.emitter.emit("update");
    } catch (e) {
      console.error("Failed to save the profile:", e);
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

  subscribe(callback: () => void) {
    this.emitter.addListener("update", callback);
  }

  unsubscribe(callback: () => void) {
    this.emitter.removeListener("update", callback);
  }
}

const store = new Store();

export default store;
