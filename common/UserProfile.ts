import { Gender, TemperatureUnit } from './enums'
import Time from './Time';
import Location from './Location';

export default class UserProfile {

  name: string;
  gender: Gender;
  home: Location;
  commute: Commute;
  alert: Alert;
  tempUnit: TemperatureUnit;

  constructor(
    name: String,
    gender: Gender,
    home: Location,
    commute: Commute,
    alert: Alert,
    tempUnit: TemperatureUnit,
  ) {
    this.name = name;
    this.gender = gender;
    this.home = home;
    this.commute = commute;
    this.alert = alert;
    this.tempUnit = tempUnit;
  }

  static fromObject(obj: Object): UserProfile {
    var profile = Object.assign(new UserProfile(), obj);
    profile.home = Location.fromObject(obj.home);
    profile.commute = this.Commute.fromObject(obj.commute);
    profile.alert = this.Alert.fromObject(obj.alert);
    return profile;
  }

  static Commute = class {

    days: Array<number>;
    leaveTime: Time;
    returnTime: Time;

    constructor(
      days: Array<number>,
      leaveTime: Time,
      returnTime: Time,
    ) {
      this.days = days;
      this.leaveTime = leaveTime;
      this.returnTime = returnTime;
    }

    static fromObject(obj: Object): UserProfile {
      var commute = Object.assign(new UserProfile.Commute(), obj);
      commute.leaveTime = Time.fromObject(obj.leaveTime);
      commute.returnTime = Time.fromObject(obj.returnTime);
      return commute;
    }

  }

  static Alert = class {

    enabled: boolean;
    time: Time;

    constructor(
      enabled: boolean,
      time: Time,
    ) {
      this.enabled = enabled;
      this.time = time;
    }

    static fromObject(obj: Object): Alert {
      var alert = Object.assign(new UserProfile.Alert(), obj);
      alert.time = Time.fromObject(obj.time);
      return alert;
    }

  }

}
