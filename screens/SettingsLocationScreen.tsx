import React from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header, CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import LocationService from '../services/LocationService'
import Time from '../common/Time';
import * as colors from '../constants/colors';
import Store from '../services/Store';
import { styles as gStyles } from '../constants/styles';

export default class SettingsLocationScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = {
      profile: null,
      currentLocation: false,
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

  updateProfile = () => {
    return Store.retrieveProfile().then(this.setProfile);
  }

  updateLocation = () => {
    return LocationService.getLocationAsync().then(this.setLocation);
  }

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile
    });
  }

  setLocation = (location: String) => {
    this.setState({
      currentLocation: location,
    });
  }

  setHomeLocationToCurrent = () => {
    const { profile, currentLocation } = this.state;
    profile.home = currentLocation;
    this.setState({ profile: profile });
    Store.saveProfile(profile);
  }

  render() {
    const { profile, currentLocation } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    return (
      <>
        <View style={styles.container}>
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.list}>
                  <ListItem>
                    <ListItem.Content>
                      <ListItem.Title>
                        Home
                      </ListItem.Title>
                    </ListItem.Content>
                    <Text>
                      {profile.home ? profile.home.toString() : "Not set"}
                    </Text>
                  </ListItem>
                  <ListItem containerStyle={{ paddingTop: 0 }} >
                    <View style={[gStyles.center]}>
                      <ListItem.Subtitle style={[gStyles.small, gStyles.centerText]}>
                        Current location: {currentLocation ? currentLocation.toString() : "Unknown"}
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
              </>
            }
          />
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
});
