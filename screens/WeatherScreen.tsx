import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'react-native';
import { View, Button } from '../components/Themed';
import { Text } from '../components/StyledText';
import { Header, Icon } from 'react-native-elements';

import * as colors from '../constants/colors'
import { styles as gStyles } from '../constants/styles'
import * as ClothingImages from '../assets/images/clothing';
import { TemperatureUnit } from '../common/enums'
import store from '../services/Store';
import locationService from '../services/LocationService'
import { isTodayTrue } from '../common/timeutils'
import weatherService from '../services/WeatherService'
import { getTodayWeather, getWeatherAtTime, getWearRecommendation } from '../services/weatherrules'
import { formatTemp } from '../common/weatherutils'

export default class WeatherScreen extends React.Component {

  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null }

    this.updateProfile();
    this.updateLocation();
    // weather gets updated after profile or location are updated
    Promise.all([
      this.updateProfile(),
      this.updateLocation(),
    ]).then(this.refreshWeather)
  }

  componentDidMount() {
    store.subscribe(this.updateProfileAndThenRefreshWeather);
    locationService.subscribe(this.updateLocationAndThenRefreshWeather);
    weatherService.subscribe(this.updateWeather);
  }

  componentWillUnmount() {
    store.unsubscribe(this.updateProfileAndThenRefreshWeather);
    locationService.unsubscribe(this.updateLocationAndThenRefreshWeather);
    weatherService.unsubscribe(this.updateWeather);
  }

  updateProfile = () => {
    return store.retrieveProfile().then(this.setProfile);
  }

  updateLocation = () => {
    return locationService.getLocationAsync().then(this.setLocation);
  }

  updateWeather = () => {
    return weatherService.getWeatherAsync().then(this.setWeather);
  }

  refreshWeather = () => {
    const { profile, location } = this.state;
    if (profile) {
      if (location && location.lon && location.lat) {
        return weatherService.getWeatherAsync(location, profile.tempUnit, true).then(this.setWeather)
      } else if (profile.home && profile.home.lon && profile.home.lat) {
        console.warn('Current location not available. Using home location for weather forecast')
        return weatherService.getWeatherAsync(profile.home, profile.tempUnit, true).then(this.setWeather)
      } else {
        console.warn('Current location and home location not available. Cannot retrieve weather forecast')
      }
    }
  }

  updateProfileAndThenRefreshWeather = () => {
    return this.updateProfile().then(this.refreshWeather);
  }

  updateLocationAndThenRefreshWeather = () => {
    return this.updateLocation().then(this.refreshWeather);
  }

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile
    });
  }

  setLocation = (location: String) => {
    if (location == undefined)
      alert('Could not retrieve location')
    this.setState({
      location: location,
    });
  }

  setWeather = (weatherForecast: Object) => {
    this.setState({
      weatherForecast: weatherForecast,
    });
  }

  renderTopBar() {
    return <Header
      centerComponent={<Text style={[gStyles.title, { alignItems: 'center' }]}>{formatDateToday()}</Text>}
      rightComponent={{
        icon: 'settings',
        size: 30,
        color: colors.foreground,
        style: gStyles.shadow,
        onPress: () => this.navigation.navigate('Settings', { screen: 'Main' })
      }}
      centerContainerStyle={{ justifyContent: 'center' }}
      containerStyle={{ minHeight: 64, zIndex: 1 }}
    />
  }

  renderTodayWeather() {
    const { profile, location, weatherForecast } = this.state;

    if (!profile || profile.tempUnit === null)
      return <Text>Profile is incomplete</Text>

    if (!weatherForecast)
      return <Text>Weather is loading...</Text>

    let todayWeather = getTodayWeather(weatherForecast);
    return <TodayWeather
      dayTemp={todayWeather.temp.day}
      feelsLikeTemp={todayWeather.feels_like.day}
      weatherDescr={todayWeather.weather[0]}
      tempUnit={profile ? profile.tempUnit : TemperatureUnit.CELSIUS}
      location={location}
    />
  }

  renderWearRecommendation() {
    const { profile, weatherForecast } = this.state;

    if (!profile || !profile.commute.days)
      return <Text>Profile is incomplete</Text>

    if (!weatherForecast)
      return <Text>Weather is loading...</Text>

    let wearRecommendation = getWearRecommendation(weatherForecast, profile);
    return <WearRecommendation
      wearRecommendation={wearRecommendation}
      profile={profile}
    />
  }

  renderCommuteWeather() {
    const { profile, weatherForecast } = this.state;

    if (!profile || !profile.commute.days)
      return <Text>Profile is incomplete</Text>

    if (!weatherForecast)
      return <Text>Weather is loading...</Text>

    if (isTodayTrue(profile.commute.days)) {
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
      return null;
    }
  }

  render() {
    return (
      <View style={[styles.container]}>
        {this.renderTopBar()}

        <View style={{ flex: 1, paddingHorizontal: 15 }}>

          <View style={{ height: '20%', justifyContent: 'center' }}>
            {this.renderTodayWeather()}
          </View>

          <View style={{ height: '60%', justifyContent: 'center' }}>
            {this.renderWearRecommendation()}
          </View>

          <View style={{ height: '20%', justifyContent: 'center' }}>
            {this.renderCommuteWeather()}
          </View>

        </View>

      </View >
    )
  }
}

class TodayWeather extends React.Component {
  render() {
    let locationStr = this.props.location ? this.props.location.toString() : 'Unknown';
    return (
      <>
        <View style={{ marginLeft: 'auto', marginRight: 'auto' }}>
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
              <Icon name="place" size={20} color={colors.foreground} />
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
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-around',
        padding: 18, backgroundColor: colors.darkBackground, borderRadius: 5,
        borderColor: colors.darkAccent, boxShadow: `inset 0 0 20px ${colors.darkAccent}`
      }}>
        <View style={{
          marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap',
          backgroundColor: 'none', minHeight: 10,
        }}>
          {tempImages}
        </View>
        <Text style={[gStyles.large, { marginTop: 10 }]}>{this.props.wearRecommendation.temp.msg}</Text>
        <View style={{
          marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap',
          backgroundColor: 'none', minHeight: 10,
        }}>
          {rainImages}
        </View>
        <Text style={[gStyles.large, { marginTop: 10 }]}>{this.props.wearRecommendation.rain.msg}</Text>
      </View >
    )
  }
}

class Commute extends React.Component {
  render() {
    return (
      <>
        <Text style={[gStyles.subtitle]}>Commute</Text>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={styles.commuteElem}>
            {this.props.leaveTime &&
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ marginRight: 10 }}>
                    <Icon name="arrow-forward" size={20} color={colors.foreground} />
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
                    <Icon name="arrow-back" size={20} color={colors.foreground} />
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
    return <Image
      source={ClothingImages[this.props.name]}
      resizeMode="contain"
      style={this.props.style}
    />
  }
}

class WeatherIcon extends React.Component {
  render() {
    if (this.props.weather) {
      let url = `http://openweathermap.org/img/wn/${this.props.weather.icon}@2x.png`;
      let placeholder = this.props.weather.description
      return <Image
        source={{ uri: url }}
        placeholder={placeholder}
        style={{
          width: this.props.size || "100%",
          height: this.props.size || "100%",
        }}
      />
    }
    return null;
  }
}

function formatDateToday(date: Date) {
  return new Date().toDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commuteElem: {
    width: '50%',
    padding: 10,
  },
});
