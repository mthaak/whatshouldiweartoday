import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Image } from 'react-native';
import { View, Button } from '../components/Themed';
import { Text } from '../components/StyledText';
import { Ionicons } from '@expo/vector-icons';

import * as ClothingImages from '../assets/images/clothing';
import * as Colors from '../constants/Colors'

import * as Store from '../services/store';
import { getTodayWeather, getWeatherAtTime, getWearRecommendation } from '../services/weatherrules.ts'
import weatherService from '../services/WeatherService.ts'

export default class WeatherScreen extends React.Component {
  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null }
    Store.retrieveProfile().then(profile => this.setState({ profile: profile }));
    weatherService.subscribe(() =>
      weatherService.getWeather()
        .then(weather => this.updateWeather(weather))
    );
  }

  componentDidMount() {
    weatherService.getWeather()
      .then(weather => this.updateWeather(weather));
  }

  componentWillUnmount() {
    weatherService.unsubscribe(() => { });
  }

  updateWeather(weatherForecast: Object) {
    this.setState({
      weatherForecast: weatherForecast,
    });
  }

  renderTodayWeather() {
    const { profile, weatherForecast } = this.state;

    if (profile && profile.tempUnit) {
      let todayWeather = getTodayWeather(weatherForecast);
      return <TodayWeather
        dayTemp={todayWeather.temp.day}
        feelsLikeTemp={todayWeather.feels_like.day}
        weatherDescr={todayWeather.weather[0]}
        tempUnit={profile ? profile.tempUnit : 'C'}
      />
    } else {
      return <Text>Profile is incomplete</Text>
    }
  }

  renderWearRecommendation() {
    const { profile, weatherForecast } = this.state;

    let wearRecommendation;
    if (profile && profile.commuteDays && isCommuteToday(profile.commuteDays)) {
      wearRecommendation = getWearRecommendation(weatherForecast, profile);
      return <WearRecommendation
        wearRecommendation={wearRecommendation}
        profile={profile}
      />
    } else {
      return <Text>Profile is incomplete</Text>
    }
  }


  renderCommuteWeather() {
    const { profile, weatherForecast } = this.state;

    if (profile) {
      let weatherAtLeave = null;
      if (profile.timeLeave)
        weatherAtLeave = getWeatherAtTime(weatherForecast, profile.timeLeave);
      let weatherAtReturn = null;
      if (profile.timeReturn)
        weatherAtReturn = getWeatherAtTime(weatherForecast, profile.timeReturn);

      let commuteElem;
      if (weatherAtReturn || weatherAtLeave) {
        return <Commute
          timeLeave={profile.timeLeave}
          timeReturn={profile.timeReturn}
          tempAtLeave={weatherAtLeave.temp}
          tempAtReturn={weatherAtReturn.temp}
          feelsLikeAtLeave={weatherAtLeave.feels_like}
          feelsLikeAtReturn={weatherAtReturn.feels_like}
          weatherDescrAtLeave={weatherAtLeave.weather[0]}
          weatherDescrAtReturn={weatherAtReturn.weather[0]}
          tempUnit={profile.tempUnit}
        />
      } else {
        return null;
      }
    } else {
      return <Text>Profile is incomplete</Text>
    }
  }

  render() {
    const { weatherForecast } = this.state;

    if (weatherForecast == null)
      return <Text>Loading...</Text>

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.topRightCorner}
          onPress={() => {
            this.navigation.navigate('Settings');
          }}
        >
          <Ionicons size={35} style={{ marginBottom: -3 }} name="md-settings" color={Colors.foreground} />
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', height: '25%', width: '100%' }}>
          {this.renderTodayWeather()}
        </View>

        <View style={{ justifyContent: 'center', height: '50%', width: '90%' }}>
          {this.renderWearRecommendation()}
        </View>

        <View style={{ justifyContent: 'center', height: '25%', width: '90%' }}>
          {this.renderCommuteWeather()}
        </View>

      </View>
    )
  }
}

class TodayWeather extends React.Component {
  render() {
    return (
      <>
        <Text style={styles.title}>Today</Text>
        <View style={{ width: '80%', flexDirection: 'row', marginLeft: 'auto', marginRight: 'auto' }}>
          <View style={{ width: '40%' }}>
            <WeatherIcon weather={this.props.weatherDescr} size={120} />
          </View>
          <View style={{ width: '60%', justifyContent: 'center' }}>
            <Text style={[styles.text, styles.xxlarge]}>{formatTemp(this.props.dayTemp, this.props.tempUnit)}</Text><br />
            <Text style={[styles.text, styles.small]}>feels like {formatTemp(this.props.feelsLikeTemp, this.props.tempUnit)}</Text>
          </View>
        </View >
      </>
    )
  }
}

