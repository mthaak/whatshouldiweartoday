import * as Notifications from 'expo-notifications'

import { formatTemp } from '../common/weatherutils'

class NotificationService {
  expoPushToken: string
  permission: Promise<bool>

  constructor() {
    this._setNotificationHandler()
  }

  _setNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
      })
    })
  }

  scheduleNotificationWeekly(content, weekday: number, time: Time) {
    Notifications.scheduleNotificationAsync({
      content: content,
      trigger: createWeeklyTrigger(weekday, time)
    })
  }

  scheduleNotificationImmediately(content) {
    Notifications.scheduleNotificationAsync({
      content: content,
      trigger: null // means schedule immediately
    })
  }

  async cancelAllScheduledNotifications() {
    return await Notifications.cancelAllScheduledNotificationsAsync()
  }

  async requestPermission() {
    const permission = await Notifications.requestPermissionsAsync()
    const granted = this._isPermissionGranted(permission)
    if (!granted) {
      console.error('Permission to send notifications not given by user')
      return false
    }
    return true
  }

  async getPermission(): Promise<bool> {
    if (this.permission) { return await this.permission }
    this.permission = this.requestPermission()
    return await this.permission
  }

  async allowsNotifications() {
    const settings = await Notifications.getPermissionsAsync()
    return this._isPermissionGranted(settings)
  }

  _isPermissionGranted(permission: NotificationPermissionStatus) {
    return permission.granted || permission.ios ?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  }
}

const notificationService = new NotificationService()

export { notificationService as NotificationService }

export function createContentForWearRecommendation(wearRecommendation: WearRecommendation, todayWeather: WeatherForecastAtTime, profile: UserProfile): Record<string, unknown> {
  const temp = todayWeather.temp.day

  let title = wearRecommendation.temp.name + ` (${formatTemp(temp, profile.tempUnit)})`

  if (wearRecommendation.temp.emojis) { title = wearRecommendation.temp.emojis + ' ' + title }

  if (wearRecommendation.rain.name) {
    title += ' with ' + wearRecommendation.rain.name.toLowerCase()
    if (wearRecommendation.rain.emojis) { title += ' ' + wearRecommendation.rain.emojis }
  }

  let body = ''

  body += wearRecommendation.temp.msg
  if (wearRecommendation.temp.clothesEmojis) { body += '\n' + wearRecommendation.temp.clothesEmojis }

  if (wearRecommendation.rain.msg) {
    body += '\n' + wearRecommendation.rain.msg
    if (wearRecommendation.rain.clothesEmojis) { body += '\n' + wearRecommendation.rain.clothesEmojis }
  }

  const date = new Date()
  body += '\n' + `Last updated at: ${date.toLocaleString('en-GB')}`

  return {
    sound: 'default',
    title: title,
    body: body
  }
}

export function createWeeklyTrigger(weekday: number, time: Time): Record<string, unknown> {
  // Note: Weekdays are specified with a number from 1 through 7, with 1 indicating Sunday
  return {
    weekday: weekday,
    hour: time.hours,
    minute: time.minutes,
    repeats: true
  }
}
