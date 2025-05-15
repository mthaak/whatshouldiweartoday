// Workaround for https://github.com/expo/expo/issues/36588

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Allow .cjs files
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

// Work around stricter package.json "exports" behavior in Metro
config.resolver.unstable_enablePackageExports = false;

// Add the shared folder to the watchFolders
config.watchFolders = [path.resolve(__dirname, "../shared")];

// Add the shared folder to extraNodeModules for path resolution
config.resolver.extraNodeModules = {
  '@shared': path.resolve(__dirname, "../shared/src"),
};

module.exports = config;