class WearRecommendation extends React.Component {
  render() {
    let clothes = [
      ...this.props.wearRecommendation.temp.clothes,
      ...this.props.wearRecommendation.rain.clothes
    ]
    let tempImages = this.props.wearRecommendation.temp.clothes.map((name) =>
      <ClothingImage
        key={name}
        name={name}
        style={{ display: 'inline-block', width: 50, height: 80, margin: 8 }}
      />
    );
    let rainImages = this.props.wearRecommendation.rain.clothes.map((name) =>
      <ClothingImage
        key={name}
        name={name}
        style={{ display: 'inline-block', width: 50, height: 80, margin: 8 }}
      />
    );
    return (
      <View style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 14, backgroundColor: Colors.darkBackground, borderRadius: 5,
        borderColor: Colors.darkAccent, boxShadow: `inset 0 0 20px ${Colors.darkAccent}`
      }}>
        <Text style={styles.large}>{this.props.wearRecommendation.temp.msg}</Text>
        <View style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', backgroundColor: 'none' }}>
          {tempImages}
        </View>
        <Text style={styles.large}>{this.props.wearRecommendation.rain.msg}</Text>
        <View style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', backgroundColor: 'none' }}>
          {rainImages}
        </View>

      </View>
    )
  }
}
class Commute extends React.Component {
  render() {
    return (
      <>
        <Text style={styles.subtitle}>Your commute</Text>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={styles.commuteElem}>
            {this.props.timeLeave &&
              <>
                <Text style={styles.text}>
                  <Ionicons name="ios-arrow-round-forward" size={20} color={Colors.foreground} style={{ textAlignVertical: 'sub', marginRight: 10 }} />
                  <span>Leave {this.props.timeLeave.toString()}</span>
                </Text>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                  <WeatherIcon weather={this.props.weatherDescrAtLeave} size={70} />
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={[styles.text, styles.xlarge]}>{formatTemp(this.props.tempAtLeave, this.props.tempUnit)}</Text><br />
                    <Text style={[styles.text, styles.xsmall]}>feels like {formatTemp(this.props.feelsLikeAtLeave, this.props.tempUnit)}</Text>
                  </View>
                </View>
              </>
            }
          </View>
          <View style={styles.commuteElem}>
            {this.props.timeReturn &&
              <>
                <Text style={styles.text}>
                  <Ionicons name="ios-arrow-round-back" size={20} color={Colors.foreground} style={{ textAlignVertical: 'sub', marginRight: 10 }} />
                  <span>Return {this.props.timeReturn.toString()}</span>
                </Text>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                  <WeatherIcon weather={this.props.weatherDescrAtReturn} size={70} />
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={[styles.text, styles.xlarge]}>{formatTemp(this.props.tempAtReturn, this.props.tempUnit)}</Text><br />
                    <Text style={[styles.text, styles.xsmall]}>feels like {formatTemp(this.props.feelsLikeAtReturn, this.props.tempUnit)}</Text>
                  </View>
                </View>
              </>
            }
          </View>
        </View>
      </>
    )
  }
}

class ClothingImage extends React.Component {
  render() {
    return <Image source={ClothingImages[this.props.name]} resizeMode="contain"
      style={this.props.style} />
  }
}

class WeatherIcon extends React.Component {
  render() {
    if (this.props.weather) {
      let url = `http://openweathermap.org/img/wn/${this.props.weather.icon}@2x.png`
      let placeholder = this.props.weather.description
      return <img src={url} placeholder={placeholder} style={{
        display: 'inline-block',
        width: this.props.size || "100%",
        height: this.props.size || "100%",
        objectFit: 'contain',
      }} />
    }
    return null;
  }
}

function formatTemp(temp, unit: string) {
  return (Math.round(temp * 10) / 10).toString() + '°' + unit
}

function isCommuteToday(commuteDays: Array<string>) {
  let dayOfWeek = (new Date()).getDay();
  return commuteDays.some(day => day % 7 == dayOfWeek);
}

const shadowStyle = {
  textShadowColor: 'black',
  textShadowRadius: 2
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  topRightCorner: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    ...shadowStyle,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  subtitle: {
    ...shadowStyle,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  text: {
    ...shadowStyle
  },
  xxlarge: {
    fontSize: 32,
  },
  xlarge: {
    fontSize: 22,
  },
  large: {
    fontSize: 18,
  },
  small: {
    fontSize: 12,
  },
  xsmall: {
    fontSize: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  image: {
    width: '100%', /* or any custom size */
    height: '100%',
    objectFit: 'contain',
  },
  commuteElem: {
    width: '50%',
    padding: 10,
  },
});
