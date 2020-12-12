import 'moment'

import { isInHour, isToday } from '../common/timeutils'
import { UserProfile } from '../common/UserProfile';
import { Gender } from '../common/enums';
import { rainOrder } from './rainorder';
import { minByFn } from '../common/utils'

export function getTodayWeather(weatherForecast: Object) {
  // Extracts the weather today from the weather forecast
  return weatherForecast.daily.find(dailyForecast => isToday(dailyForecast.dt));
}

export function getWeatherAtTime(weatherForecast: Object, time: Time) {
  // Extracts the weather at a certain time from the weather forecast
  return weatherForecast.hourly.find(forecast => isInHour(forecast.dt, time.hour));
}

export function getWearRecommendation(weatherForecast: Object, profile: UserProfile) {
  // Determines the wear recommendation for the weather of today
  let tempRecommendation = getTempRecommendation(weatherForecast, profile);
  let rainRecommendation = getRainRecommendation(weatherForecast, profile);
  return {
    temp: tempRecommendation,
    rain: rainRecommendation,
  }
}

export function getHourlyForecast(weatherForecast: Object, hour) {
  return weatherForecast.hourly.find(forecast => isInHour(forecast.dt, hour));
}

function getTempRecommendation(weatherForecast: Object, profile: UserProfile) {
  let feelsLike = getTodayWeather(weatherForecast).feels_like.day;
  if (feelsLike >= 50) // extremely hot
    return {
      msg: "Don't go out, but if you must, take all precautions: Wear [short/airy] clothes and open shoes, and bring plenty of water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender == Gender.MAN
          ? ["man_long_sleeve_buttoned", "man_long_pants"]
          : ["woman_long_sleeve_lined", "woman_long_pants_gray"]),
    }
  else if (feelsLike >= 40) // very hot
    return {
      msg: "It will be very hot. Wear something [short/airy] and open shoes to be more comfortable. Also bring plenty of water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender == Gender.MAN
          ? ["man_striped_tshirt", "man_shorts_yellow", "man_light_shoe"]
          : ["woman_dress", "woman_open_shoe"]),
    }
  else if (feelsLike >= 30) // hot
    return {
      msg: "It will be hot. Wear something [short/airy] and open shoes to be more comfortable. Also bring plenty of water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender == Gender.MAN
          ? ["man_striped_tshirt", "man_shorts_yellow", "man_light_shoe"]
          : ["woman_dress", "woman_open_shoe"]),
    }
  else if (feelsLike >= 20) // warm
    return {
      msg: "It will be warm. Wear something [short/airy] but also bring extra layers for the colder parts of the day. Also bring extra water.",
      clothes: ["sunglasses", "man_cap"].concat(
        profile.gender == Gender.MAN
          ? ["man_striped_tshirt", "man_shorts", "main_long_sleeve_buttoned"]
          : ["woman_long_sleeve", "woman_tshirt_yellow", "woman_skirt_with_belt"]),
    }
  else if (feelsLike >= 15) // moderate
    return {
      msg: "The temperature will be moderate. Wear a thin jacket and dress in layers to be prepared for the colder parts of the day.",
      clothes: [].concat(
        profile.gender == Gender.MAN
          ? ["man_sports_jacket", "man_long_sleeve_buttoned", "man_long_pants"]
          : ["woman_long_sleeve", "woman_tshirt_yellow", "woman_long_pants_gray"]),
    }
  else if (feelsLike >= 10) // chilly
    return {
      msg: "It will be chilly. Wear long, layered clothes and bring a thin jacket.",
      clothes: [].concat(
        profile.gender == Gender.MAN
          ? ["man_sports_jacket", "man_long_sleeve_buttoned", "man_long_pants"]
          : ["woman_long_sleeve_lined", "woman_tshirt", "woman_long_pants_gray"]),
    }
  else if (feelsLike >= -5) // cold
    return {
      msg: "It will be cold. Wear long, layered clothes, a thick jacket, gloves, hat and anything to keep you warm and snug.",
      clothes: [].concat(
        profile.gender == Gender.MAN
          ? ["man_beanie_hat", "man_winter_jacket", "man_winter_jumper", "man_long_pants"]
          : ["man_beanie_hat", "woman_long_coat_gray", "woman_long_sleeve_buttoned", "woman_tights_blue"]),
    }
  else if (feelsLike >= -25) // very cold
    return {
      msg: "It will be very cold. Wear long, multiple-layered clothes, a thick jacket, thick gloves and a warm hat.",
      clothes: [].concat(
        profile.gender == Gender.MAN
          ? ["man_beanie_hat", "man_winter_jacket", "man_winter_jumper", "man_long_pants", "man_boot"]
          : ["man_beanie_hat", "woman_long_coat_gray", "woman_long_sleeve_buttoned", "woman_tights_blue", "man_boot"]),
    }
  else if (feelsLike < -25) // extremely cold
    return {
      msg: "Don't go out, but if you must, take all precautions: wear long, multiple-layered clothes, a thick jacket, thick gloves and a warm hat.",
      clothes: [].concat(
        profile.gender == Gender.MAN
          ? ["man_beanie_hat", "man_winter_jacket", "man_winter_jumper", "man_long_pants", "man_boot"]
          : ["man_beanie_hat", "woman_long_coat_gray", "woman_long_sleeve_buttoned", "woman_tights_blue", "man_boot"]),
    }
}

function getRainRecommendation(weatherForecast: Object, profile: UserProfile) {
  let weathers = [];
  if (profile.timeLeave)
    weathers = weathers.concat(getHourlyForecast(weatherForecast, profile.timeLeave.hour)['weather']);
  if (profile.timeReturn)
    weathers = weathers.concat(getHourlyForecast(weatherForecast, profile.timeReturn.hour)['weather']);
  if (weathers == [])
    weathers = getTodayWeather(weatherForecast)['weather'];
  let rainWeathers = weathers.filter(w => ["Thunderstorm", "Rain", "Drizzle"].includes(w['main']))
  if (rainWeathers.length === 0)
    return {
      msg: null,
      clothes: [],
    };
  console.log(rainWeathers)
  let worstWeather = minByFn(rainWeathers, w => rainOrder.indexOf(w['description'])); // weather with worst rain according to rain order

  if (worstWeather == null)
    return {
      msg: null,
      clothes: [],
    };
  if (worstWeather['main'] == 'Thunderstorm')
    return {
      msg: `Also, there will a ${worstWeather['description']}. Don't go out but if you have to, prepare well.`,
      clothes: ["umbrella_short", "rain_boot"]
    }
  else if (worstWeather['main'] == 'Rain')
    return {
      msg: `Also, there will a ${worstWeather['description']}, so wear water-resistant clothing and bring an umbrella.`,
      clothes: ["umbrella_short", "rain_boot"]
    }
  else if (worstWeather['main'] == 'Drizzle')
    return {
      msg: `Also, there will a ${worstWeather['description']}, so wear water resistant clothes.`,
      clothes: ["umbrella_short"]
    }
}

// todo use linear interpolation
// todo storm, snow, emergency
// todo sun protection
// todo compare with yesterday?
