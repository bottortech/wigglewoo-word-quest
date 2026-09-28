import type { CapacitorConfig } from '@capacitor/cli';

// The event build (two-tablet Word-Tac-Toe demo) talks plain ws:// to the
// presenter laptop from the https://localhost WebView, which Chromium blocks
// as mixed content unless allowed here. Only opted in when syncing for the
// event build (`npm run event:install` sets WW_EVENT_MODE) so the standard
// and kiosk builds are unchanged.
const eventBuild = process.env.WW_EVENT_MODE === 'true';

const config: CapacitorConfig = {
  appId: 'com.bottortech.wigglewoo',
  appName: "WiggleWoo's Word Quest",
  webDir: 'dist',
  ios: {
    allowsLinkPreview: false,
  },
  ...(eventBuild ? { android: { allowMixedContent: true } } : {}),
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
