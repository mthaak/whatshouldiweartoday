/**
  Returns whether both dates are on the same day.
*/
export function isSameDay(date1: Date, date2: Date): bool {
  return date1.getDate() == date2.getDate()
    && date1.getMonth() == date2.getMonth()
    && date1.getYear() == date2.getYear();
}

/**
  Returns whether given dt (unix timestamp in seconds) is today.
*/
export function isToday(dt: int): bool {
  let date = new Date(dt * 1000);
  let today = new Date();
  return isSameDay(date, today);
}

/**
  Returns whether given dt (unix timestamp in seconds) is in hour (0-24).
*/
export function isInHour(dt, hour): bool {
  let date = new Date(dt * 1000);
  return hour == date.getHours();
}

/**
  Returns whether the given array contains a true value for the current weekday.
*/
export function isTodayTrue(days: Array<bool>): bool {
  let dayOfWeek = (new Date()).getDay();
  return days[dayOfWeek];
}
