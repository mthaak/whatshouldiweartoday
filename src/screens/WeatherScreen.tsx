import * as React from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";
import { Button, Header, Icon } from "react-native-elements";

import * as ClothingImages from "../assets/images/clothing";
import * as Colors from "../constants/colors";
import { isTodayTrue } from "../common/timeUtils";
import { formatTemp } from "../common/weatherUtils";
import { Text } from "../components/StyledText";
import { View } from "../components/Themed";
import { styles as gStyles } from "../constants/styles";
import Location from "../models/Location";
import Time from "../models/Time";
import UserProfile from "../models/UserProfile";
import WeatherForecast from "../models/WeatherForecast";
import { TemperatureUnit } from "../models/enums";
import LocationService from "../services/LocationService";
import Store from "../services/Store";
import WeatherService from "../services/WeatherService";
import {
  WeatherForecastAtTime,
  getTodayWeather,
  getWearRecommendation,
  getWeatherAtTime,
} from "../services/weatherrules";

const REFRESH_PERIOD = 300; // time (s) between each data refresh when screen is active

type WeatherScreenState = {
  profile: UserProfile | null;
  location: Location | null;
  isRefreshing: boolean;
  weatherForecast: WeatherForecast;
  weatherForecastFailed: boolean;
};

export default class WeatherScreen extends React.Component<
  any,
  WeatherScreenState
