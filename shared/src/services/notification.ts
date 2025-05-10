import * as Notifications from "expo-notifications";

import UserProfile from "../types/UserProfile";
import { isTodayTrue } from "../utils/timeUtils";
import { formatTemp } from "../utils/weatherUtils";
import { retrieveWeather } from "./weather";
import {
  WearRecommendation,
  WeatherForecastAtTime,
  getTodayWeather,
  getWearRecommendation,
} from "./weatherrules";

export async function getNotificationContent(
  profile: UserProfile,
  openWeatherMapAppId: string,
): Promise<Notifications.NotificationContentInput | undefined> {
  if (
    !profile.alert?.enabled ||
    !profile.alert?.time ||
    !isTodayTrue(profile.alert?.days)
  ) {
    return;
  }

  if (!profile.home) {
    console.warn(
      "Home location not available. Cannot update push notification",
    );
    return;
  }

  const weatherForecast = await retrieveWeather(
    profile.home,
    profile.tempUnit,
    openWeatherMapAppId,
  );

  if (!weatherForecast) {
    console.error("Could not retrieve weather forecast");
    return;
  }

  const wearRecommendation = getWearRecommendation(weatherForecast, profile);
  const todayWeather = getTodayWeather(weatherForecast);
  const content = createContentForWearRecommendation(
    wearRecommendation,
    todayWeather,
    profile,
  );

  return content;
}

export function createContentForWearRecommendation(
  wearRecommendation: WearRecommendation,
  todayWeather: WeatherForecastAtTime,
  profile: UserProfile,
): Record<string, unknown> {
  const temp = todayWeather.temp.day;

  let title =
    wearRecommendation.temp.name + ` (${formatTemp(temp, profile.tempUnit)})`;

  if (wearRecommendation.temp.emojis) {
    title = wearRecommendation.temp.emojis + " " + title;
  }

  if (wearRecommendation.rain.name) {
    title += " with " + wearRecommendation.rain.name.toLowerCase();
    if (wearRecommendation.rain.emojis) {
      title += " " + wearRecommendation.rain.emojis;
    }
  }

  let body = "";

  body += wearRecommendation.temp.msg;
  if (wearRecommendation.temp.clothesEmojis) {
    body += "\n" + wearRecommendation.temp.clothesEmojis;
  }

  if (wearRecommendation.rain.msg) {
    body += "\n" + wearRecommendation.rain.msg;
    if (wearRecommendation.rain.clothesEmojis) {
      body += "\n" + wearRecommendation.rain.clothesEmojis;
    }
  }

  const date = new Date();
  body += `\nLast updated at: ${date.toLocaleString("en-GB")}`;

  return {
    sound: "default",
    title: title,
    body: body,
  };
}
