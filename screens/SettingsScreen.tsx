import React, { useState } from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import { Ionicons } from '@expo/vector-icons';

import { copyString } from '../common/utils';
import * as colors from '../constants/colors';
import store from '../services/store';
import { styles as gStyles } from '../constants/styles';

export default class SettingsScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null };

    // Dynamic placeholders need to be set only once at init
    store.retrieveProfile().then(profile => {
      this.namePlaceholder = profile.name || 'Type your name';
      this.setState({ profile: profile });
    })
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

  handleEdit(key, value) {
    const { profile } = this.state;
    profile[key] = value;

    this.setState({ profile });
    store.saveProfile(profile);
  }

  resetSettings() {
    this.namePlaceholder = 'Type your name';
    store.resetProfile();
  }

  render() {
    const { profile } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    return (
      <>
        <View style={styles.container}>
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.list}>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Name</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Input
                      placeholder={this.namePlaceholder}
                      onChangeText={value => this.handleEdit('name', value)}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Gender</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.ButtonGroup
                      buttons={['Man', 'Woman']}
                      selectedIndex={profile.gender}
                      onPress={(index) => this.handleEdit('gender', index)}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Home</ListItem.Title>
                    </ListItem.Content>
                    <Text style={[styles.grayText]}>{profile.home ? profile.home.toString() : 'Not set'}</Text>
                    <ListItem.Chevron
                      size={24}
                      onPress={(index) => this.navigation.navigate('Location')}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Commute</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron
                      size={24}
                      onPress={(index) => this.navigation.navigate('Commute')}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Alert</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron
                      size={24}
                      onPress={(index) => this.navigation.navigate('Alert')}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Temperature unit</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.ButtonGroup
                      buttons={['°C', '°F']}
                      selectedIndex={profile.tempUnit}
                      onPress={(index) => this.handleEdit('tempUnit', index)}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <Button
                      title="Reset to default settings"
                      onPress={() => this.resetSettings()}
                      containerStyle={[gStyles.center]}
                      titleStyle={[gStyles.normal]}
                      raised
                    />
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
  grayText: {
    color: colors.darkerGray,
  }
});
