import { Gender, TemperatureUnit } from "./enums";
import { Time } from "./Time";

export default interface UserProfile {
    name: string | null;
    gender: Gender;
    home: {
      lat: number;
      lon: number;
    } | null;
    commute: {
      days: boolean[];
      leaveTime: Time;
      returnTime: Time;
    };
    alert: {
      days: boolean[];
      enabled: boolean;
      time: Time;
    };
    tempUnit: TemperatureUnit;
  };