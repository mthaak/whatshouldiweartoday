import React, { useState } from 'react';
import { View, StyleSheet, Image, FlatList, Switch } from 'react-native';
import { Text, ListItem, Avatar, Icon, Badge } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';

import { LinearGradient } from '../components/LinearGradient';

// import { Header } from './header';

import * as Colors from '../constants/Colors';

const log = () => console.log('this is an example method');

function Lists2(props) {
  const renderRow = ({ item }) => {
    return (
      <ListItem onPress={log} bottomDivider>
        <Icon name={item.icon} />
        <ListItem.Content>
          <ListItem.Title>{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    );
  };

  const [switch1, setSwitch1] = useState(true);
  const [checkbox1, setCheckbox1] = useState(true);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.list}>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>Name</ListItem.Title>
                </ListItem.Content>
                <ListItem.Input placeholder="Type your name" />
                <ListItem.Chevron />
              </ListItem>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>Switch that please 😲</ListItem.Title>
                </ListItem.Content>
                <Switch
                  onValueChange={() => { }}
                />
              </ListItem>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>Choose 🤯</ListItem.Title>
                </ListItem.Content>
                <ListItem.ButtonGroup
                  buttons={['Flower', 'Coco']}
                  selectedIndex={selectedButtonIndex}
                  onPress={(index) => setSelectedButtonIndex(index)}
                />
              </ListItem>
              <ListItem bottomDivider>
                <ListItem.CheckBox
                  checked={checkbox1}
                  onPress={() => setCheckbox1(!checkbox1)}
                />
                <ListItem.Content>
                  <ListItem.Title>Check that please 😢</ListItem.Title>
                </ListItem.Content>
              </ListItem>
              <ListItem bottomDivider>
                <Badge value="12" />
                <ListItem.Content>
                  <ListItem.Title>With a Badge ! 😻</ListItem.Title>
                </ListItem.Content>
              </ListItem>
              <ListItem bottomDivider>
                <Icon name="check" size={20} />
                <ListItem.Content>
                  <ListItem.Title>This thing is checked 😎</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            </View>
            <View style={styles.list}>
              <ListItem>
                <Avatar source={require('../assets/images/splash.png')} />
                <ListItem.Content>
                  <ListItem.Title>
                    Limited supply! Its like digital gold!
                  </ListItem.Title>
                  <View style={styles.subtitleView}>
                    <Image
                      source={require('../assets/images/splash.png')}
                      style={styles.ratingImage}
                    />
                    <Text style={styles.ratingText}>5 months ago</Text>
                  </View>
                </ListItem.Content>
              </ListItem>
            </View>
          </>
        }
        keyExtractor={(a) => a.title}
        renderItem={renderRow}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: Colors.lightAccent,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5,
  },
  ratingImage: {
    height: 19.21,
    width: 100,
  },
  ratingText: {
    paddingLeft: 10,
    color: 'grey',
  },
});

export default Lists2;
