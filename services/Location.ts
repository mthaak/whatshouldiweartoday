export default class Location {
  lat: int;
  lon: int;
  city: str;
  countr: str;

  constructor(lat: int, lon: int, city: str, country: str) {
    this.lat = lat;
    this.lon = lon;
    this.city = city;
    this.country = country;
  }

  toString() {
    // return this.hour.toString().padStart(2, '0') + ':'+ this.minute.toString().padStart(2, '0')
  }

}
