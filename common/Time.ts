export default class Time {
  hour: int;
  minute: int;

  constructor(hour: int, minute: int) {
    this.hour = hour;
    this.minute = minute;
  }

  toString() {
    return this.hour.toString().padStart(2, '0') + ':' + this.minute.toString().padStart(2, '0')
  }

  static fromObject(obj: Object) {
    return Object.assign(new Time(), obj);
  }

}
