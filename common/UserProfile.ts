import { Gender, TemperatureUnit } from './enums'
import Time from './Time'
import Location from './Location'

export default class UserProfile {
  name: string
  gender: Gender
  home: Location
  commute: Commute
  alert: Alert
  tempUnit: TemperatureUnit

  constructor(
    name: string,
    gender: Gender,
    home: Location,
    commute: Commute,
    alert: Alert,
    tempUnit: TemperatureUnit
  ) {
    this.name = name
    this.gender = gender
    this.home = home
    this.commute = commute
    this.alert = alert
    this.tempUnit = tempUnit
  }

  static fromObject(obj: Record<string, unknown>): UserProfile {
    const profile = Object.assign(new UserProfile(), obj)
    if (profile.home) { profile.home = Location.fromObject(obj.home) }
    if (profile.commute) { profile.commute = this.Commute.fromObject(obj.commute) }
    if (profile.alert) { profile.alert = this.Alert.fromObject(obj.alert) }
    return profile
  }

  static Commute = class {
    days: number[]
    leaveTime: Time
    returnTime: Time

    constructor(
      days: number[],
      leaveTime: Time,
      returnTime: Time
    ) {
      this.days = days
      this.leaveTime = leaveTime
      this.returnTime = returnTime
    }

    static fromObject(obj: Record<string, unknown>): UserProfile {
      const commute = Object.assign(new UserProfile.Commute(), obj)
      if (commute.leaveTime) { commute.leaveTime = Time.fromObject(obj.leaveTime) }
      if (commute.returnTime) { commute.returnTime = Time.fromObject(obj.returnTime) }
      return commute
    }
  }

  static Alert = class {
    days: number[]
    enabled: boolean
    time: Time

    constructor(
      enabled: boolean,
      days: number[],
      time: Time
    ) {
      this.enabled = enabled
      this.days = days
      this.time = time
    }

    static fromObject(obj: Record<string, unknown>): Alert {
      const alert = Object.assign(new UserProfile.Alert(), obj)
      if (alert.time) { alert.time = Time.fromObject(obj.time) }
      return alert
    }
  }
}
