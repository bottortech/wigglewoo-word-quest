import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bottortech.wigglewoo',
  appName: "WiggleWoo's Word Quest",
  webDir: 'dist',
  ios: {
    allowsLinkPreview: false,
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
