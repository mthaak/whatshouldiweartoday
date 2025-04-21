import { Time } from "../types/Time";
import UserProfile from "../types/UserProfile";
import WeatherForecast from "../types/WeatherForecast";
import { Gender, TemperatureUnit } from "../types/enums";
import { isInHour, isToday, isTodayTrue } from "../utils/timeUtils";
import {
  capitalizeFirstLetterOnly,
  fahrenheitToCelsius,
  minByFn,
} from "../utils/utils";
import { rainOrder } from "./rainorder";

// TODO define more strict types
export type WeatherForecastAtTime = Record<string, any>;
export type WearRecommendation = Record<string, any>;
export type TempRecommendation = Record<string, any>;
export type RainRecommendation = Record<string, any>;

export function getTodayWeather(
  weatherForecast: WeatherForecast,
): WeatherForecastAtTime {
  // Extracts the weather today from the weather forecast
  return weatherForecast.daily.find((dailyForecast: { dt: number }) =>
    isToday(dailyForecast.dt),
  );
}

export function getWeatherAtTime(
  weatherForecast: WeatherForecast,
  time: Time,
): WeatherForecastAtTime {
  // Extracts the weather at a certain time from the weather forecast
  return weatherForecast.hourly.find((forecast: { dt: number }) =>
    isInHour(forecast.dt, time.hours),
  );
}

export function getWearRecommendation(
  weatherForecast: WeatherForecast,
  profile: UserProfile,
): WearRecommendation {
  // Determines the wear recommendation for the weather of today
  const tempRecommendation = getTempRecommendation(weatherForecast, profile);
  const rainRecommendation = getRainRecommendation(weatherForecast, profile);
  return {
    temp: tempRecommendation,
    rain: rainRecommendation,
  };
}

export function getHourlyForecast(
  weatherForecast: WeatherForecast,
  hour: number,
): WeatherForecastAtTime {
  return weatherForecast.hourly.find((forecast: { dt: number }) =>
    isInHour(forecast.dt, hour),
  );
}

function getTempRecommendation(
  weatherForecast: WeatherForecast,
  profile: UserProfile,
): TempRecommendation {
  let feelsLike = getTodayWeather(weatherForecast).feels_like.day;
  if (profile.tempUnit === TemperatureUnit.FAHRENHEIT) {
    feelsLike = fahrenheitToCelsius(feelsLike);
  }
  if (feelsLike >= 50) {
    // extremely hot
    return {
      name: "Extremely hot",
      msg: "Don't go out, but if you must, take all precautions: Wear airy clothes and open shoes, and bring plenty of water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender === Gender.MAN
          ? ["man_long_sleeve_buttoned", "man_long_pants"]
          : ["woman_long_sleeve_lined", "woman_long_pants_gray"],
      ),
      emojis: "☀️🥵",
      clothesEmojis: "🕶️".concat(
        profile.gender === Gender.MAN ? "🧢👕🩳" : "👒👗👡",
      ),
    };
  } else if (feelsLike >= 40) {
    // very hot
    return {
      name: "Very hot",
      msg: "It will be very hot. Wear something airy and open shoes to be more comfortable. Also bring plenty of water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender === Gender.MAN
          ? ["man_striped_tshirt", "man_shorts_yellow", "man_light_shoe"]
          : ["woman_dress", "woman_open_shoe"],
      ),
      emojis: "☀️🥵",
      clothesEmojis: "🕶️".concat(
        profile.gender === Gender.MAN ? "🧢👕🩳" : "👒👗👡",
      ),
    };
  } else if (feelsLike >= 30) {
    // hot
    return {
      name: "Hot",
      msg: "It will be hot. Wear something short and open shoes to be more comfortable. Also bring plenty of water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender === Gender.MAN
          ? ["man_striped_tshirt", "man_shorts_yellow", "man_light_shoe"]
          : ["woman_dress", "woman_open_shoe"],
      ),
      emojis: "☀️",
      clothesEmojis: "🕶️".concat(
        profile.gender === Gender.MAN ? "🧢👕🩳" : "👒👗👡",
      ),
    };
  } else if (feelsLike >= 20) {
    // warm
    return {
      name: "Warm",
      msg: "It will be warm. Wear something short but also bring extra layers for the colder parts of the day. Also bring extra water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender === Gender.MAN
          ? ["man_striped_tshirt", "man_shorts", "man_long_sleeve_buttoned"]
          : [
              "woman_long_sleeve",
              "woman_tshirt_yellow",
              "woman_skirt_with_belt",
            ],
      ),
      emojis: "", // TODO find emojis?
      clothesEmojis: "🕶️".concat(
        profile.gender === Gender.MAN ? "🧢👕🩳" : "👒👗👡",
      ),
    };
  } else if (feelsLike >= 15) {
    // moderate
    return {
      name: "Moderate",
      msg: "The temperature will be moderate. Wear a thin jacket and dress in layers to be prepared for the colder parts of the day.",
      clothes:
        profile.gender === Gender.MAN
          ? ["man_sports_jacket", "man_long_sleeve_buttoned", "man_long_pants"]
          : [
              "woman_long_sleeve",
              "woman_tshirt_yellow",
              "woman_long_pants_gray",
            ],
      emojis: "", // TODO find emojis?
      clothesEmojis: "".concat(
        profile.gender === Gender.MAN ? "👕👖👟" : "👒👗👡",
      ),
    };
  } else if (feelsLike >= 10) {
    // chilly
    return {
      name: "Chilly",
      msg: "It will be chilly. Wear long, layered clothes and bring a thin jacket.",
      clothes:
        profile.gender === Gender.MAN
          ? ["man_sports_jacket", "man_long_sleeve_buttoned", "man_long_pants"]
          : [
              "woman_long_sleeve_lined",
              "woman_tshirt",
              "woman_long_pants_gray",
            ],
      emojis: "", // TODO find emojis?
      clothesEmojis: "🧥".concat(profile.gender === Gender.MAN ? "👖👟" : ""),
    };
  } else if (feelsLike >= -5) {
    // cold
    return {
      name: "Cold",
      msg: "It will be cold. Wear long, layered clothes, a thick jacket, gloves, hat and anything to keep you warm and snug.",
      clothes:
        profile.gender === Gender.MAN
          ? [
              "man_beanie_hat",
              "man_winter_jacket",
              "man_winter_jumper",
              "man_long_pants",
            ]
          : [
              "man_beanie_hat",
              "woman_long_coat_gray",
              "woman_long_sleeve_buttoned",
              "woman_tight_pants_blue",
            ],
      emojis: "❄️",
      clothesEmojis: "🧥🧣🧤".concat(
        profile.gender === Gender.MAN ? "👖👟" : "👢",
      ),
    };
  } else if (feelsLike >= -25) {
    // very cold
    return {
      name: "Very cold",
      msg: "It will be very cold. Wear long, multiple-layered clothes, a thick jacket, thick gloves and a warm hat.",
      clothes:
        profile.gender === Gender.MAN
          ? [
              "man_beanie_hat",
              "man_winter_jacket",
              "man_winter_jumper",
              "man_long_pants",
              "man_boot",
            ]
          : [
              "man_beanie_hat",
              "woman_long_coat_gray",
              "woman_long_sleeve_buttoned",
              "woman_tight_pants_blue",
              "man_boot",
            ],
      emojis: "❄️🥶",
      clothesEmojis: "🧥🧣🧤".concat(
        profile.gender === Gender.MAN ? "👖🥾" : "👢",
      ),
    };
  } // if (feelsLike < -25) extremely cold
  else {
    return {
      name: "Extremely cold",
      msg: "Don't go out, but if you must, take all precautions: wear long, multiple-layered clothes, a thick jacket, thick gloves and a warm hat.",
      clothes:
        profile.gender === Gender.MAN
          ? [
              "man_beanie_hat",
              "man_winter_jacket",
              "man_winter_jumper",
              "man_long_pants",
              "man_boot",
            ]
          : [
              "man_beanie_hat",
              "woman_long_coat_gray",
              "woman_long_sleeve_buttoned",
              "woman_tight_pants_blue",
              "man_boot",
            ],
      emojis: "❄️🥶",
      clothesEmojis: "🧥🧣🧤".concat(
        profile.gender === Gender.MAN ? "👖🥾" : "👢",
      ),
    };
  }
}

