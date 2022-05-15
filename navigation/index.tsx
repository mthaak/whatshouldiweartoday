import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { ColorSchemeName } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import LinkingConfiguration from './LinkingConfiguration'
import { theme } from '../constants/RNE-Theme'

import NotFoundScreen from '../screens/NotFoundScreen'

import * as colors from '../constants/colors'

import WeatherScreen from '../screens/WeatherScreen'
import SettingsScreen from '../screens/SettingsScreen'
import SettingsLocationScreen from '../screens/SettingsLocationScreen'
import SettingsAlertScreen from '../screens/SettingsAlertScreen'
import SettingsCommuteScreen from '../screens/SettingsCommuteScreen'

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <ThemeProvider theme={theme}>
        <RootNavigator />
      </ThemeProvider>
    </NavigationContainer>
  )
}

type RootStackParamList = any;
type SettingsStackParamList = any;

// // A root stack navigator is often used for displaying modals on top of all other content
// // Read more here: https://reactnavigation.org/docs/modal
// const Stack = createStackNavigator<RootStackParamList>();

const RootStack = createStackNavigator()
const SettingsStack = createStackNavigator()

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background }
      }}
    >
      <SettingsStack.Screen name='Main' component={SettingsScreen} />
      <SettingsStack.Screen name='Location' component={SettingsLocationScreen} />
      <SettingsStack.Screen name='Alert' component={SettingsAlertScreen} />
      <SettingsStack.Screen name='Commute' component={SettingsCommuteScreen} />
    </SettingsStack.Navigator>
  )
}

function RootNavigator() {
  return (
    <RootStack.Navigator initialRouteName='Weather' screenOptions={{ headerShown: false }}>
      <RootStack.Screen name='Weather' component={WeatherScreen} />
      <RootStack.Screen name='Settings' component={SettingsNavigator} />
      <RootStack.Screen name='NotFound' component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </RootStack.Navigator>
  )
}

export {
  RootStackParamList,
  SettingsStackParamList,
}
