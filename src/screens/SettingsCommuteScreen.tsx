import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import WeekdaySelect from "../components/WeekdaySelect";
import { styles as gStyles } from "../constants/styles";
import Time from "../models/Time";
import UserProfile from "../models/UserProfile";
import Store from "../services/Store";

type SettingsCommuteScreenState = {
  profile: UserProfile | null;
  dateTimePickerShown: string | null;
};

export default class SettingsCommuteScreen extends React.Component<
  any,
  SettingsCommuteScreenState
> {
  navigation: any;

  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      profile: null,
      dateTimePickerShown: null,
    };

    this.updateProfile();
  }

  componentDidMount() {
    Store.subscribe(this.updateProfile);
  }

  componentWillUnmount() {
    Store.unsubscribe(this.updateProfile);
  }

  updateProfile = async () => {
    return await Store.retrieveProfile().then(this.setProfile);
  };

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile,
    });
  };

  showDateTimePicker = (timeProp: string) => {
    this.setState({ dateTimePickerShown: timeProp });
  };

  handleTimeEdit = (selectedDate: Date) => {
    if (selectedDate === undefined) {
      return;
    }
    const { profile, dateTimePickerShown } = this.state;
    if (dateTimePickerShown === "leave") {
      profile.commute.leaveTime = new Time(
        selectedDate.getHours(),
        selectedDate.getMinutes(),
      );
    } else if (dateTimePickerShown === "return") {
      profile.commute.returnTime = new Time(
        selectedDate.getHours(),
        selectedDate.getMinutes(),
      );
    }
    this.setState({ profile: profile, dateTimePickerShown: null });
    Store.saveProfile(profile);
  };

  handleCheckboxToggle = (dayIdx: number) => {
    const { profile } = this.state;
    profile.commute.days[dayIdx] = !profile.commute.days[dayIdx];
    this.setState({ profile: profile });
    Store.saveProfile(profile);
  };

  render() {
    const { profile, dateTimePickerShown } = this.state;
    if (profile === null) {
      return <Text>Loading...</Text>;
    }

    let pickerValue;
    if (dateTimePickerShown) {
      let time;
      if (dateTimePickerShown === "leave") {
        time = this.state.profile.commute.leaveTime;
      } else if (dateTimePickerShown === "return") {
        time = this.state.profile.commute.returnTime;
      }
      if (time?.hours && time.minutes) {
        pickerValue = new Date(2000, 1, 1, time.hours, time.minutes);
      } else {
        pickerValue = new Date(2000, 1, 1, 8, 0); // default is 8 am
      }
    }

    return (
      <>
        <View style={styles.container}>
          <View style={styles.list}>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Commute days
                </ListItem.Title>
                <WeekdaySelect
                  values={profile.commute.days}
                  onToggle={this.handleCheckboxToggle}
                />
              </ListItem.Content>
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Leave time
                </ListItem.Title>
              </ListItem.Content>
              <Button
                title={
                  profile.commute.leaveTime != null
                    ? profile.commute.leaveTime.toString()
                    : ""
                }
                onPress={() => this.showDateTimePicker("leave")}
                titleStyle={[gStyles.normal]}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Return time
                </ListItem.Title>
              </ListItem.Content>
              <Button
                title={
                  profile.commute.returnTime != null
                    ? profile.commute.returnTime.toString()
                    : ""
                }
                onPress={() => this.showDateTimePicker("return")}
                titleStyle={[gStyles.normal]}
              />
            </ListItem>
          </View>

          {this.state.dateTimePickerShown && (
            <DateTimePicker
              testID="dateTimePicker"
              value={pickerValue}
              mode="time"
              is24Hour
              display="default"
              onChange={(event, selectedTime) =>
                this.handleTimeEdit(selectedTime)
              }
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
  listItemContainer: {
    backgroundColor: "white",
  },
  listItemTitle: {
    color: Colors.darkAccent,
  },
  checkboxContainer: {
    marginLeft: 0,
    marginRight: 0,
    padding: 5,
  },
});
