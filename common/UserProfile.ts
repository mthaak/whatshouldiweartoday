import { Gender, TemperatureUnit } from './enums'
import Time from './Time'
import Location from './Location'

export default class UserProfile {
  name: string | null
  gender: Gender
  home: Location | null
  commute: UserProfile.Commute
  alert: UserProfile.Alert
  tempUnit: TemperatureUnit

  constructor(
    name: string | null,
    gender: Gender,
    home: Location | null,
    commute: UserProfile.Commute,
    alert: UserProfile.Alert,
    tempUnit: TemperatureUnit
  ) {
    this.name = name
    this.gender = gender
    this.home = home
    this.commute = commute
    this.alert = alert
    this.tempUnit = tempUnit
  }

  static fromObject(obj: Record<string, any>): UserProfile {
    const profile = Object.setPrototypeOf(obj, UserProfile)
    if (profile.home) { profile.home = Location.fromObject(obj.home) }
    if (profile.commute) { profile.commute = this.Commute.fromObject(obj.commute) }
    if (profile.alert) { profile.alert = this.Alert.fromObject(obj.alert) }
    return profile
  }

  static Commute = class {
    days: Array<boolean>
    leaveTime: Time
    returnTime: Time

    constructor(
      days: Array<boolean>,
      leaveTime: Time,
      returnTime: Time
    ) {
      this.days = days
      this.leaveTime = leaveTime
      this.returnTime = returnTime
    }

    static fromObject(obj: Record<string, any>): UserProfile.Commute {
      const commute = Object.setPrototypeOf(obj, UserProfile.Commute.prototype)
      if (commute.leaveTime) { commute.leaveTime = Time.fromObject(obj.leaveTime) }
      if (commute.returnTime) { commute.returnTime = Time.fromObject(obj.returnTime) }
      return commute
    }
  }

  static Alert = class {
    days: Array<boolean>
    enabled: boolean
    time: Time

    constructor(
      enabled: boolean,
      days: Array<boolean>,
      time: Time
    ) {
      this.enabled = enabled
      this.days = days
      this.time = time
    }

    static fromObject(obj: Record<string, any>): UserProfile.Alert {
      const alert = Object.setPrototypeOf(obj, UserProfile.Alert.prototype)
      if (alert.time) { alert.time = Time.fromObject(obj.time) }
      return alert
    }
  }
}

declare namespace UserProfile {
  type Commute = typeof UserProfile.Commute.prototype
  type Alert = typeof UserProfile.Alert.prototype
}
