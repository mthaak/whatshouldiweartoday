export default class Time {
  hours: number;
  minutes: number;

  constructor(hours: number, minutes: number) {
    this.hours = hours;
    this.minutes = minutes;
  }

  toString(): string {
    const hoursStr =
      this.hours !== undefined ? this.hours.toString().padStart(2, "0") : "  ";
    const minutesStr =
      this.minutes !== undefined
        ? this.minutes.toString().padStart(2, "0")
        : "  ";
    return hoursStr + ":" + minutesStr;
  }

  static fromObject(obj: Record<string, unknown>): Time {
    return Object.setPrototypeOf(obj, Time.prototype);
  }
}