> {
  navigation: any;
  focusListener: any;
  timeLastRefreshed: any;

  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      profile: null,
      location: null,
      isRefreshing: false,
      weatherForecast: null,
      weatherForecastFailed: false,
    };
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

  updateProfile = async () => {
    return await Store.retrieveProfile().then((profile) => {
      this.setProfile(profile);
      return profile;
    });
  };

  updateLocation = async () => {
    return await LocationService.getLocationAsync().then((location) => {
      this.setLocation(location);
      return location;
    });
  };

  updateWeather = async () => {
    const { profile, location } = this.state;
    return await WeatherService.getWeatherAsync(
      location,
      profile.tempUnit,
    ).then(this.setWeather);
  };

  refreshWeather = async (
    profile: UserProfile,
    location: Location,
    force = false,
  ) => {
    const { isRefreshing } = this.state;
    if (isRefreshing) return; // don't refresh simultaneously

    if (profile) {
      if (location?.lon && location.lat) {
        this.setState({ isRefreshing: true });
        try {
          const weatherForecast = await WeatherService.getWeatherAsync(
            location,
            profile.tempUnit,
            force,
          );
          this.setWeather(weatherForecast);
          this.setState({ weatherForecastFailed: false });
        } catch {
          this.setState({ weatherForecastFailed: true });
        }
        this.setState({ isRefreshing: false });
      } else {
        console.warn(
          "Current location not available. Cannot retrieve weather forecast",
        );
      }
    }
  };

  refreshData = () => {
    if (
      !this.timeLastRefreshed ||
      (Date.now() - this.timeLastRefreshed) / 1e3 > REFRESH_PERIOD
    ) {
      // Weather gets updated after profile or location are updated
      Promise.all([this.updateProfile(), this.updateLocation()]).then(
        ([profile, location]) => this.refreshWeather(profile, location, false),
      );
      this.timeLastRefreshed = Date.now();
    }
  };

  updateProfileAndThenRefreshWeather = async () => {
    return await this.updateProfile().then((profile) =>
      this.refreshWeather(profile, this.state.location, true),
    );
  };

  updateLocationAndThenRefreshWeather = async () => {
    return await this.updateLocation().then((location) =>
      this.refreshWeather(this.state.profile, location),
    );
  };

  setProfile = (profile: UserProfile) => {
    this.setState({
      profile: profile,
    });
  };

  setLocation = (location: Location) => {
    this.setState({
      location: location,
    });
  };

  setWeather = (weatherForecast: WeatherForecast) => {
    this.setState({
      weatherForecast: weatherForecast,
    });
  };

  renderTopBar() {
    return (
      <Header
        centerComponent={
          <Text style={[gStyles.title, { alignItems: "center" }]}>
            {formatDateToday()}
          </Text>
        }
        rightComponent={
          <Icon
            name="settings"
            size={30}
            color={Colors.foreground}
            style={gStyles.shadow}
            onPress={() =>
              this.navigation.navigate("Settings", { screen: "Main" })
            }
          />
        }
        centerContainerStyle={{ justifyContent: "center" }}
        containerStyle={{
          minHeight: 64,
          zIndex: 1,
          backgroundColor: Colors.background,
        }}
      />
    );
  }

  renderTodayWeather() {
    const { profile, location, weatherForecast } = this.state;

    const todayWeather = getTodayWeather(weatherForecast);
    return (
      <TodayWeather
        dayTemp={todayWeather.temp.day}
        feelsLikeTemp={todayWeather.feels_like.day}
        weatherDescr={todayWeather.weather[0]}
        tempUnit={profile ? profile.tempUnit : TemperatureUnit.CELSIUS}
        location={location}
      />
    );
  }

  renderWearRecommendation() {
    const { profile, weatherForecast } = this.state as any;

    const wearRecommendation = getWearRecommendation(weatherForecast, profile);
    return (
      <WearRecommendation
        wearRecommendation={wearRecommendation}
        profile={profile}
      />
    );
  }

  renderCommuteWeather() {
    const { profile, weatherForecast } = this.state as any;

    if (isTodayTrue(profile.commute.days)) {
      let weatherAtLeave: WeatherForecastAtTime | null = null;
      if (profile.commute.leaveTime) {
        weatherAtLeave = getWeatherAtTime(
          weatherForecast,
          profile.commute.leaveTime,
        );
      }
      let weatherAtReturn: WeatherForecastAtTime | null = null;
      if (profile.commute.returnTime) {
        weatherAtReturn = getWeatherAtTime(
          weatherForecast,
          profile.commute.returnTime,
        );
      }
      if (weatherAtReturn && weatherAtLeave) {
        return (
          <Commute
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
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  renderContent() {
    const {
      profile,
      location,
      weatherForecast,
      isRefreshing,
      weatherForecastFailed,
    } = this.state;

    if (isRefreshing) {
      return (
        <CenterMessage message="Weather forecast is being retrieved" active />
      );
    }

    if (weatherForecastFailed) {
      return (
        <CenterMessage message="Could not retrieve weather forecast" active />
      );
    }

    if (!profile) {
      return <CenterMessage message="Profile is incomplete" />;
    }

    if (!location) {
      if (LocationService.hasPermission()) {
        return (
          <CenterMessage message="Weather forecast is being retrieved" active />
        );
      } else {
        const button = (
          <Button
            title="Give permission"
            onPress={async () =>
              await LocationService.requestPermission().then((granted) => {
                if (granted) LocationService.getLocationAsync();
              })
            }
            type="solid"
            containerStyle={[gStyles.center, { alignSelf: "flex-start" }]}
            buttonStyle={{ backgroundColor: Colors.foreground }}
            titleStyle={[gStyles.normal, { color: Colors.background }]}
          />
        );
        return (
          <>
            <CenterMessage
              message="Does not have permission for current location"
              bottom={button}
            />
          </>
        );
      }
    }

    if (!weatherForecast) {
      return (
        <CenterMessage message="Weather forecast is being retrieved" active />
      );
    }

    return (
      <>
        <View style={{ height: "20%", justifyContent: "center" }}>
          {this.renderTodayWeather()}
        </View>

        <View style={{ height: "60%", justifyContent: "center" }}>
          {this.renderWearRecommendation()}
        </View>

        <View style={{ height: "20%", justifyContent: "center" }}>
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
      </View>
    );
  }
}

type TodayWeatherProps = {
  location: Location | null;
  weatherDescr: string;
  tempUnit: TemperatureUnit;
  dayTemp: number;
  feelsLikeTemp: number;
};

class TodayWeather extends React.Component<TodayWeatherProps, null> {
  render() {
    const locationStr = this.props.location
      ? this.props.location.toString()
      : "Unknown";
    return (
      <>
        <View style={{ marginLeft: "auto", marginRight: "auto" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: 120 }}>
              <WeatherIcon weather={this.props.weatherDescr} size={120} />
            </View>
            <View style={{ width: "60%", justifyContent: "center", top: -10 }}>
              <Text style={[gStyles.shadow, gStyles.xxlarge]}>
                {formatTemp(this.props.dayTemp, this.props.tempUnit)}
              </Text>
              <Text style={[gStyles.shadow, gStyles.small]}>
                feels like{" "}
                {formatTemp(this.props.feelsLikeTemp, this.props.tempUnit)}
              </Text>
            </View>
          </View>
          <View
            style={{
              position: "relative",
              top: -25,
              left: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ marginRight: 7 }}>
              <Icon name="place" size={20} color={Colors.foreground} />
            </View>
            <View>
              <Text style={[gStyles.shadow, gStyles.small]}>{locationStr}</Text>
            </View>
          </View>
        </View>
      </>
    );
  }
}

type WearRecommendationProps = {
  wearRecommendation: Record<any, any>;
  profile: UserProfile;
};

class WearRecommendation extends React.Component<
  WearRecommendationProps,
  null
> {
  render() {
    const tempImages = this.props.wearRecommendation.temp.clothes.map(
      (name) => (
        <ClothingImage
          key={name}
          name={name}
          style={{ width: 50, height: 80, margin: 8 }}
        />
      ),
    );
    const rainImages = this.props.wearRecommendation.rain.clothes.map(
      (name) => (
        <ClothingImage
          key={name}
          name={name}
          style={{ width: 50, height: 80, margin: 8 }}
        />
      ),
    );
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          padding: 18,
          backgroundColor: Colors.darkBackground,
          borderRadius: 5,
        }}
      >
        <View
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            flexDirection: "row",
            flexWrap: "wrap",
            backgroundColor: "none",
            minHeight: 10,
          }}
        >
          {tempImages}
        </View>
        <Text style={[gStyles.large, { marginTop: 0 }]}>
          {this.props.wearRecommendation.temp.msg}
        </Text>
        <View
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            flexDirection: "row",
            flexWrap: "wrap",
            backgroundColor: "none",
            minHeight: 10,
          }}
        >
          {rainImages}
        </View>
        <Text style={[gStyles.large, { marginTop: 0 }]}>
          {this.props.wearRecommendation.rain.msg}
        </Text>
      </View>
    );
  }
}

