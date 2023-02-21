// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

config.resolver = {
  extraNodeModules: {
    stream: require.resolve('readable-stream'),
    crypto: require.resolve('crypto-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
  },
};

module.exports = config;
