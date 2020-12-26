export function isSameDay(date1: Date, date2: Date): bool {
  return date1.getDate() == date2.getDate()
    && date1.getMonth() == date2.getMonth()
    && date1.getYear() == date2.getYear();
}

export function isToday(dt: int): bool {
  let date = new Date(dt * 1000);
  let today = new Date();
  return isSameDay(date, today);
}

export function isInHour(dt, hour): bool {
  // let timezoneOffset = (new Date()).getTimezoneOffset();
  let date = new Date(dt * 1000);
  return hour == date.getHours();
}

export function isCommuteToday(commuteDays: Array<bool>): bool {
  let dayOfWeek = (new Date()).getDay();
  return commuteDays[dayOfWeek];
}
