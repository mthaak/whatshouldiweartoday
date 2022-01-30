import * as Linking from 'expo-linking'

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      WeatherScreen: 'Weather',
      Settings: {
        path: 'Settings',
        screens: {
          SettingsScreen: 'Main',
          SettingsLocationScreen: 'Location',
          SettingsCommuteScreen: 'Commute',
          SettingsAlertScreen: 'Alert'
        }
      },
      NotFound: '*'
    }
  }
}
