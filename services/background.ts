import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

import store from './store';
import weatherService from './WeatherService'
import { notificationService, createContentFromWearRecommendation } from './NotificationService';
import { getWearRecommendation } from './weatherrules'

const INTERVAL = 3600; // update interval in seconds
const TASK_NAME = 'UPDATE_NOTIFICATION'

async function updateNotification() {
  let profile = await store.retrieveProfile();

  if (!profile) {
    console.error('Could not retrieve profile from store')
    return;
  }

  if (!profile.alert.enabled || !profile.alert.time)
    return; // alert is disabled

  if (!profile.home) {
    console.warn('Home location not available. Cannot update push notification');
    return;
  }

  let weatherForecast = await weatherService.getWeatherAsync(profile.home, profile.tempUnit, true);

  if (!weatherForecast) {
    console.error('Could not retrieve weather forecast');
    return;
  }

  let wearRecommendation = getWearRecommendation(weatherForecast, profile);
  let content = createContentFromWearRecommendation(wearRecommendation);
  // Remove all previous scheduled notifications before scheduling new
  notificationService.cancelAllScheduledNotifications();
  notificationService.scheduleNotification(content, profile.alert.time);
  console.log('Alert updated');
}

function defineTask(taskName, func) {
  TaskManager.defineTask(taskName, () => {
    try {
      func();
      console.log(`Task ${taskName} defined`);
      return BackgroundFetch.Result.NewData;
    } catch (error) {
      console.error(`Task ${taskName} define failed: ${error}`);
      return BackgroundFetch.Result.Failed
    }
  })
}

async function registerBackgroundTask(taskName, interval) {
  try {
    await BackgroundFetch.registerTaskAsync(taskName, {
      minimumInterval: interval, // seconds,
    })
    console.log(`Task ${taskName} registered`)
  } catch (error) {
    console.log(`Task ${taskName} register failed: ${error}`)
  }
}

let isSetUp = false;
export function setUpBackgroundTasks() {
  if (!isSetUp) { // to prevent multiple setups
    isSetUp = true;
    notificationService.allowsNotifications().then(granted => {
      if (granted) {
        defineTask(TASK_NAME, updateNotification);
        registerBackgroundTask(TASK_NAME, INTERVAL);
      } else {
        alert('Notification permissions are not granted by user')
      }
    });
  }
}
