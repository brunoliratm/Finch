# Device authentication regression checks

Run `npm run dev` and open `/tests/security-harness.html` in the development browser. This harness mounts the real React application in StrictMode with a simulated Android bridge and an in-memory database. It never accesses user data or real device credentials and is not an entry point in the production build.

The fictitious profile has PIN `1234`. `qa` is exposed in the browser console for controlling the simulated native callbacks.

| Scenario | Actions | Expected |
| --- | --- | --- |
| Secure startup | Open the harness | Finch intro, no app PIN field, `qa.requests === 1` |
| Cancel credential screen | `qa.background(); qa.cancel()`; then `qa.resume()` | Locked intro with retry button; request count unchanged; no PIN fallback |
| Explicit retry | Click Unlock | Exactly one additional request |
| Success before resume | While a request is pending: `qa.background(); qa.succeed()`; then `qa.resume()` | App hidden before resume; dashboard after resume; no additional prompt |
| Leave authenticated app | `qa.background()`; then `qa.resume()` | Private subtree hidden/inert immediately; new authentication required |
| No device credential | Cancel, set `qa.secure = false`, resume and click retry | Existing Finch PIN screen |
| PIN fallback | Enter `1234` with `qa.secure === false` | Dashboard appears |
| Device security enabled while PIN visible | Set `qa.secure = true`, then submit correct app PIN | Device prompt replaces PIN; financial content remains hidden |
| Preserve profile/picker | Open Profile, background and resume | Profile remains mounted but hidden/inert until authenticated; selected import is queued until unlock |
| Manual lock | Authenticate, open Profile, select Lock | Native authenticated flag invalidated, new authentication required |

Startup, cancellation, retry, success-before-resume, same-turn pause/success, background relock, no-credential fallback and correct PIN were checked with this harness during implementation. The production build and Android compilation must also pass.

## Physical Android validation still required

Test on Android 7–10 and Android 11+ with device password only and with enrolled biometrics. Check successful authentication, cancellation without reopening, wrong biometrics/lockout, Home/recents return, notification shade, screen off/on, rotation, manual lock, JSON/CSV file-picker return, and native sharing return. Confirm the intro remains visible behind the real system prompt and private content is absent from screenshots/recents.

AndroidX uses strong biometrics or device credential on Android 11+, and the supported weak-biometric/device-credential combination on older Android versions. No error in the native flow is treated as absence of device security. An error leaves the app locked.

Existing full JSON backup semantics are unchanged: importing a full backup also imports its alternate Finch PIN. That PIN is used only when the device has no screen lock.
