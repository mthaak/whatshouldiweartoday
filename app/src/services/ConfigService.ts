interface Config {
  OPENWEATHERMAP_APPID: string;
  GOOGLE_GEOCODING_API_KEY: string;
}

class ConfigService {
  private static instance: ConfigService;
  private config: Config;

  private constructor() {
    // These variables are not public but we are the only user of this app. It wouldn't be safer
    // to publish the app.
    this.config = {
      OPENWEATHERMAP_APPID: process.env.EXPO_PUBLIC_OPENWEATHERMAP_APPID ?? "",
      GOOGLE_GEOCODING_API_KEY:
        process.env.EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY ?? "",
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getOpenWeatherMapAppId(): string {
    return this.config.OPENWEATHERMAP_APPID;
  }

  // For testing purposes
  public setOpenWeatherMapAppId(appId: string): void {
    this.config.OPENWEATHERMAP_APPID = appId;
  }

  public getGoogleGeocodingApiKey(): string {
    return this.config.GOOGLE_GEOCODING_API_KEY;
  }

  public setGoogleGeocodingApiKey(apiKey: string): void {
    this.config.GOOGLE_GEOCODING_API_KEY = apiKey;
  }
}

// Export a singleton instance
const configService = ConfigService.getInstance();
export default configService;
