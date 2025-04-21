import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import WeekdaySelect from "../components/WeekdaySelect";
import { styles as gStyles } from "../constants/styles";
import Time from "../models/Time";
import UserProfile from "../models/UserProfile";
import Store from "../services/Store";  

const SettingsCommuteScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dateTimePickerShown, setDateTimePickerShown] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const updateProfile = async () => {
      const retrievedProfile = await Store.retrieveProfile();
      setProfile(retrievedProfile);
    };

    const handleMount = async () => {
      await updateProfile();
    };

    handleMount();
    Store.subscribe(updateProfile);

    return () => {
      Store.unsubscribe(updateProfile);
    };
  }, []);

  const showDateTimePicker = (timeProp: string) => {
    setDateTimePickerShown(timeProp);
  };

  const handleTimeEdit = (selectedDate: Date | undefined) => {
    if (!selectedDate || !profile) return;

    setDateTimePickerShown(null);
    const updatedProfile = {
      ...profile,
      commute: {
        ...profile.commute,
        [dateTimePickerShown === "leave" ? "leaveTime" : "returnTime"]:
          new Time(selectedDate.getHours(), selectedDate.getMinutes()),
      },
    };
    setProfile(updatedProfile);
    Store.saveProfile(updatedProfile);
  };

  const handleCheckboxToggle = (dayIdx: number) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      commute: { ...profile.commute, days: [...profile.commute.days] },
    };
    updatedProfile.commute.days[dayIdx] = !updatedProfile.commute.days[dayIdx];

    setProfile(updatedProfile);
    Store.saveProfile(updatedProfile);
  };

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  let pickerValue;
  if (dateTimePickerShown) {
    let time;
    if (dateTimePickerShown === "leave") {
      time = profile.commute.leaveTime;
    } else if (dateTimePickerShown === "return") {
      time = profile.commute.returnTime;
    }
    if (time?.hours && time.minutes) {
      pickerValue = new Date(2000, 1, 1, time.hours, time.minutes);
    } else {
      pickerValue = new Date(2000, 1, 1, 8, 0); // default is 8 am
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemTitle}>
              Commute days
            </ListItem.Title>
            <WeekdaySelect
              values={profile.commute.days}
              onToggle={handleCheckboxToggle}
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
            onPress={() => showDateTimePicker("leave")}
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
            onPress={() => showDateTimePicker("return")}
            titleStyle={[gStyles.normal]}
          />
        </ListItem>
      </View>

      {dateTimePickerShown && (
        <DateTimePicker
          testID="dateTimePicker"
          value={pickerValue ?? new Date()}
          mode="time"
          is24Hour
          display="default"
          onChange={(event, selectedTime) => handleTimeEdit(selectedTime)}
        />
      )}
    </View>
  );
};

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

export default SettingsCommuteScreen;
