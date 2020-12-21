import React from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import * as Colors from '../constants/Colors';
import * as Store from '../services/store';
import Time from '../common/Time';

export default class SettingsAlertScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null };
    Store.retrieveProfile().then(profile => {
      this.setState({ profile: profile, showDateTimePicker: false });
    });
  }

  handleEnabledEdit(value) {
    const { profile } = this.state;
    profile.alert.enabled = value;

    this.setState({ profile });
    Store.saveProfile(profile);
  }

  toggleDateTimePicker() {
    this.setState({ showDateTimePicker: !this.state.showDateTimePicker })
  }

  handleTimeEdit(selectedDate: Date) {
    if (selectedDate == undefined)
      return;
    const { profile } = this.state;
    profile.alert.time = new Time(selectedDate.getHours(), selectedDate.getMinutes());
    this.setState({ profile: profile, showDateTimePicker: false });
    Store.saveProfile(profile);
  }

  render() {
    const { profile } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    let alertTime = this.state.profile.alert.time;
    var pickerValue;
    if (alertTime && alertTime.hours && alertTime.minutes)
      pickerValue = new Date(2000, 1, 1, alertTime.hours, alertTime.minutes);
    else
      pickerValue = new Date(2000, 1, 1, 8, 0); // default is 8 am

    return (
      <>
        <View style={styles.container}>
          <Header
            leftComponent=<Ionicons name="md-arrow-round-back" size={30} color={Colors.foreground}
          onPress={() => this.navigation.goBack()} />
        />
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.list}>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Enable</ListItem.Title>
                      <ListItem.Subtitle>Turn on push notification</ListItem.Subtitle>
                    </ListItem.Content>
                    <Switch
                      value={profile.alert.enabled}
                      onValueChange={(value) => this.handleEnabledEdit(value)}
                    />
                  </ListItem>
                  <ListItem bottomDivider disabled={!profile.alert.enabled} disabledStyle={styles.disabled}>
                    <ListItem.Content>
                      <ListItem.Title style={profile.alert.enabled ? null : styles.disabled}>
                        Alert time</ListItem.Title>
                    </ListItem.Content>
                    <Badge
                      badgeStyle={profile.alert.enabled ? null : styles.disabled}
                      value={profile.alert.time != null ? profile.alert.time.toString() : ""}
                      onPress={profile.alert.enabled ? () => this.toggleDateTimePicker() : null}
                    />
                  </ListItem>
                </View>
              </>
            }
          />
          {this.state.showDateTimePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={pickerValue}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => this.handleTimeEdit(selectedTime)}
            />
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    borderTopWidth: 1,
    borderColor: Colors.lightAccent,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5,
  },
  disabled: {
    backgroundColor: 'gray',
    color: 'white',
  }
});
