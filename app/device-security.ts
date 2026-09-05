import { Capacitor, registerPlugin } from "@capacitor/core";

const DeviceSecurity = registerPlugin<{
  getStatus(): Promise<{ secure: boolean; authenticated: boolean }>;
  authenticate(options: { title: string; subtitle: string }): Promise<void>;
  showContent(): Promise<void>;
  invalidateSession(): Promise<void>;
}>("DeviceSecurity");

export const isAndroid = Capacitor.getPlatform() === "android";
export const getDeviceSecurity = () => isAndroid ? DeviceSecurity.getStatus() : Promise.resolve({ secure: false, authenticated: false });
export const invalidateDeviceSession = () => isAndroid ? DeviceSecurity.invalidateSession() : Promise.resolve();
export const revealApp = () => isAndroid ? DeviceSecurity.showContent() : Promise.resolve();

// A remount or resume must join the existing OS prompt, never create competing prompts.
let authentication: Promise<void> | null = null;
export function authenticateDevice(title: string, subtitle: string) {
  if (!authentication) {
    authentication = DeviceSecurity.authenticate({ title, subtitle }).finally(() => { authentication = null; });
  }
  return authentication;
}