function getRainRecommendation(
  weatherForecast: WeatherForecast,
  profile: UserProfile,
): RainRecommendation {
  let weathers: WeatherForecast[] = [];
  if (isTodayTrue(profile.commute.days)) {
    if (profile.commute.leaveTime) {
      weathers = weathers.concat(
        getHourlyForecast(weatherForecast, profile.commute.leaveTime.hours)
          .weather,
      );
    }
    if (profile.commute.returnTime) {
      weathers = weathers.concat(
        getHourlyForecast(weatherForecast, profile.commute.returnTime.hours)
          .weather,
      );
    }
  }
  if (weathers.length === 0) {
    weathers = getTodayWeather(weatherForecast).weather;
  }

  const noRecommendation = {
    name: null,
    msg: null,
    clothes: [],
    emojis: null,
    clothesEmojis: null,
  };

  const rainWeathers = weathers.filter((w) =>
    ["Snow", "Thunderstorm", "Rain", "Drizzle"].includes(w.main),
  );
  if (rainWeathers.length === 0) {
    return noRecommendation;
  }

  const worstWeather = minByFn(rainWeathers, (w) =>
    rainOrder.indexOf(w.description),
  ); // weather with worst rain according to rain order

  if (worstWeather === null) {
    return noRecommendation;
  }

  const name = worstWeather.description
    ? capitalizeFirstLetterOnly(worstWeather.description)
    : null;
  if (worstWeather.main === "Snow") {
    return {
      name: name,
      msg: `Also, there will be ${worstWeather.description}. Be careful when you go out. The roads may be slippery.`,
      clothes: [],
      emojis: "🌨️",
      clothesEmojis: "",
    };
  } else if (worstWeather.main === "Thunderstorm") {
    return {
      name: name,
      msg: `Also, there will be a ${worstWeather.description}. Don't go out but if you have to, prepare well.`,
      clothes: ["umbrella_short", "rain_boot"],
      emojis: "⛈️",
      clothesEmojis: "🌂",
    };
  } else if (worstWeather.main === "Rain") {
    return {
      name: name,
      msg: `Also, there will be ${worstWeather.description}, so wear water-resistant clothing and bring an umbrella.`,
      clothes: ["umbrella_short", "rain_boot"],
      emojis: "🌧️",
      clothesEmojis: "🌂",
    };
  } else if (worstWeather.main === "Drizzle") {
    return {
      name: name,
      msg: `Also, there will be ${worstWeather.description}, so wear water resistant clothes.`,
      clothes: ["umbrella_short"],
      emojis: "🌧️",
      clothesEmojis: "🌂",
    };
  } else {
    return noRecommendation;
  }
}

// todo use linear interpolation for weather during  period (e.g. commute)
// todo atmosphere: dust, fog, tornado, etc.
// todo sun protection
// todo compare with yesterday?
