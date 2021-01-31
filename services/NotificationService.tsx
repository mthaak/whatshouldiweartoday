import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';

import { formatTemp } from '../common/weatherutils'

class NotificationService {

  expoPushToken: string;

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

  scheduleNotificationWeekly(content, weekday: number, time: Time) {
    Notifications.scheduleNotificationAsync({
      content: content,
      trigger: createWeeklyTrigger(weekday, time),
    });
  }

  scheduleNotificationImmediately(content) {
    Notifications.scheduleNotificationAsync({
      content: content,
      trigger: null, // means schedule immediately
    });
  }

  cancelAllScheduledNotifications() {
    return Notifications.cancelAllScheduledNotificationsAsync();
  }

  async requestPermission() {
    const permission = await Notifications.requestPermissionsAsync();
    let granted = this._isPermissionGranted(permission)
    if (!granted)
      console.error('Permission to send notifications not given by user')
    return permission;
  }

  async allowsNotifications() {
    const settings = await Notifications.getPermissionsAsync();
    return this._isPermissionGranted(settings);
  }

  _isPermissionGranted(permission: NotificationPermissionStatus) {
    return permission.granted || permission.ios ?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

}

const notificationService = new NotificationService();

export { notificationService as NotificationService };

export function createContentForWearRecommendation(wearRecommendation, todayWeather, tempUnit) {
  let temp = todayWeather.temp.day;

  let title = wearRecommendation.temp.name + ` (${formatTemp(temp, tempUnit)})`;

  if (wearRecommendation.temp.emojis)
    title = wearRecommendation.temp.emojis + ' ' + title;

  if (wearRecommendation.rain.name) {
    title += ' with ' + wearRecommendation.rain.name.toLowerCase();
    if (wearRecommendation.rain.emojis)
      title += ' ' + wearRecommendation.rain.emojis;
  }

  let body = wearRecommendation.temp.msg;
  if (wearRecommendation.temp.clothesEmojis)
    body += '\n' + wearRecommendation.temp.clothesEmojis;

  if (wearRecommendation.rain.msg) {
    body += '\n' + wearRecommendation.rain.msg;
    if (wearRecommendation.rain.clothesEmojis)
      body += '\n' + wearRecommendation.rain.clothesEmojis;
  }

  return {
    sound: 'default',
    title: title,
    body: body,
  };
}

export function createWeeklyTrigger(weekday: number, time: Time) {
  // Note: Weekdays are specified with a number from 1 through 7, with 1 indicating Sunday
  return {
    weekday: weekday,
    hour: time.hours,
    minute: time.minutes,
    repeats: true,
  }
}
