import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'react-native';
import { View, Button } from '../components/Themed';
import { Text } from '../components/StyledText';
import { Icon } from 'react-native-elements';

import * as colors from '../constants/colors'
import { styles as gStyles } from '../constants/styles'
import * as ClothingImages from '../assets/images/clothing';
import { TemperatureUnit } from '../common/enums'
import * as Store from '../services/store';
import locationService from '../services/LocationService'
import weatherService from '../services/WeatherService'
import { getTodayWeather, getWeatherAtTime, getWearRecommendation } from '../services/weatherrules'

export default class WeatherScreen extends React.Component {

  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null }
    Store.retrieveProfile().then(profile => this.setState({ profile: profile }));

    locationService.getLocationAsync()
      .then(location => this.updateLocation(location));
    weatherService.getWeatherAsync()
      .then(weather => this.updateWeather(weather));
  }

  componentDidMount() {
    locationService.subscribe((location) =>
      locationService.getLocationAsync().then((location) =>
        this.updateLocation(location)
      )
    );
    weatherService.subscribe(() =>
      weatherService.getWeatherAsync()
        .then(weather => this.updateWeather(weather))
    );

    // Need to retrieve profile upon focus due to possible changes in settings
    this.navigation.addListener(
      'focus',
      payload => {
        Store.retrieveProfile().then(profile => this.setState({ profile: profile }));
      }
    );
  }

  componentWillUnmount() {
    locationService.unsubscribe(() => { });
    weatherService.unsubscribe(() => { });
  }

  updateLocation(location: String) {
    this.setState({
      location: location,
    });
  }

  updateWeather(weatherForecast: Object) {
    this.setState({
      weatherForecast: weatherForecast,
    });
  }

  renderTodayWeather() {
    const { profile, location, weatherForecast } = this.state;

    if (profile && profile.tempUnit !== null) {
      let todayWeather = getTodayWeather(weatherForecast);
      return <TodayWeather
        dayTemp={todayWeather.temp.day}
        feelsLikeTemp={todayWeather.feels_like.day}
        weatherDescr={todayWeather.weather[0]}
        tempUnit={profile ? profile.tempUnit : TemperatureUnit.CELSIUS}
        location={location}
      />
    } else {
      return <Text>Profile is incomplete</Text>
    }
  }

  renderWearRecommendation() {
    const { profile, weatherForecast } = this.state;

    let wearRecommendation;
    if (profile && profile.commute.days && isCommuteToday(profile.commute.days)) {
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
      if (profile.commute.leaveTime)
        weatherAtLeave = getWeatherAtTime(weatherForecast, profile.commute.leaveTime);
      let weatherAtReturn = null;
      if (profile.commute.returnTime)
        weatherAtReturn = getWeatherAtTime(weatherForecast, profile.commute.returnTime);
      let commuteElem;
      if (weatherAtReturn || weatherAtLeave) {
        return <Commute
          leaveTime={profile.commute.leaveTime}
          returnTime={profile.commute.returnTime}
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
            this.navigation.navigate('Settings', { screen: 'Main' });
          }}
        >
          <Icon name="settings" size={35}
            style={[{ marginBottom: -3 }, gStyles.shadow]} color={colors.foreground} />
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

      </View >
    )
  }
}

