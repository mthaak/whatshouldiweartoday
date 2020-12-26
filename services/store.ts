import { Gender, TemperatureUnit } from '../common/enums';
import UserProfile from '../common/UserProfile';
import Time from '../common/Time';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'eventemitter3'

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
    true,
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
    let existingProfile = await this.retrieveProfile();
    if (existingProfile == null) {
      this.saveProfile(INITIAL_PROFILE)
    }
  }

  async saveProfile(profile: UserProfile) {
    try {
      await AsyncStorage.setItem('@store:profile', JSON.stringify(profile));
      this.emitter.emit('update');
    } catch (e) {
      console.error('Failed to save the profile to storage');
      throw e;
    }
  }

  async retrieveProfile(): Promise<UserProfile> {
    try {
      let profile = await AsyncStorage.getItem('@store:profile');
      if (profile === null)
        return null;
      let object = JSON.parse(profile);
      return UserProfile.fromObject(object);
    } catch (e) {
      console.error('Failed to retrieve profile from storage');
      throw e;
    }
  }

  async resetProfile() {
    try {
      return this.saveProfile(INITIAL_PROFILE)
    } catch (e) {
      console.error('Failed to reset profile');
      throw e;
    }
  }

  subscribe(callback) {
    this.emitter.addListener('update', callback);
  }

  unsubscribe(callback) {
    this.emitter.removeListener('update', callback);
  }

}

let store = new Store();

export default store;
