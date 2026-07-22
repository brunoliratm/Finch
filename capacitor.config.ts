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
      launchShowDuration: 1000,
      launchAutoHide: true,
      launchFadeOutDuration: 350,
      backgroundColor: "#3421d8",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#eeedf4",
    },
  },
};

export default config;
