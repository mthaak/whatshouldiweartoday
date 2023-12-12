import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import WeekdaySelect from "../components/WeekdaySelect";
import { styles as gStyles } from "../constants/styles";
import Time from "../models/Time";
import UserProfile from "../models/UserProfile";
import Store from "../services/Store";
import {
  startBackgroundTasks,
  stopBackgroundTasks,
  updateNotification,
} from "../services/background";

const SettingsAlertScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

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

  useEffect(() => {
    if (profile && !profile.home) {
      alert("You need to set your home location for the alert to work.");
    }
  }, [profile]);

  const handleEnabledEdit = (value: any) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      alert: { ...profile.alert, enabled: value },
    };
    setProfile(updatedProfile);
    Store.saveProfile(updatedProfile);

    if (updatedProfile.alert.enabled) {
      startBackgroundTasks().then(() => {
        updateNotification();
      });
    } else {
      stopBackgroundTasks();
    }
  };

  const handleCheckboxToggle = (dayIdx: number) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      alert: { ...profile.alert, days: [...profile.alert.days] },
    };
    updatedProfile.alert.days[dayIdx] = !updatedProfile.alert.days[dayIdx];

    setProfile(updatedProfile);
    Store.saveProfile(updatedProfile);
  };

  const toggleDateTimePicker = () => {
    setShowDateTimePicker((prev) => !prev);
  };

  const handleTimeEdit = (selectedDate: Date) => {
    if (selectedDate === undefined) {
      return;
    }

    if (!profile) return;

    const updatedProfile = {
      ...profile,
      alert: {
        ...profile.alert,
        time: new Time(selectedDate.getHours(), selectedDate.getMinutes()),
      },
    };

    setProfile(updatedProfile);
    setShowDateTimePicker(false);
    Store.saveProfile(updatedProfile);

    updateNotification();
  };

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  let pickerValue;
  if (showDateTimePicker) {
    const alertTime = profile.alert.time;
    if (alertTime?.hours && alertTime?.minutes) {
      pickerValue = new Date(2000, 1, 1, alertTime.hours, alertTime.minutes);
    } else {
      pickerValue = new Date(2000, 1, 1, 7, 30); // default is 7:30 am
    }
  }

  const switchEnabled = !!profile.home;

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title
              style={[
                styles.listItemTitle,
                switchEnabled ? null : styles.disabledText,
              ]}
            >
              Enable
            </ListItem.Title>
            <ListItem.Subtitle
              style={[
                styles.listItemTitle,
                switchEnabled ? null : styles.disabledText,
              ]}
            >
              Turn on daily push notification
            </ListItem.Subtitle>
          </ListItem.Content>
          <Switch
            value={profile.alert.enabled}
            onValueChange={handleEnabledEdit}
            disabled={!switchEnabled}
          />
        </ListItem>
        <ListItem
          bottomDivider
          containerStyle={styles.listItemContainer}
          disabled={!profile.alert.enabled}
        >
          <ListItem.Content>
            <ListItem.Title
              style={[
                styles.listItemTitle,
                profile.alert.enabled ? null : styles.disabledText,
              ]}
            >
              Alert days
            </ListItem.Title>
            <WeekdaySelect
              values={profile.alert.days}
              onToggle={handleCheckboxToggle}
              disabled={!profile.alert.enabled}
              containerStyleDisabled={[
                styles.disabledBackground,
                styles.disabledBorder,
              ]}
              textStyleDisabled={[styles.disabledText]}
              checkedColorDisabled={Colors.gray}
            />
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider
          containerStyle={styles.listItemContainer}
          disabled={!profile.alert.enabled}
        >
          <ListItem.Content>
            <ListItem.Title
              style={[
                styles.listItemTitle,
                profile.alert.enabled ? null : styles.disabledText,
              ]}
            >
              Alert time
            </ListItem.Title>
          </ListItem.Content>
          <Button
            title={
              profile.alert.time != null ? profile.alert.time.toString() : ""
            }
            onPress={profile.alert.enabled ? toggleDateTimePicker : undefined}
            titleStyle={[
              gStyles.normal,
              profile.alert.enabled ? null : styles.disabledText,
            ]}
            disabledTitleStyle={[styles.disabledText]}
            disabled={!profile.alert.enabled}
          />
        </ListItem>
      </View>
      {profile.alert.enabled && showDateTimePicker && pickerValue && (
        <DateTimePicker
          testID="dateTimePicker"
          value={pickerValue}
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
  disabledText: {
    color: Colors.gray,
  },
  disabledBackground: {
    backgroundColor: Colors.lighterGray,
  },
  disabledBorder: {
    borderColor: Colors.gray,
  },
});

export default SettingsAlertScreen;
