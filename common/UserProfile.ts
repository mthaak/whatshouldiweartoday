import { Gender } from './enums'
import Time from './Time';
import Location from './Location';

export default class UserProfile {

  gender: Gender;
  home: Location;
  commuteDays: Array<number>;
  timeLeave: Time;
  timeReturn: Time;
  tempUnit: string;
  timeAlert: Time;

  constructor(
    gender: Gender,
    home: Location,
    commuteDays: Array<number>,
    timeLeave: Time,
    timeReturn: Time,
    tempUnit: string,
    timeAlert: Time
  ) {
    this.gender = gender;
    this.home = home;
    this.commuteDays = commuteDays;
    this.timeLeave = timeLeave;
    this.timeReturn = timeReturn;
    this.tempUnit = tempUnit;
    this.timeAlert = timeAlert;
  }

  static fromObject(obj: Object): UserProfile {
    var profile = Object.assign(new UserProfile(), obj);
    profile.timeLeave = Time.fromObject(obj.timeLeave);
    profile.timeReturn = Time.fromObject(obj.timeReturn);
    return profile;
  }

}
