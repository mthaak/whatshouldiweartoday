export function maxByFn(array: Array<number>, fn: (x: number) => number): Array<number> {
  return array.reduce((r, a) => (fn(a) > fn(r) ? a : r))
}

export function minByFn(array: Array<number>, fn: (x: number) => number): Array<number> {
  return array.reduce((r, a) => (fn(a) < fn(r) ? a : r))
}

export function copyString(oldString: string): string {
  if (oldString == null) { return null }
  return oldString.slice()
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) / 1.8
}

export function capitalizeFirstLetterOnly(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
