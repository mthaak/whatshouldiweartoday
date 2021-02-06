import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image, ActivityIndicator } from 'react-native';
import { View } from '../components/Themed';
import { Text } from '../components/StyledText';
import { Header, Icon, Button } from 'react-native-elements';

import * as colors from '../constants/colors'
import { styles as gStyles } from '../constants/styles'
import * as ClothingImages from '../assets/images/clothing';
import { TemperatureUnit } from '../common/enums'
import Store from '../services/Store';
import LocationService from '../services/LocationService'
import { isTodayTrue } from '../common/timeutils'
import WeatherService from '../services/WeatherService'
import { getTodayWeather, getWeatherAtTime, getWearRecommendation } from '../services/weatherrules'
import { formatTemp } from '../common/weatherutils'

const REFRESH_PERIOD = 1800; // time (s) between each data refresh when screen is active

export default class WeatherScreen extends React.Component {

  constructor({ route, navigation }) {
    super()
    this.navigation = navigation;
    this.state = { profile: null, location: null, isRefreshing: false }
  }

  componentDidMount() {
    this.refreshData();

    Store.subscribe(this.updateProfileAndThenRefreshWeather);
    LocationService.subscribe(this.updateLocationAndThenRefreshWeather);
    WeatherService.subscribe(this.updateWeather);
    this.focusListener = this.navigation.addListener("focus", this.refreshData);
  }

  componentWillUnmount() {
    Store.unsubscribe(this.updateProfileAndThenRefreshWeather);
    LocationService.unsubscribe(this.updateLocationAndThenRefreshWeather);
    WeatherService.unsubscribe(this.updateWeather);
  }

  updateProfile = () => {
    return Store.retrieveProfile().then(this.setProfile);
  }

  updateLocation = () => {
    return LocationService.getLocationAsync().then(this.setLocation);
  }

  updateWeather = () => {
    return WeatherService.getWeatherAsync().then(this.setWeather);
  }

  refreshWeather = () => {
    const { profile, location } = this.state;
    if (profile) {
      if (location && location.lon && location.lat) {
        return WeatherService.getWeatherAsync(location, profile.tempUnit, true).then(this.setWeather)
      } else {
        console.warn('Current location not available. Cannot retrieve weather forecast')
      }
    }
  }

  refreshData = () => {
    if (!this.timeLastRefreshed
      || (Date.now() - this.timeLastRefreshed) / 1E6 > REFRESH_PERIOD) {
      this.setState({ isRefreshing: true });
      // Weather gets updated after profile or location are updated
      Promise.all([
        this.updateProfile(),
        this.updateLocation(),
      ])
        .then(this.refreshWeather)
        .finally(() => this.setState({ isRefreshing: false }));
      this.timeLastRefreshed = Date.now();
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

    let wearRecommendation = getWearRecommendation(weatherForecast, profile);
    return <WearRecommendation
      wearRecommendation={wearRecommendation}
      profile={profile}
    />
  }

  renderCommuteWeather() {
    const { profile, weatherForecast } = this.state;

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

  renderContent() {
    const { profile, location, weatherForecast, isRefreshing } = this.state;

    if (isRefreshing)
      return <CenterMessage message="Weather forecast is being retrieved" active />;

    if (!profile)
      return <CenterMessage message="Profile is incomplete" />;

    if (!location) {
      if (LocationService.hasPermission())
        return <CenterMessage message="Could not retrieve current location" />
      else {
        let button = <Button
          title="Give permission"
          onPress={() => LocationService.requestPermission()
            .then(granted => { if (granted) LocationService.getLocationAsync() })}
          titleStyle={[gStyles.normal]}
          type="solid"
          containerStyle={[gStyles.center, { alignSelf: 'flex-start' }]}
          buttonStyle={{ backgroundColor: colors.foreground }}
          titleStyle={{ color: colors.background }}
        />
        return (
          <>
            <CenterMessage message="Does not have permission for current location"
              bottom={button}
            />
          </>
        )
      }
    }

    if (!weatherForecast)
      return <CenterMessage message="Could not retrieve weather forecast" />;

    return (
      <>
        <View style={{ height: '20%', justifyContent: 'center' }}>
          {this.renderTodayWeather()}
        </View>

        <View style={{ height: '60%', justifyContent: 'center' }}>
          {this.renderWearRecommendation()}
        </View>

        <View style={{ height: '20%', justifyContent: 'center' }}>
          {this.renderCommuteWeather()}
        </View>
      </>
    );
  }

  render() {
    return (
      <View style={[styles.container]}>
        {this.renderTopBar()}
        <View style={{ flex: 1, paddingHorizontal: 15 }}>
          {this.renderContent()}
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
        <Text style={[gStyles.large, { marginTop: 0 }]}>{this.props.wearRecommendation.temp.msg}</Text>
        <View style={{
          marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap',
          backgroundColor: 'none', minHeight: 10,
        }}>
          {rainImages}
        </View>
        <Text style={[gStyles.large, { marginTop: 0 }]}>{this.props.wearRecommendation.rain.msg}</Text>
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

class CenterMessage extends React.Component {
  render() {
    var animation;
    if (this.props.active)
      animation = <ActivityIndicator size={50} color={colors.foreground} />;
    else
      animation = <Icon name="error" size={40} color={colors.foreground} />
    return (
      <>
        <View style={[gStyles.center, gStyles.centerVertical, gStyles.centerText]}>
          {animation}
          <Text style={[gStyles.large, gStyles.shadow, { marginTop: 20, marginBottom: 20 }]}>{this.props.message}</Text>
          {this.props.bottom}
        </View>
      </>
    );
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
