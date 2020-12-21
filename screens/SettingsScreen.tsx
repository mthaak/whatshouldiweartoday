import React, { useState } from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge, Button, Header } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import { Ionicons } from '@expo/vector-icons';

import { copyString } from '../common/utils';

import { LinearGradient } from '../components/LinearGradient';

import * as Colors from '../constants/Colors';

import * as Store from '../services/store';

export default class SettingsScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null };
    Store.retrieveProfile().then(profile => {
      // Dynamic placeholders need to be set only once during init
      this.namePlaceholder = profile.name || 'Type your name';
      this.setState({ profile: profile });
    });
  }

  handleEdit(key, value) {
    const { profile } = this.state;
    profile[key] = value;

    this.setState({ profile });
    Store.saveProfile(profile);
  }

  resetSettings() {
    this.namePlaceholder = null;
    Store.resetProfile();
    Store.retrieveProfile().then(profile => this.setState({ profile: profile }));
  }

  render() {
    const { profile } = this.state;
    if (profile == null)
      return <Text>Loading...</Text>

    return (
      <>
        <View style={styles.container}>
          <Header
            leftComponent=<Ionicons name="md-arrow-round-back" size={30} color={Colors.foreground}
          onPress={() => this.navigation.goBack()} />
    />
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
                      onChangeText={value => this.handleEdit("name", value)}
                    />
                    <ListItem.Chevron />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Gender</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.ButtonGroup
                      buttons={['Man', 'Woman']}
                      selectedIndex={profile.gender}
                      onPress={(index) => this.handleEdit("gender", index)}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Home</ListItem.Title>
                    </ListItem.Content>
                    <Text>{profile.home || 'Not set'}</Text>
                    <ListItem.Chevron />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Commute</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Alert</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron
                      onPress={(index) => this.navigation.navigate("Settings-Alert")}
                    />
                  </ListItem>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>Temperature unit</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.ButtonGroup
                      buttons={['°C', '°F']}
                      selectedIndex={profile.tempUnit}
                      onPress={(index) => this.handleEdit("tempUnit", index)}
                    />
                  </ListItem>

                  <ListItem bottomDivider containerStyle={{ justifyContent: 'center' }}>
                    <Button
                      title="Reset Settings"
                      onPress={() => this.resetSettings()}
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



// <ListItem bottomDivider>
//   <ListItem.CheckBox
//     checked={checkbox1}
//     onPress={() => setCheckbox1(!checkbox1)}
//   />
//   <ListItem.Content>
//     <ListItem.Title>Check that please 😢</ListItem.Title>
//   </ListItem.Content>
// </ListItem>
// <ListItem bottomDivider>
//   <Badge value="12" />
//   <ListItem.Content>
//     <ListItem.Title>With a Badge ! 😻</ListItem.Title>
//   </ListItem.Content>
// </ListItem>
// <ListItem bottomDivider>
//   <Icon name="check" size={20} />
//   <ListItem.Content>
//     <ListItem.Title>This thing is checked 😎</ListItem.Title>
//   </ListItem.Content>
// </ListItem>
// <ListItem bottomDivider>
//   <ListItem.Content>
//     <ListItem.Title>Switch that please 😲</ListItem.Title>
//   </ListItem.Content>
//   <Switch
//     onValueChange={() => { }}
//   />
// </ListItem>
// <View style={styles.list}>
//   <ListItem>
//     <Avatar source={require('../assets/images/splash.png')} />
//     <ListItem.Content>
//       <ListItem.Title>
//         Limited supply! Its like digital gold!
//         </ListItem.Title>
//       <View style={styles.subtitleView}>
//         <Image
//           source={require('../assets/images/splash.png')}
//           style={styles.ratingImage}
//         />
//         <Text style={styles.ratingText}>5 months ago</Text>
//       </View>
//     </ListItem.Content>
//   </ListItem>
// </View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    borderTopWidth: 1,
    borderColor: Colors.lightAccent,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5,
  }
});
