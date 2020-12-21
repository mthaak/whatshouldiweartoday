import { Gender, TemperatureUnit } from '../common/enums';
import UserProfile from '../common/UserProfile';
import Time from '../common/Time';
import { AsyncStorage } from 'react-native';

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

export async function initializeStorage() {
  resetProfile()
  let existingProfile = await retrieveProfile();
  if (existingProfile == null) {
    saveProfile(INITIAL_PROFILE)
  }
}

export async function saveProfile(profile: UserProfile) {
  try {
    await AsyncStorage.setItem('@store:profile', JSON.stringify(profile))
  } catch (e) {
    console.error('Failed to save the profile to storage');
    throw e;
  }
}

export async function retrieveProfile(): Promise<UserProfile> {
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

export async function resetProfile() {
  try {
    return saveProfile(INITIAL_PROFILE)
  } catch (e) {
    console.error('Failed to reset profile');
    throw e;
  }
}
