const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    getTransformOptions: async () => ({
      transform: { experimentalImportSupport: false, inlineRequires: true },
    }),
  },
  resolver: {
    extraNodeModules: {
      stream: require.resolve('stream-browserify'),
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer/'),
       process: require.resolve('process/browser'),
        assert: require.resolve('assert'),
        util: require.resolve('util'),
        path: require.resolve('path-browserify'),
    },
    assetExts,
    sourceExts,
  },
});
