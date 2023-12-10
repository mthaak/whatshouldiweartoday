module.exports = {
  expo: {
    name: "What Should I Wear Today?",
    slug: "whatshouldiweartoday",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon_man_winter_jumper.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#457b9d",
    },
    assetBundlePatterns: ["**/*"],
    android: {
      package: "com.mthaak.whatshouldiweartoday",
      versionCode: 1,
    },
    ios: {
      bundleIdentifier: "com.mthaak.whatshouldiweartoday",
      buildNumber: "1.0.0",
      supportsTablet: false,
    },
    web: {
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-updates",
        {
          username: "mthaak",
        },
      ],
    ],
    updates: {
      url: "https://u.expo.dev/d6bc1442-7252-4039-97c5-a359e22e2fe7",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      buildDate:
        new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      eas: {
        projectId: "d6bc1442-7252-4039-97c5-a359e22e2fe7",
      },
    },
  },
};
