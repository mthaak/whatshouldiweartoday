export default class Location {
  lat: number;
  lon: number;
  city: string | null;
  country: string | null;

  constructor(
    lat: number,
    lon: number,
    city: string | null,
    country: string | null,
  ) {
    this.lat = lat;
    this.lon = lon;
    this.city = city;
    this.country = country;
  }

  static fromObject(obj: Record<string, unknown>): Location {
    return Object.setPrototypeOf(obj, Location.prototype);
  }

  toString(): string {
    if (this.city) {
      return `${this.city}, ${this.country ? this.country : ""}`;
    } else {
      return "Unknown";
    }
  }
}
