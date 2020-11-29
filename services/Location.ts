export default class Location {
  lat: int;
  lon: int;
  city: str;

  constructor(lat: int, lon: int, city: str) {
    this.lat = lat;
    this.lon = lon;
    this.city = city;
  }

  toString() {
    // return this.hour.toString().padStart(2, '0') + ':'+ this.minute.toString().padStart(2, '0')
  }

}
