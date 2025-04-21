/**
  Returns whether both dates are on the same day.
*/
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
  Returns whether given dt (unix timestamp in seconds) is today.
*/
export function isToday(dt: number): boolean {
  const date = new Date(dt * 1000);
  const today = new Date();
  return isSameDay(date, today);
}

/**
  Returns whether given dt (unix timestamp in seconds) is in hour (0-24).
*/
export function isInHour(dt: number, hour: number): boolean {
  const date = new Date(dt * 1000);
  return hour === date.getHours();
}

/**
  Returns whether the given array contains a true value for the current weekday.
*/
export function isTodayTrue(days: boolean[]): boolean {
  const dayOfWeek = new Date().getDay();
  // Conversion needed because weekdays are counted differently in my app
  // Date object: Sunday - Saturday: 0 - 6
  // My app: Monday - Sunday: 0 - 6
  const dayOfWeekMod = (dayOfWeek + 6) % 7;
  return days[dayOfWeekMod];
}