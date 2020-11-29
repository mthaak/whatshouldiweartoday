import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Block from '../components/Block'

import EditScreenInfo from '../components/EditScreenInfo';
import { View, Button, TextInput } from '../components/Themed';
import { Text } from '../components/StyledText';
import { Ionicons } from '@expo/vector-icons';

// import DateTimePicker from '@react-native-community/datetimepicker';

import * as Store from '../services/store';

export default class SettingsScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null, editing: null };
    Store.retrieveProfile().then(profile => this.setState({ profile: profile }));
  }

  // componentDidMount() {
  //   getCurrentWeather().then((value) => {
  //     this.setState({weather: JSON.stringify(value)})
  //   })
  // }

  toggleEdit(key) {
    const { editing, profile } = this.state;

    if (editing) {
      Store.saveProfile(profile);
      this.setState({ editing: null });
    } else {
      this.setState({ editing: key });
    }
  }

  renderTextEdit(key) {
    const { editing, profile } = this.state;

    if (editing === key) {
      return (
        <TextInput bold
          defaultValue={profile[key]}
          onChangeText={text => this.handleEdit([key], text)}
        />
      )
    }
    return <Text bold>{profile[key]}</Text>
  }

  renderLocationEdit(key) {
    const { editing, profile } = this.state;

    let city = profile[key] ? profile[key].city : 'Unknown'

    if (editing === key) {
      return (
        <Text>{city}</Text>
      )
    }
    return <Text bold>{city}</Text>
  }

  handleEdit(key, value) {
    const { profile } = this.state;
    profile[key] = value;

    this.setState({ profile });
    Store.saveProfile(profile);
  }

  resetSettings() {
    Store.resetProfile();
    Store.retrieveProfile().then(profile => this.setState({ profile: profile }));
  }

  render() {
    const { profile, editing } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.topRightCorner}
          onPress={() => {
            this.navigation.navigate('Weather');
          }}
        >
          <Ionicons size={30} style={{ marginBottom: -3 }} name="md-arrow-back" color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Your profile</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Block style={styles.inputs}>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text style={{ marginBottom: 10 }}>Your name</Text>
                {this.renderTextEdit('username')}
              </Block>
              <Text onPress={() => this.toggleEdit('username')}>
                {editing === 'username' ? 'Save' : 'Edit'}
              </Text>
            </Block>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text style={{ marginBottom: 10 }}>Home</Text>
                <Text>Current location: </Text>
                {this.renderLocationEdit('home')}
              </Block>
              <Text onPress={() => this.toggleEdit('home')}>
                {editing === 'home' ? 'Save' : 'Edit'}
              </Text>
            </Block>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text style={{ marginBottom: 10 }}>Commute</Text>
                <Text bold>ToDo</Text>
              </Block>
              <Text>
                Edit
              </Text>
            </Block>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text style={{ marginBottom: 10 }}>Alert time</Text>
                <Text bold>{JSON.stringify(profile.timeAlert)}</Text>
              </Block>
              <Text onPress={() => this.toggleEdit('timeAlert')}>
                {editing === 'timeAlert' ? 'Save' : 'Edit'}
              </Text>
            </Block>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Button onPress={() => this.resetSettings()} title="Reset profile">
              </Button>
            </Block>
          </Block>
        </ScrollView>
        <Text>{JSON.stringify(profile)}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightCorner: {
    position: 'absolute',
    top: '20px',
    right: '20px',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  inputs: {
  },
  inputRow: {
  },
});
