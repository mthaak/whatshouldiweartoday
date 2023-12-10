import Constants from "expo-constants";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import UserProfile from "../common/UserProfile";
import { styles as gStyles } from "../constants/styles";
import Store from "../services/Store";
import { stopBackgroundTasks } from "../services/background";

type SettingsScreenState = {
  profile: UserProfile | null;
};

export default class SettingsScreen extends React.Component<
  any,
  SettingsScreenState
> {
  navigation: any;
  namePlaceholder: string;

  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { profile: null };

    // Dynamic placeholders need to be set only once at init
    Store.retrieveProfile().then((profile) => {
      this.namePlaceholder = profile.name || "Type your name";
      this.setState({ profile: profile });
    });
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

  handleEdit(key, value) {
    const { profile } = this.state;
    profile[key] = value;

    this.setState({ profile });
    Store.saveProfile(profile);
  }

  resetSettings() {
    this.namePlaceholder = "Type your name";
    Store.resetProfile();
    stopBackgroundTasks();
  }

  render() {
    const { profile } = this.state;
    if (profile == null) {
      return <Text>Loading...</Text>;
    }

    return (
      <>
        <View style={styles.container}>
          <View style={styles.list}>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Name
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Input
                placeholder={this.namePlaceholder}
                onChangeText={(value) => this.handleEdit("name", value)}
                style={styles.inputStyle}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Gender
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.ButtonGroup
                buttons={["Man", "Woman"]}
                selectedIndex={profile.gender}
                onPress={(index) => this.handleEdit("gender", index)}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Home
                </ListItem.Title>
              </ListItem.Content>
              <Text style={[styles.grayText]}>
                {profile.home ? profile.home.toString() : "Not set"}
              </Text>
              <ListItem.Chevron
                size={24}
                onPress={() => this.navigation.navigate("Location")}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Commute
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron
                size={24}
                onPress={() => this.navigation.navigate("Commute")}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Alert
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron
                size={24}
                onPress={() => this.navigation.navigate("Alert")}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  Temperature unit
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.ButtonGroup
                buttons={["°C", "°F"]}
                selectedIndex={profile.tempUnit}
                onPress={(index) => this.handleEdit("tempUnit", index)}
              />
            </ListItem>
            <ListItem bottomDivider containerStyle={styles.listItemContainer}>
              <Button
                title="Reset to default settings"
                onPress={() => this.resetSettings()}
                containerStyle={[gStyles.center]}
                titleStyle={[gStyles.normal]}
                raised
              />
            </ListItem>
          </View>
          <Text style={[styles.footer]}>
            Build date: {Constants.expoConfig.extra.buildDate}
          </Text>
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
  inputStyle: {
    color: Colors.darkAccent,
  },
  grayText: {
    color: Colors.darkerGray,
  },
  footer: {
    textAlign: "center",
    color: Colors.gray,
    marginBottom: 5,
  },
});
