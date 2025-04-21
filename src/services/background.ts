import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { isTodayTrue } from "../common/timeUtils";
import UserProfile from "../models/UserProfile";
import {
  NotificationService,
  createContentForWearRecommendation,
} from "./NotificationService";
import Store from "./Store";
import WeatherService from "./WeatherService";
import { getTodayWeather, getWearRecommendation } from "./weatherrules";

const INTERVAL = 6 * 3600; // update interval in seconds
const TASK_NAME = "UPDATE_NOTIFICATION";

export async function updateNotification(): Promise<void> {
  const profile = await Store.retrieveProfile();

  if (!profile) {
    console.error("Could not retrieve profile from store");
    return;
  }

  const content = await getNotificationContent(profile);
  if (!content) {
    return;
  }

  const weekday = (new Date().getDay() + 1) % 7;

  // Remove all previous scheduled notifications before scheduling new
  NotificationService.cancelAllScheduledNotifications();
  NotificationService.scheduleNotificationWeekly(
    content,
    weekday,
    profile.alert.time,
  );

  console.log("Notification updated");
}

export async function getNotificationContent(
  profile: UserProfile,
): Promise<Notifications.NotificationContentInput | undefined> {
  if (
    !profile.alert.enabled ||
    !profile.alert.time ||
    !isTodayTrue(profile.alert.days)
  ) {
    return;
  }

  if (!profile.home) {
    console.warn(
      "Home location not available. Cannot update push notification",
    );
    return;
  }

  const weatherForecast = await WeatherService.getWeatherAsync(
    profile.home,
    profile.tempUnit,
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

function defineTask(taskName: string, func: CallableFunction) {
  try {
    TaskManager.defineTask(taskName, async () => {
      try {
        await func();
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
    console.log(`Task ${taskName} defined`);
  } catch (error) {
    console.error(`Task ${taskName} define failed: ${error}`);
  }
}

async function registerBackgroundTask(taskName: string, interval: number) {
  try {
    await BackgroundFetch.registerTaskAsync(taskName, {
      minimumInterval: interval, // in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log(`Task ${taskName} registered`);
  } catch (error) {
    console.log(`Task ${taskName} register failed: ${error}`);
  }
}

async function unregisterBackgroundTask(taskName: string) {
  await BackgroundFetch.unregisterTaskAsync(taskName);
}

async function checkBackgroundFetchAvailable(): Promise<boolean> {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    return true;
  } else if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
    alert(
      "Background fetch is restricted. This means that the notification feature will not be functional.",
    );
    return false;
  } else if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    alert(
      "Background fetch is disabled. This means that the notification feature will not be functional.",
    );
    return false;
  } else {
    return false;
  }
}

let isSetUp = false;
export async function setUpBackgroundTasks(): Promise<void> {
  // To prevent multiple setups
  if (isSetUp) {
    return;
  }
  isSetUp = true;

  const backgroundFetchAvailable = await checkBackgroundFetchAvailable();
  if (!backgroundFetchAvailable) {
    return;
  }

  const notificationsAllowed = await NotificationService.allowsNotifications();
  if (!notificationsAllowed) {
    alert("Notification permissions are not granted by user.");
    return;
  }

  defineTask(TASK_NAME, updateNotification);
}

export async function startBackgroundTasks(): Promise<void> {
  await registerBackgroundTask(TASK_NAME, INTERVAL);
}

export async function stopBackgroundTasks(): Promise<void> {
  await unregisterBackgroundTask(TASK_NAME).catch(() => {
    // ignore errors
  });
  await NotificationService.cancelAllScheduledNotifications();
}
