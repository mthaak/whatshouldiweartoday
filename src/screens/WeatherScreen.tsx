import * as React from "react";
import { useEffect, useState } from "react";
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
  weatherForecast: WeatherForecast | null;
  weatherForecastFailed: boolean;
  timeLastRefreshed?: number;
};

const WeatherScreen: React.FC<any> = (props) => {
  const [state, setState] = useState<WeatherScreenState>({
    profile: null,
    location: null,
    isRefreshing: false,
    weatherForecast: null,
    weatherForecastFailed: false,
    timeLastRefreshed: undefined,
  });

  const navigation = props.navigation;

  useEffect(() => {
    const refreshData = async () => {
      if (
        !state.timeLastRefreshed ||
        (Date.now() - state.timeLastRefreshed) / 1e3 > REFRESH_PERIOD
      ) {
        Promise.all([updateProfile(), updateLocation()]).then(
          ([profile, location]) => refreshWeather(profile, location, false),
        );
        setState((prevState) => ({
          ...prevState,
          timeLastRefreshed: Date.now(),
        }));
      }
    };

    const updateProfileAndThenRefreshWeather = async () => {
      const profile = await updateProfile();
      refreshWeather(profile, state.location, true);
    };

    const updateLocationAndThenRefreshWeather = async () => {
      const location = await updateLocation();
      refreshWeather(state.profile, location);
    };

    const handleMount = async () => {
      refreshData();
      Store.subscribe(updateProfileAndThenRefreshWeather);
      LocationService.subscribe(updateLocationAndThenRefreshWeather);
      WeatherService.subscribe(updateWeather);
    };

    handleMount();

    const focusListener = navigation.addListener("focus", refreshData);

    return () => {
      focusListener();
      Store.unsubscribe(updateProfileAndThenRefreshWeather);
      LocationService.unsubscribe(updateLocationAndThenRefreshWeather);
      WeatherService.unsubscribe(updateWeather);
    };
  }, [state.timeLastRefreshed, state.location, state.profile, navigation]);

  const updateProfile = async () => {
    const profile = await Store.retrieveProfile();
    setProfile(profile);
    return profile;
  };

  const updateLocation = async () => {
    const location = await LocationService.getLocationAsync();
    setLocation(location);
    return location;
  };

  const updateWeather = async () => {
    const { profile, location } = state;
    const weatherForecast = await WeatherService.getWeatherAsync(
      location,
      profile.tempUnit,
    );
    setWeather(weatherForecast);
    return weatherForecast;
  };

  const refreshWeather = async (
    profile: UserProfile,
    location: Location,
    force = false,
  ) => {
    const { isRefreshing } = state;
    if (isRefreshing) return;

    if (profile) {
      if (location?.lon && location.lat) {
        setState((prevState) => ({
          ...prevState,
          isRefreshing: true,
        }));
        try {
          const weatherForecast = await WeatherService.getWeatherAsync(
            location,
            profile.tempUnit,
            force,
          );
          setWeather(weatherForecast);
          setState((prevState) => ({
            ...prevState,
            weatherForecastFailed: false,
          }));
        } catch {
          setState((prevState) => ({
            ...prevState,
            weatherForecastFailed: true,
          }));
        } finally {
          setState((prevState) => ({
            ...prevState,
            isRefreshing: false,
          }));
        }
      } else {
        console.warn(
          "Current location not available. Cannot retrieve weather forecast",
        );
      }
    }
  };

  const setProfile = (profile: UserProfile) => {
    setState((prevState) => ({
      ...prevState,
      profile,
    }));
  };

  const setLocation = (location: Location) => {
    setState((prevState) => ({
      ...prevState,
      location,
    }));
  };

  const setWeather = (weatherForecast: WeatherForecast) => {
    setState((prevState) => ({
      ...prevState,
      weatherForecast,
    }));
  };

  const renderTopBar = () => {
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
            onPress={() => navigation.navigate("Settings", { screen: "Main" })}
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
  };

  const renderTodayWeather = () => {
    const { profile, location, weatherForecast } = state;
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
  };

  const renderWearRecommendation = () => {
    const { profile, weatherForecast } = state;
    const wearRecommendation = getWearRecommendation(weatherForecast, profile);
    return (
      <WearRecommendation
        wearRecommendation={wearRecommendation}
        profile={profile}
      />
    );
  };

  const renderCommuteWeather = () => {
    const { profile, weatherForecast } = state;

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
  };

  const renderContent = () => {
    const {
      profile,
      location,
      weatherForecast,
      isRefreshing,
      weatherForecastFailed,
    } = state;

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
          {renderTodayWeather()}
        </View>

        <View style={{ height: "60%", justifyContent: "center" }}>
          {renderWearRecommendation()}
        </View>

        <View style={{ height: "20%", justifyContent: "center" }}>
          {renderCommuteWeather()}
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container]}>
      {renderTopBar()}
      <View style={{ flex: 1, paddingHorizontal: 15 }}>{renderContent()}</View>
    </View>
  );
};

