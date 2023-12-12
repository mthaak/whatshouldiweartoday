import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import { styles as gStyles } from "../constants/styles";
import Location from "../models/Location";
import UserProfile from "../models/UserProfile";
import LocationService from "../services/LocationService";
import Store from "../services/Store";

const SettingsLocationScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    const updateProfile = async () => {
      const retrievedProfile = await Store.retrieveProfile();
      setProfile(retrievedProfile);
    };

    const updateLocation = async () => {
      const location = await LocationService.getLocationAsync();
      setCurrentLocation(location);
    };

    updateProfile();
    updateLocation();

    Store.subscribe(updateProfile);
    LocationService.subscribe(updateLocation);

    return () => {
      Store.unsubscribe(updateProfile);
      LocationService.unsubscribe(updateLocation);
    };
  }, []);

  const setHomeLocationToCurrent = () => {
    if (!profile || !currentLocation) return;

    const updatedProfile = { ...profile, home: currentLocation };
    setProfile(updatedProfile);
    Store.saveProfile(updatedProfile);
  };

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <ListItem containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemTitle}>Home</ListItem.Title>
          </ListItem.Content>
          <Text style={[styles.grayText]}>
            {profile.home ? profile.home.toString() : "Not set"}
          </Text>
        </ListItem>
        <ListItem containerStyle={styles.listItemContainer}>
          <View style={[gStyles.center]}>
            <ListItem.Subtitle style={[gStyles.small, gStyles.centerText]}>
              Current location:{" "}
              {currentLocation ? currentLocation.toString() : "Unknown"}
            </ListItem.Subtitle>
            <Button
              title="Use current location"
              onPress={setHomeLocationToCurrent}
              disabled={!currentLocation}
              containerStyle={[gStyles.center, { marginTop: 10 }]}
              titleStyle={[gStyles.normal]}
              raised
            />
          </View>
        </ListItem>
      </View>
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
  grayText: {
    color: Colors.darkerGray,
  },
});

export default SettingsLocationScreen;
