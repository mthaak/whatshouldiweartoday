export function maxByFn(array, fn) {
  return array.reduce((r, a) => (fn(a) > fn(r) ? a : r));
}

export function minByFn(array, fn) {
  return array.reduce((r, a) => (fn(a) < fn(r) ? a : r));
}

export function copyString(oldString) {
  if (oldString == null)
    return null;
  return oldString.slice();
}

export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) / 1.8;
}
