import React from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header, CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import Time from '../common/Time';

import * as colors from '../constants/colors';
import * as Store from '../services/store';
import { styles as gStyles } from '../constants/styles';

export default class SettingsCommuteScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = {
      profile: null,
      dateTimePickerShown: false,
      timePropEdited: null,
    };
    Store.retrieveProfile().then(profile => {
      this.setState({ profile: profile });
    });
  }

  showDateTimePicker(timeProp: String) {
    this.setState({ dateTimePickerShown: timeProp });
  }

  handleTimeEdit(selectedDate: Date) {
    if (selectedDate == undefined)
      return;
    const { profile, dateTimePickerShown } = this.state;
    if (dateTimePickerShown == "leave") {
      profile.commute.leaveTime = new Time(selectedDate.getHours(), selectedDate.getMinutes());
    } else if (dateTimePickerShown == "return") {
      profile.commute.returnTime = new Time(selectedDate.getHours(), selectedDate.getMinutes());
    }
    this.setState({ profile: profile, dateTimePickerShown: false });
    Store.saveProfile(profile);
  }

  toggleCheckbox(dayIdx: int) {
    const { profile } = this.state;
    profile.commute.days[dayIdx] = !profile.commute.days[dayIdx];
    this.setState({ profile: profile });
    Store.saveProfile(profile);
  }

  renderCheckboxes() {
    const { profile } = this.state;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) =>
      <CheckBox
        key={i}
        title={name}
        checked={profile.commute.days[i]}
        onPress={() => this.toggleCheckbox(i)}
        size={16}
        containerStyle={[styles.checkboxContainer]}
        textStyle={[styles.checkboxText]}
      />
    );
  }

  render() {
    const { profile, dateTimePickerShown } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    if (dateTimePickerShown) {
      var time;
      if (dateTimePickerShown == "leave")
        time = this.state.profile.commute.leaveTime;
      else if (dateTimePickerShown == "true")
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
                      <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                        {this.renderCheckboxes()}
                      </View>
                    </ListItem.Content>

                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>
                        Leave time
                        </ListItem.Title>
                    </ListItem.Content>
                    <Badge
                      value={profile.commute.leaveTime != null ? profile.commute.leaveTime.toString() : ""}
                      onPress={() => this.showDateTimePicker("leave")}
                      badgeStyle={[gStyles.badge]}
                      textStyle={[gStyles.normal]}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>
                        Return time
                        </ListItem.Title>
                    </ListItem.Content>
                    <Badge
                      value={profile.commute.returnTime != null ? profile.commute.returnTime.toString() : ""}
                      onPress={() => this.showDateTimePicker("return")}
                      badgeStyle={[gStyles.badge]}
                      textStyle={[gStyles.normal]}
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
  },
  checkboxText: {
  },
});
