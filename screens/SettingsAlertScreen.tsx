import React from 'react'
import { View, StyleSheet, Switch } from 'react-native'
import { Text, ListItem, Button } from 'react-native-elements'
import DateTimePicker from '@react-native-community/datetimepicker'

import Time from '../common/Time'
import * as Colors from '../constants/colors'
import Store from '../services/Store'
import { styles as gStyles } from '../constants/styles'
import WeekdaySelect from '../components/WeekdaySelect'
import UserProfile from '../common/UserProfile'
import { updateNotification, startBackgroundTasks, stopBackgroundTasks } from '../services/background'


type SettingsAlertScreenState = {
  profile: UserProfile | null,
  showDateTimePicker: boolean
}

export default class SettingsAlertScreen extends React.Component<any, SettingsAlertScreenState> {

  navigation: any

  constructor(props) {
    super(props)
    this.navigation = props.navigation
    this.state = {
      profile: null,
      showDateTimePicker: false
    }

    this.updateProfile().then(() => {
      const { profile } = this.state
      if (!profile || !profile.home)
        alert('You need to set your home location for the alert to work.')
    })
  }

  componentDidMount() {
    Store.subscribe(this.updateProfile)
  }

  componentWillUnmount() {
    Store.unsubscribe(this.updateProfile)
  }

  updateProfile = async () => {
    return await Store.retrieveProfile().then(this.setProfile)
  }

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile
    })
  }

  handleEnabledEdit = (value: any) => {
    const { profile } = this.state

    if (!profile) return

    profile.alert.enabled = value

    this.setState({ profile, showDateTimePicker: false })
    Store.saveProfile(profile)

    if (profile.alert.enabled) {
      startBackgroundTasks().then(() => {
        updateNotification()
      })
    } else {
      stopBackgroundTasks()
    }
  }

  handleCheckboxToggle = (dayIdx: number) => {
    const { profile } = this.state

    if (!profile) return

    profile.alert.days[dayIdx] = !profile.alert.days[dayIdx]

    this.setState({ profile: profile })
    Store.saveProfile(profile)
  }

  toggleDateTimePicker = () => {
    this.setState({ showDateTimePicker: !this.state.showDateTimePicker })
  }

  handleTimeEdit = (selectedDate: Date) => {
    if (selectedDate == undefined) { return }

    const { profile } = this.state

    if (!profile) return

    profile.alert.time = new Time(selectedDate.getHours(), selectedDate.getMinutes())

    this.setState({ profile: profile, showDateTimePicker: false })
    Store.saveProfile(profile)

    updateNotification()
  }

  render() {
    const { profile, showDateTimePicker } = this.state
    if (!profile) { return <Text>Loading...</Text> }

    let pickerValue
    if (showDateTimePicker) {
      const alertTime = this.state.profile.alert.time
      if (alertTime && alertTime.hours && alertTime.minutes) {
        pickerValue = new Date(2000, 1, 1, alertTime.hours, alertTime.minutes)
      } else {
        pickerValue = new Date(2000, 1, 1, 7, 30) // default is 7:30 am
      }
    }

    const switchEnabled = !!(profile.home)

    return (
      <>
        <View style={styles.container}>
          <View style={styles.list}>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={[styles.listItemTitle, switchEnabled ? null : styles.disabledText]}>
                  Enable
                </ListItem.Title>
                <ListItem.Subtitle style={[styles.listItemTitle, switchEnabled ? null : styles.disabledText]}>
                  Turn on daily push notification
                </ListItem.Subtitle>
              </ListItem.Content>
              <Switch
                value={profile.alert.enabled}
                onValueChange={this.handleEnabledEdit}
                disabled={!switchEnabled}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer} disabled={!profile.alert.enabled}>
              <ListItem.Content>
                <ListItem.Title style={[styles.listItemTitle, profile.alert.enabled ? null : styles.disabledText]}>
                  Alert days
                </ListItem.Title>
                <WeekdaySelect
                  values={profile.alert.days}
                  onToggle={this.handleCheckboxToggle}
                  disabled={!profile.alert.enabled}
                  containerStyleDisabled={[styles.disabledBackground, styles.disabledBorder]}
                  textStyleDisabled={[styles.disabledText]}
                  checkedColorDisabled={Colors.gray}
                />
              </ListItem.Content>
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer} disabled={!profile.alert.enabled}>
              <ListItem.Content>
                <ListItem.Title style={[styles.listItemTitle, profile.alert.enabled ? null : styles.disabledText]}>
                  Alert time
                </ListItem.Title>
              </ListItem.Content>
              <Button
                title={profile.alert.time != null ? profile.alert.time.toString() : ''}
                onPress={profile.alert.enabled ? () => this.toggleDateTimePicker() : undefined}
                titleStyle={[gStyles.normal, profile.alert.enabled ? null : styles.disabledText]}
                disabledTitleStyle={[styles.disabledText]}
                disabled={!profile.alert.enabled}
              />
            </ListItem>
          </View>
          {profile.alert.enabled && this.state.showDateTimePicker && pickerValue && (
            <DateTimePicker
              testID='dateTimePicker'
              value={pickerValue}
              mode='time'
              is24Hour
              display='default'
              onChange={(event, selectedTime) => this.handleTimeEdit(selectedTime)}
            />
          )}
        </View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  list: {
    borderTopWidth: 1,
    borderColor: Colors.lightAccent
  },
  listItemContainer: {
    backgroundColor: 'white'
  },
  listItemTitle: {
    color: Colors.darkAccent
  },
  disabledText: {
    color: Colors.gray
  },
  disabledBackground: {
    backgroundColor: Colors.lighterGray
  },
  disabledBorder: {
    borderColor: Colors.gray
  }
})
