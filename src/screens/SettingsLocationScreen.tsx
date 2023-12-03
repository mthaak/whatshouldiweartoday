import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import Location from "../common/Location";
import UserProfile from "../common/UserProfile";
import { styles as gStyles } from "../constants/styles";
import LocationService from "../services/LocationService";
import Store from "../services/Store";

type SettingsLocationScreenState = {
  profile: UserProfile | null;
  currentLocation: Location | null;
};

export default class SettingsLocationScreen extends React.Component<
  any,
  SettingsLocationScreenState
> {
  navigation: any;

  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      profile: null,
      currentLocation: null,
    };

    this.updateProfile();
    this.updateLocation();
  }

  componentDidMount() {
    Store.subscribe(this.updateProfile);
    LocationService.subscribe(this.updateLocation);
  }

  componentWillUnmount() {
    Store.unsubscribe(this.updateProfile);
    LocationService.unsubscribe(this.updateLocation);
  }

  updateProfile = async () => {
    return await Store.retrieveProfile().then(this.setProfile);
  };

  updateLocation = async () => {
    return await LocationService.getLocationAsync().then(this.setLocation);
  };

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile,
    });
  };

  setLocation = (location: Location) => {
    this.setState({
      currentLocation: location,
    });
  };

  setHomeLocationToCurrent = () => {
    const { profile, currentLocation } = this.state;
    profile.home = currentLocation;
    this.setState({ profile: profile });
    Store.saveProfile(profile);
  };

  render() {
    const { profile, currentLocation } = this.state;
    if (profile == null) {
      return <Text>Loading...</Text>;
    }

    return (
      <>
        <View style={styles.container}>
          <View style={styles.list}>
            <ListItem containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Home
                </ListItem.Title>
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
                  onPress={this.setHomeLocationToCurrent}
                  disabled={!currentLocation}
                  containerStyle={[gStyles.center, { marginTop: 10 }]}
                  titleStyle={[gStyles.normal]}
                  raised
                />
              </View>
            </ListItem>
          </View>
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
  grayText: {
    color: Colors.darkerGray,
  },
});
