package com.finch.app;

import android.app.KeyguardManager;
import android.content.Context;
import android.os.Build;
import android.view.View;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DeviceSecurity")
public class DeviceSecurityPlugin extends Plugin {
    private PluginCall pending;
    private BiometricPrompt prompt;
    private boolean foreground;
    private boolean authenticated;

    private KeyguardManager keyguard() {
        return (KeyguardManager) getContext().getSystemService(Context.KEYGUARD_SERVICE);
    }

    @Override
    public void load() {
        // AndroidX owns prompt/credential lifecycle and distinguishes its own credential activity from leaving the app.
        prompt = new BiometricPrompt(getActivity(), ContextCompat.getMainExecutor(getContext()),
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                    if (pending == null) return;
                    authenticated = true;
                    PluginCall call = pending;
                    pending = null;
                    call.resolve();
                }

                @Override
                public void onAuthenticationError(int errorCode, CharSequence message) {
                    if (pending == null) return;
                    PluginCall call = pending;
                    pending = null;
                    call.reject(message.toString(), "AUTHENTICATION_FAILED");
                }
            });
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            JSObject result = new JSObject();
            result.put("secure", keyguard().isDeviceSecure());
            result.put("authenticated", authenticated);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void invalidateSession(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            authenticated = false;
            if (pending != null) {
                PluginCall previous = pending;
                pending = null;
                prompt.cancelAuthentication();
                previous.reject("Session invalidated", "INACTIVE");
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void showContent(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (foreground) getBridge().getWebView().setVisibility(View.VISIBLE);
            call.resolve();
        });
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (pending != null) { call.reject("Authentication already active", "BUSY"); return; }
            if (!foreground) { call.reject("Application is not active", "INACTIVE"); return; }
            if (!keyguard().isDeviceSecure()) { call.reject("No device credential", "NO_CREDENTIAL"); return; }
            if (authenticated) { call.resolve(); return; }
            pending = call;
            // Strong biometric + credential requires Android 11. AndroidX supports the weak+credential combination on older versions.
            int biometrics = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                ? BiometricManager.Authenticators.BIOMETRIC_STRONG : BiometricManager.Authenticators.BIOMETRIC_WEAK;
            try {
                prompt.authenticate(new BiometricPrompt.PromptInfo.Builder()
                    .setTitle(call.getString("title", "Unlock Finch"))
                    .setSubtitle(call.getString("subtitle", "Confirm your identity"))
                    .setAllowedAuthenticators(biometrics | BiometricManager.Authenticators.DEVICE_CREDENTIAL)
                    .build());
            } catch (Exception error) {
                pending = null;
                call.reject("Unable to open device authentication", "UNAVAILABLE", error);
            }
        });
    }

    @Override
    protected void handleOnResume() { foreground = true; }

    @Override
    protected void handleOnPause() {
        foreground = false;
        authenticated = false;
        getBridge().getWebView().setVisibility(View.INVISIBLE);
    }

    @Override
    protected void handleOnDestroy() {
        if (pending != null) pending.reject("Activity destroyed", "INACTIVE");
        pending = null;
        authenticated = false;
        if (prompt != null) prompt.cancelAuthentication();
    }
}
