import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.finch.app",
  appName: "Finch",
  webDir: "dist",
  backgroundColor: "#e2ebe5",
  android: {
    backgroundColor: "#e2ebe5",
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
    },
    SplashScreen: {
      launchShowDuration: 350,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: "#e2ebe5",
      androidScaleType: "CENTER_INSIDE",
      androidSplashResourceName: "finch_launch",
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#e2ebe5",
    },
  },
};

export default config;
