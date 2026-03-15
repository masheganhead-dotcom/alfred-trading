import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alfredquest.app',
  appName: 'Alfred Quest',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#0a0a0f',
    scheme: 'Alfred Quest'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      showSpinner: false,
      launchFadeOutDuration: 300
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0a0a0f'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#ffd740'
    }
  }
};

export default config;
