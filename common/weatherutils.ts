import { TemperatureUnit } from '../common/enums'

export function formatTemperatureUnit(unit: TemperatureUnit): string {
  switch (unit) {
    case TemperatureUnit.CELSIUS:
      return 'C'
    case TemperatureUnit.FAHRENHEIT:
      return 'F'
  }
}

export function formatTemp(temp: number, unit: TemperatureUnit): string {
  return (Math.round(temp * 10) / 10).toString() + '°' + formatTemperatureUnit(unit)
}
