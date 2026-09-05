import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.finch.app",
  appName: "Finch",
  webDir: "dist",
  backgroundColor: "#3421d8",
  android: {
    backgroundColor: "#3421d8",
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
    },
    SplashScreen: {
      launchShowDuration: 350,
      launchAutoHide: true,
      launchFadeOutDuration: 150,
      backgroundColor: "#3421d8",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#e2ebe5",
    },
  },
};

export default config;