export default WeatherScreen;

type TodayWeatherProps = {
  location: Location | null;
  weatherDescr: string;
  tempUnit: TemperatureUnit;
  dayTemp: number;
  feelsLikeTemp: number;
};
const TodayWeather: React.FC<TodayWeatherProps> = (props) => {
  const locationStr = props.location ? props.location.toString() : "Unknown";

  return (
    <>
      <View style={{ marginLeft: "auto", marginRight: "auto" }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: 120 }}>
            <WeatherIcon weather={props.weatherDescr} size={120} />
          </View>
          <View style={{ width: "60%", justifyContent: "center", top: -10 }}>
            <Text style={[gStyles.shadow, gStyles.xxlarge]}>
              {formatTemp(props.dayTemp, props.tempUnit)}
            </Text>
            <Text style={[gStyles.shadow, gStyles.small]}>
              feels like {formatTemp(props.feelsLikeTemp, props.tempUnit)}
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
};

type WearRecommendationProps = {
  wearRecommendation: Record<any, any>;
  profile: UserProfile;
};

const WearRecommendation: React.FC<WearRecommendationProps> = (props) => {
  const tempImages = props.wearRecommendation.temp.clothes.map((name) => (
    <ClothingImage
      key={name}
      name={name}
      style={{ width: 50, height: 80, margin: 8 }}
    />
  ));
  const rainImages = props.wearRecommendation.rain.clothes.map((name) => (
    <ClothingImage
      key={name}
      name={name}
      style={{ width: 50, height: 80, margin: 8 }}
    />
  ));
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
        {props.wearRecommendation.temp.msg}
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
        {props.wearRecommendation.rain.msg}
      </Text>
    </View>
  );
};

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

const Commute: React.FC<CommuteProps> = (props) => {
  return (
    <>
      <Text style={[gStyles.subtitle]}>Commute</Text>
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={styles.commuteElem}>
          {props.leaveTime && (
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
                  Leave {props.leaveTime.toString()}
                </Text>
              </View>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <WeatherIcon weather={props.weatherDescrAtLeave} size={70} />
                <View style={{ justifyContent: "center" }}>
                  <Text style={[gStyles.shadow, gStyles.xlarge]}>
                    {formatTemp(props.tempAtLeave, props.tempUnit)}
                  </Text>
                  <Text style={[gStyles.shadow, gStyles.xsmall]}>
                    feels like{" "}
                    {formatTemp(props.feelsLikeAtLeave, props.tempUnit)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
        <View style={styles.commuteElem}>
          {props.returnTime && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ marginRight: 10 }}>
                  <Icon name="arrow-back" size={20} color={Colors.foreground} />
                </View>
                <Text style={[gStyles.shadow, gStyles.normal]}>
                  Return {props.returnTime.toString()}
                </Text>
              </View>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <WeatherIcon weather={props.weatherDescrAtReturn} size={70} />
                <View style={{ justifyContent: "center" }}>
                  <Text style={[gStyles.shadow, gStyles.xlarge]}>
                    {formatTemp(props.tempAtReturn, props.tempUnit)}
                  </Text>
                  <Text style={[gStyles.shadow, gStyles.xsmall]}>
                    feels like{" "}
                    {formatTemp(props.feelsLikeAtReturn, props.tempUnit)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
};

type ClothingImageProps = {
  name: string;
  style: any;
};

const ClothingImage: React.FC<ClothingImageProps> = (props) => {
  return (
    <Image
      source={ClothingImages[props.name]}
      resizeMode="contain"
      style={props.style}
    />
  );
};

type WeatherIconProps = {
  weather: any;
  size: number;
};

const WeatherIcon = (props: WeatherIconProps) => {
  if (props.weather) {
    const url = `http://openweathermap.org/img/wn/${props.weather.icon}@2x.png`;
    const accessibilityLabel = props.weather.description;
    return (
      <Image
        source={{ uri: url }}
        accessibilityLabel={accessibilityLabel}
        style={{
          width: props.size || "100%",
          height: props.size || "100%",
        }}
      />
    );
  }
  return null;
};

type CenterMessageProps = {
  message: string;
  active?: boolean;
  bottom?: any;
};

const CenterMessage: React.FC<CenterMessageProps> = (props) => {
  let animation;
  if (props.active) {
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
          {props.message}
        </Text>
        {props.bottom}
      </View>
    </>
  );
};

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
