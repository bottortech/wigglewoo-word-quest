import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bottortech.wigglewoo',
  appName: 'WiggleWoo Word Quest',
  webDir: 'dist',
  ios: {
    minVersion: '16.0',
  },
};

export default config;
