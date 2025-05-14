# What should I wear today?

Do you also wonder every morning whether you can wear a skirt or shorts? Or whether you perhaps need to wear a thick jacket because it will be chilly? Or do you want to know about potential rainfall, so you know whether to bring an umbrella?

Well, wonder no more! This app tells you what you can best wear with regards to today's weather. Every morning it sends you a push notification with a summary of the weather and the clothes that go with it. It also takes into account your daily commute, so you will never be surprised by a heavy rain while on the go.

<p align="center">
  <img alt="Screenschot weather screen" src="screenshots/screenshot_weather.jpg" width="30%">
&nbsp; &nbsp; &nbsp; &nbsp;
  <img alt="Screenshot settings screen" src="screenshots/screenshot_settings.jpg" width="30%">
&nbsp; &nbsp; &nbsp; &nbsp;
  <img alt="Screenshot commute settings screen" src="screenshots/screenshot_commute_settings.jpg" width="30%">
</p>

This app is currently only built for Android. And not released to the Play Store (though it might at some point). Since this is just meant as a hobby project, it doesn't have the quality that I deem sufficient to publicly release it.

The weather forecast comes from [OpenWeather](https://openweathermap.org/api).

## Development

This is a React Native app, developed using [Expo](https://expo.io/).

Make sure that NodeJS 18 is installed before starting.

### How to set up app

- Clone the repo
- Create a `.env` file in the app directory with the following variables:

```
OPENWEATHERMAP_APPID=<...>
GOOGLE_GEOCODING_API_KEY=<...>
```

- Create a new service account, download its credentials and store at ./credentials.json
- Get a google services file and store at ./google-services.json
- Start Expo in the app directory: `npm start`
- Open the app (follow the Expo instructions). Either:
  - On your phone with the Expo Go client
  - In your web browser
- Start developing and see the changes reflected automatically in the app

Also have a look at the [amazing documentation](https://docs.expo.io/get-started/installation/) that Expo provides.

### How to build app

In the `./app` directory:

If you want to build a new version of the Android app, run:
`eas build --profile preview --platform android`

To perform over-the-air (OTA) updates of the built app, run:
`eas update --channel development`

If you want a development build, run:
`eas build --profile development --platform android`

### Style

In the `./app` directory:
- Use `npm run lint` to check the style of the code.
- Use `npm run format` to format the code.
- Use `npm run typescript` to type-check the code.