type CommuteProps = {
  leaveTime: Time;
  weatherDescrAtLeave: string;
  tempAtLeave: number;
  feelsLikeAtLeave: number;
  returnTime: Time;
  weatherDescrAtReturn: string;
  tempAtReturn: number;
  feelsLikeAtReturn: number;
  tempUnit: TemperatureUnit;
};

class Commute extends React.Component<CommuteProps, null> {
  render() {
    return (
      <>
        <Text style={[gStyles.subtitle]}>Commute</Text>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={styles.commuteElem}>
            {this.props.leaveTime && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 10 }}>
                    <Icon
                      name="arrow-forward"
                      size={20}
                      color={Colors.foreground}
                    />
                  </View>
                  <Text style={[gStyles.shadow, gStyles.normal]}>
                    Leave {this.props.leaveTime.toString()}
                  </Text>
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                  <WeatherIcon
                    weather={this.props.weatherDescrAtLeave}
                    size={70}
                  />
                  <View style={{ justifyContent: "center" }}>
                    <Text style={[gStyles.shadow, gStyles.xlarge]}>
                      {formatTemp(this.props.tempAtLeave, this.props.tempUnit)}
                    </Text>
                    <Text style={[gStyles.shadow, gStyles.xsmall]}>
                      feels like{" "}
                      {formatTemp(
                        this.props.feelsLikeAtLeave,
                        this.props.tempUnit,
                      )}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
          <View style={styles.commuteElem}>
            {this.props.returnTime && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 10 }}>
                    <Icon
                      name="arrow-back"
                      size={20}
                      color={Colors.foreground}
                    />
                  </View>
                  <Text style={[gStyles.shadow, gStyles.normal]}>
                    Return {this.props.returnTime.toString()}
                  </Text>
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                  <WeatherIcon
                    weather={this.props.weatherDescrAtReturn}
                    size={70}
                  />
                  <View style={{ justifyContent: "center" }}>
                    <Text style={[gStyles.shadow, gStyles.xlarge]}>
                      {formatTemp(this.props.tempAtReturn, this.props.tempUnit)}
                    </Text>
                    <Text style={[gStyles.shadow, gStyles.xsmall]}>
                      feels like{" "}
                      {formatTemp(
                        this.props.feelsLikeAtReturn,
                        this.props.tempUnit,
                      )}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </>
    );
  }
}

type ClothingImageProps = {
  name: string;
  style: any;
};

class ClothingImage extends React.Component<ClothingImageProps, null> {
  render() {
    return (
      <Image
        source={ClothingImages[this.props.name]}
        resizeMode="contain"
        style={this.props.style}
      />
    );
  }
}

type WeatherIconProps = {
  weather: any;
  size: number;
};

class WeatherIcon extends React.Component<WeatherIconProps, null> {
  render() {
    if (this.props.weather) {
      const url = `http://openweathermap.org/img/wn/${this.props.weather.icon}@2x.png`;
      const accessibilityLabel = this.props.weather.description;
      return (
        <Image
          source={{ uri: url }}
          accessibilityLabel={accessibilityLabel}
          style={{
            width: this.props.size || "100%",
            height: this.props.size || "100%",
          }}
        />
      );
    }
    return null;
  }
}

type CenterMessageProps = {
  message: string;
  active?: boolean;
  bottom?: any;
};

class CenterMessage extends React.Component<CenterMessageProps, null> {
  render() {
    let animation;
    if (this.props.active) {
      animation = <ActivityIndicator size={50} color={Colors.foreground} />;
    } else {
      animation = <Icon name="error" size={40} color={Colors.foreground} />;
    }
    return (
      <>
        <View style={[gStyles.center, gStyles.centerVertical]}>
          {animation}
          <Text
            style={[
              gStyles.large,
              gStyles.shadow,
              gStyles.centerText,
              { marginTop: 20, marginBottom: 20 },
            ]}
          >
            {this.props.message}
          </Text>
          {this.props.bottom}
        </View>
      </>
    );
  }
}

function formatDateToday() {
  return new Date().toDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commuteElem: {
    width: "50%",
    padding: 10,
  },
});
