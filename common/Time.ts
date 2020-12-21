export default class Time {
  hours: int;
  minutes: int;

  constructor(hours: int, minutes: int) {
    this.hours = hours;
    this.minutes = minutes;
  }

  toString() {
    let hoursStr = this.hours !== undefined ? this.hours.toString().padStart(2, '0') : "  ";
    let minutesStr = this.minutes !== undefined ? this.minutes.toString().padStart(2, '0') : "  ";
    return hoursStr + ':' + minutesStr;
  }

  static fromObject(obj: Object) {
    return Object.assign(new Time(), obj);
  }

}
