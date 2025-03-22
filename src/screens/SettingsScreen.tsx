import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";

import * as Colors from "../constants/colors";
import { styles as gStyles } from "../constants/styles";
import UserProfile from "../models/UserProfile";
import Store from "../services/Store";
import { stopBackgroundTasks } from "../services/background";

const SettingsScreen: React.FC<any> = (props) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [namePlaceholder, setNamePlaceholder] =
    useState<string>("Type your name");

  const navigation = props.navigation;

  useEffect(() => {
    const handleMount = async () => {
      const retrievedProfile = await Store.retrieveProfile();
      setProfile(retrievedProfile);
      setNamePlaceholder(retrievedProfile?.name ?? "Type your name");
    };

    handleMount();
    Store.subscribe(updateProfile);
    return () => {
      Store.unsubscribe(updateProfile);
    };
  }, []);

  const updateProfile = async () => {
    const retrievedProfile = await Store.retrieveProfile();
    if (retrievedProfile) {
      setProfile(retrievedProfile);
      setNamePlaceholder(retrievedProfile.name ?? "Type your name");
    } else {
      setNamePlaceholder("Type your name");
    }
  };

  const handleEdit = (key: string, value: any) => {
    if (!profile) return;

    const updatedProfile = { ...profile, [key]: value };
    setProfile(updatedProfile);
    Store.saveProfile(updatedProfile);
  };

  const resetSettings = () => {
    setNamePlaceholder("Type your name");
    Store.resetProfile();
    stopBackgroundTasks();
  };

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemTitle}>Name</ListItem.Title>
          </ListItem.Content>
          <ListItem.Input
            placeholder={namePlaceholder}
            onChangeText={(value) => handleEdit("name", value)}
            style={styles.inputStyle}
          />
        </ListItem>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemTitle}>Gender</ListItem.Title>
          </ListItem.Content>
          <ListItem.ButtonGroup
            buttons={["Man", "Woman"]}
            selectedIndex={profile.gender}
            onPress={(index) => handleEdit("gender", index)}
          />
        </ListItem>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemTitle}>Home</ListItem.Title>
          </ListItem.Content>
          <Text style={[styles.grayText]}>
            {profile.home ? profile.home.toString() : "Not set"}
          </Text>
          <ListItem.Chevron
            size={24}
            onPress={() => navigation.navigate("Location")}
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
            onPress={() => navigation.navigate("Commute")}
          />
        </ListItem>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemTitle}>Alert</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron
            size={24}
            onPress={() => navigation.navigate("Alert")}
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
            onPress={(index) => handleEdit("tempUnit", index)}
          />
        </ListItem>
        <ListItem bottomDivider containerStyle={styles.listItemContainer}>
          <Button
            title="Reset to default settings"
            onPress={resetSettings}
            containerStyle={[gStyles.center]}
            titleStyle={[gStyles.normal]}
            raised
          />
        </ListItem>
      </View>
      <Text style={[styles.footer]}>
        Build date: {Constants.expoConfig?.extra?.buildDate ?? "Unknown"}
      </Text>
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

export default SettingsScreen;
