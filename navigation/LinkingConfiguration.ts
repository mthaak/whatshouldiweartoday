import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      WeatherScreen: 'Weather',
      SettingsScreen: 'Settings',
      SettingsScreen2: 'Settings2',
      NotFound: '*',
    },
  },
};
