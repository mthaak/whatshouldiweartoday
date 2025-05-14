// Workaround for https://github.com/expo/expo/issues/36588
import { getDefaultConfig } from "expo/metro-config";

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Allow .cjs files
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

// Work around stricter package.json "exports" behavior in Metro
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
