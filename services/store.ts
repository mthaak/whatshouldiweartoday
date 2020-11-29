import { Gender } from '../common/enums';
import UserProfile from '../common/UserProfile';
import Time from '../common/Time';
import { AsyncStorage } from 'react-native';

const INITIAL_PROFILE = new UserProfile(
  null,
  Gender.MAN,
  null,
  [0, 1, 2, 3, 4, 5, 6],
  new Time(8, 30),
  new Time(17, 30),
  'C',
  null
);

export async function initializeStorage() {
  let existingProfile = await retrieveProfile();
  existingProfile = null;
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
    let object = JSON.parse(await AsyncStorage.getItem('@store:profile'));
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
