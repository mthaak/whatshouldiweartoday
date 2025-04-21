import * as Notifications from "expo-notifications";

import {
  WearRecommendation,
  WeatherForecastAtTime,
} from "../../shared/src/services/weatherrules";
import { formatTemp } from "../../shared/src/utils/weatherUtils";
import UserProfile from "../../shared/types/UserProfile";
import Time from "../models/Time";

class NotificationService {
  permission: Promise<boolean> | null = null;

  constructor() {
    this._setNotificationHandler();
  }

  _setNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }

  scheduleNotificationWeekly(
    content: Notifications.NotificationContentInput,
    weekday: number,
    time: Time,
  ) {
    Notifications.scheduleNotificationAsync({
      content: content,
      trigger: createWeeklyTrigger(weekday, time),
    });
  }

  scheduleNotificationImmediately(
    content: Notifications.NotificationContentInput,
  ) {
    Notifications.scheduleNotificationAsync({
      content: content,
      trigger: null, // means schedule immediately
    });
  }

  async cancelAllScheduledNotifications() {
    return await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async requestPermission() {
    const permission = await Notifications.requestPermissionsAsync();
    const granted = this._isPermissionGranted(permission);
    if (!granted) {
      console.error("Permission to send notifications not given by user");
      return false;
    }
    return true;
  }

  async getPermission(): Promise<boolean> {
    if (this.permission) {
      return await this.permission;
    }
    this.permission = this.requestPermission();
    return await this.permission;
  }

  async allowsNotifications() {
    const settings = await Notifications.getPermissionsAsync();
    return this._isPermissionGranted(settings);
  }

  _isPermissionGranted(
    permission: Notifications.NotificationPermissionsStatus,
  ) {
    return (
      permission.granted ||
      permission.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }
}

const notificationService = new NotificationService();

export { notificationService as NotificationService };

export function createWeeklyTrigger(
  weekday: number,
  time: Time,
): Notifications.NotificationTriggerInput {
  // Note: Weekdays are specified with a number from 1 through 7, with 1 indicating Sunday
  return {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: weekday,
    hour: time.hours,
    minute: time.minutes,
  };
}
