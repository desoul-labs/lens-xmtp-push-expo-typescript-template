import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'app',
  slug: 'app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'app',
  jsEngine: 'hermes',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.example.app',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.example.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
});
