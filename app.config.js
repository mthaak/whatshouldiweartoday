export default ({ config }) => {
  config.extra = {
    buildDate:
      new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
  };
  return config;
};
