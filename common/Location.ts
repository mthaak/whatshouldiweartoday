export default class Location {
  lat: int
  lon: int
  city: str
  countr: str

  constructor(lat: int, lon: int, city: str, country: str) {
    this.lat = lat
    this.lon = lon
    this.city = city
    this.country = country
  }

  static fromObject(obj: Record<string, unknown>): UserProfile {
    const location = Object.assign(new Location(), obj)
    return location
  }

  toString(): string {
    if (this.city) { return `${this.city}, ${this.country ? this.country : ''}` } else { return 'Unknown' }
  }
}
