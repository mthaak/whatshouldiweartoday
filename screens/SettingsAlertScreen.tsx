import React from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import Time from '../common/Time';
import * as colors from '../constants/colors';
import store from '../services/store';
import { styles as gStyles } from '../constants/styles';

export default class SettingsAlertScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = {
      profile: null,
      showDateTimePicker: false,
    };

    this.updateProfile();
  }

  componentDidMount() {
    store.subscribe(this.updateProfile);
  }

  componentWillUnmount() {
    store.unsubscribe(this.updateProfile);
  }

  updateProfile = () => {
    return store.retrieveProfile().then(this.setProfile);
  }

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile
    });
  }

  handleEnabledEdit = (value) => {
    const { profile } = this.state;
    profile.alert.enabled = value;

    this.setState({ profile });
    store.saveProfile(profile);
  }

  toggleDateTimePicker = () => {
    this.setState({ showDateTimePicker: !this.state.showDateTimePicker })
  }

  handleTimeEdit = (selectedDate: Date) => {
    if (selectedDate == undefined)
      return;
    const { profile } = this.state;
    profile.alert.time = new Time(selectedDate.getHours(), selectedDate.getMinutes());
    this.setState({ profile: profile, showDateTimePicker: false });
    store.saveProfile(profile);
  }

  render() {
    const { profile, showDateTimePicker } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    if (showDateTimePicker) {
      let alertTime = this.state.profile.alert.time;
      var pickerValue;
      if (alertTime && alertTime.hours && alertTime.minutes)
        pickerValue = new Date(2000, 1, 1, alertTime.hours, alertTime.minutes);
      else
        pickerValue = new Date(2000, 1, 1, 7, 30); // default is 7:30 am
    }

    return (
      <>
        <View style={styles.container}>
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.list}>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Enable</ListItem.Title>
                      <ListItem.Subtitle>Turn on daily push notification</ListItem.Subtitle>
                    </ListItem.Content>
                    <Switch
                      value={profile.alert.enabled}
                      onValueChange={this.handleEnabledEdit}
                    />
                  </ListItem>
                  <ListItem bottomDivider disabled={!profile.alert.enabled} disabledStyle={[styles.disabledBackground]}>
                    <ListItem.Content>
                      <ListItem.Title style={profile.alert.enabled ? null : styles.disabledText}>
                        Alert time</ListItem.Title>
                    </ListItem.Content>
                    <Badge
                      value={profile.alert.time != null ? profile.alert.time.toString() : ''}
                      onPress={profile.alert.enabled ? () => this.toggleDateTimePicker() : null}
                      badgeStyle={[gStyles.badge, profile.alert.enabled ? null : [styles.disabledBackground, styles.disabledBorder]]}
                      textStyle={[gStyles.normal, profile.alert.enabled ? null : styles.disabledText]}
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
    backgroundColor: colors.background,
  },
  list: {
    borderTopWidth: 1,
    borderColor: colors.lightAccent,
  },
  disabledText: {
    color: colors.gray,
  },
  disabledBackground: {
    backgroundColor: colors.lighterGray,
  },
  disabledBorder: {
    borderColor: colors.gray,
  }
});