class TodayWeather extends React.Component {
  render() {
    let locationStr = this.props.location ? this.props.location.toString() : "Unknown";
    return (
      <>
        <Text style={gStyles.title}>Today</Text>
        <View style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: -20 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 120 }}>
              <WeatherIcon weather={this.props.weatherDescr} size={120} />
            </View>
            <View style={{ width: '60%', justifyContent: 'center', top: -10 }}>
              <Text style={[gStyles.shadow, gStyles.xxlarge]}>{formatTemp(this.props.dayTemp, this.props.tempUnit)}</Text>
              <Text style={[gStyles.shadow, gStyles.small]}>feels like {formatTemp(this.props.feelsLikeTemp, this.props.tempUnit)}</Text>
            </View>
          </View >
          <View style={{ position: 'relative', top: -25, left: 20, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 7 }}>
              <Icon name="place" size={20} color={colors.foreground} style={{ textAlignVertical: 'top' }} />
            </View>
            <View>
              <Text style={[gStyles.shadow, gStyles.small]}>{locationStr}</Text>
            </View>
          </View>
        </View>
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
        style={{ width: 50, height: 80, margin: 8 }}
      />
    );
    let rainImages = this.props.wearRecommendation.rain.clothes.map((name) =>
      <ClothingImage
        key={name}
        name={name}
        style={{ width: 50, height: 80, margin: 8 }}
      />
    );
    return (
      <View style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-around',
        padding: 18, backgroundColor: colors.darkBackground, borderRadius: 5,
        borderColor: colors.darkAccent, boxShadow: `inset 0 0 20px ${colors.darkAccent}`
      }}>
        <View style={{
          marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap',
          backgroundColor: 'none'
        }}>
          {tempImages}
        </View>
        <Text style={[gStyles.large]}>{this.props.wearRecommendation.temp.msg}</Text>
        <View style={{
          marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap',
          backgroundColor: 'none'
        }}>
          {rainImages}
        </View>
        <Text style={[gStyles.large]}>{this.props.wearRecommendation.rain.msg}</Text>
      </View >
    )
  }
}

class Commute extends React.Component {
  render() {
    return (
      <>
        <Text style={gStyles.subtitle}>Your commute</Text>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={styles.commuteElem}>
            {this.props.leaveTime &&
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ marginRight: 10 }}>
                    <Icon name="arrow-forward" size={20} color={colors.foreground} style={{ textAlignVertical: 'bottom' }} />
                  </View>
                  <Text style={[gStyles.shadow, gStyles.normal]}>
                    Leave {this.props.leaveTime.toString()}
                  </Text>
                </View>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                  <WeatherIcon weather={this.props.weatherDescrAtLeave} size={70} />
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={[gStyles.shadow, gStyles.xlarge]}>{formatTemp(this.props.tempAtLeave, this.props.tempUnit)}</Text>
                    <Text style={[gStyles.shadow, gStyles.xsmall]}>feels like {formatTemp(this.props.feelsLikeAtLeave, this.props.tempUnit)}</Text>
                  </View>
                </View>
              </>
            }
          </View>
          <View style={styles.commuteElem}>
            {this.props.returnTime &&
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ marginRight: 10 }}>
                    <Icon name="arrow-back" size={20} color={colors.foreground} style={{ textAlignVertical: 'top' }} />
                  </View>
                  <Text style={[gStyles.shadow, gStyles.normal]}>
                    Return {this.props.returnTime.toString()}
                  </Text>
                </View>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                  <WeatherIcon weather={this.props.weatherDescrAtReturn} size={70} />
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={[gStyles.shadow, gStyles.xlarge]}>{formatTemp(this.props.tempAtReturn, this.props.tempUnit)}</Text>
                    <Text style={[gStyles.shadow, gStyles.xsmall]}>feels like {formatTemp(this.props.feelsLikeAtReturn, this.props.tempUnit)}</Text>
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
      let url = `http://openweathermap.org/img/wn/${this.props.weather.icon}@2x.png`;
      let placeholder = this.props.weather.description
      return <Image source={{ uri: url }} placeholder={placeholder} style={{
        width: this.props.size || "100%",
        height: this.props.size || "100%",
      }} />
    }
    return null;
  }
}

function formatTemperatureUnit(unit: TemperatureUnit): string {
  switch (unit) {
    case TemperatureUnit.CELSIUS:
      return 'C';
    case TemperatureUnit.FAHRENHEIT:
      return 'F';
  }
}

function formatTemp(temp, unit: TemperatureUnit) {
  return (Math.round(temp * 10) / 10).toString() + '°' + formatTemperatureUnit(unit);
}

function isCommuteToday(commuteDays: Array<bool>): bool {
  let dayOfWeek = (new Date()).getDay();
  return commuteDays[dayOfWeek];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 34,
  },
  topRightCorner: {
    position: 'absolute',
    top: 34,
    right: 20,
    zIndex: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  image: {
    width: '100%', /* or any custom size */
    height: '100%',
  },
  commuteElem: {
    width: '50%',
    padding: 10,
  },
});
