import React from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header, CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import Time from '../common/Time';
import * as colors from '../constants/colors';
import store from '../services/store';
import { styles as gStyles } from '../constants/styles';
import WeekdaySelect from '../components/WeekdaySelect';

export default class SettingsCommuteScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = {
      profile: null,
      dateTimePickerShown: false,
      timePropEdited: null,
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

  showDateTimePicker = (timeProp: String) => {
    this.setState({ dateTimePickerShown: timeProp });
  }

  handleTimeEdit = (selectedDate: Date) => {
    if (selectedDate == undefined)
      return;
    const { profile, dateTimePickerShown } = this.state;
    if (dateTimePickerShown == 'leave') {
      profile.commute.leaveTime = new Time(selectedDate.getHours(), selectedDate.getMinutes());
    } else if (dateTimePickerShown == 'return') {
      profile.commute.returnTime = new Time(selectedDate.getHours(), selectedDate.getMinutes());
    }
    this.setState({ profile: profile, dateTimePickerShown: false });
    store.saveProfile(profile);
  }

  handleCheckboxToggle = (dayIdx: int) => {
    const { profile } = this.state;
    profile.commute.days[dayIdx] = !profile.commute.days[dayIdx];
    this.setState({ profile: profile });
    store.saveProfile(profile);
  }

  render() {
    const { profile, dateTimePickerShown } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    if (dateTimePickerShown) {
      var time;
      if (dateTimePickerShown == 'leave')
        time = this.state.profile.commute.leaveTime;
      else if (dateTimePickerShown == 'return')
        time = this.state.profile.commute.returnTime;
      var pickerValue;
      if (time && time.hours && time.minutes)
        pickerValue = new Date(2000, 1, 1, time.hours, time.minutes);
      else
        pickerValue = new Date(2000, 1, 1, 8, 0); // default is 8 am
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
                      <ListItem.Title>
                        Commute days
                      </ListItem.Title>
                      <WeekdaySelect values={profile.commute.days} onToggle={this.handleCheckboxToggle} />
                    </ListItem.Content>
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>
                        Leave time
                        </ListItem.Title>
                    </ListItem.Content>
                    <Button
                      title={profile.commute.leaveTime != null ? profile.commute.leaveTime.toString() : ''}
                      onPress={() => this.showDateTimePicker('leave')}
                      titleStyle={[gStyles.normal]}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>
                        Return time
                        </ListItem.Title>
                    </ListItem.Content>
                    <Button
                      title={profile.commute.returnTime != null ? profile.commute.returnTime.toString() : ''}
                      onPress={() => this.showDateTimePicker('return')}
                      titleStyle={[gStyles.normal]}
                    />
                  </ListItem>
                </View>
              </>
            }
          />
          {this.state.dateTimePickerShown && (
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
  checkboxContainer: {
    marginLeft: 0,
    marginRight: 0,
    padding: 5,
  }
});
