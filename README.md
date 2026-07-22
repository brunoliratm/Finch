<p align="center">
  <img src="./docs/finch-readme.png" alt="Finch" width="100%" />
</p>

# Finch

Finch is an offline-first Android personal finance application. It helps users track monthly expenses, manage an investment portfolio, understand financial indicators, and project their balance for the next 12 months.

The application stores financial records only on the user's device. Calculations, projections, and recommendations are produced locally.

## Current scope

Finch is developed exclusively for Android. The interface is bundled inside the native application with Capacitor and does not depend on a hosted website or remote server.

## Features

- Local onboarding with salary, optional additional income, payday, and PIN.
- Dashboard with income, expenses, available balance, savings rate, and investment KPIs.
- Twelve-month balance projection calculated on the device.
- Rule-based and explainable financial recommendations.
- Fixed and extra monthly expense tracking.
- Manual investment portfolio management.
- Support for dividends, interest on equity, fund distributions, and other income types.
- Create, edit, mark as paid, and remove expenses.
- Create, edit, and remove portfolio assets.
- Portuguese and English interface options.
- Light and dark themes.
- Local JSON and CSV imports and exports.
- Native Android sharing for exported backups.
- Floating bottom navigation designed for mobile safe areas.
- Native handling for the Android back button, keyboard, status bar, splash screen, and application locking after leaving the app.

## Privacy and local storage

Finch does not require a financial account, bank connection, market-data provider, external API, or internet permission. Profile information, expenses, assets, and preferences are stored in IndexedDB inside the Android application.

The PIN is stored as a salted SHA-256 hash and works as a local access lock. It is not a replacement for full database encryption.

Removing the application or clearing its storage removes local records. Android cloud backup is disabled, so users should export backups regularly.

## Technology

- React 19
- TypeScript
- Vite
- Capacitor 8
- Lucide icons
- Urbanist, bundled locally
- IndexedDB
- Native Android filesystem and sharing plugins

## Local development

Requirements:

- Node.js 22.13 or newer
- npm
- JDK 21
- Android SDK Platform 36 and matching build tools

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Create the bundled application files:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Android build

Build the application files and synchronize the Android project:

```bash
npm run android:sync
```

Open the native project in Android Studio:

```bash
npm run android:open
```

Build the signed release APK for direct installation after configuring the Android SDK and local signing files:

```bash
npm run android:release
```

The generated APK is written to `android/app/build/outputs/apk/release/app-release.apk`.

Keep `android/app/finch-release.jks` and `android/keystore.properties` in a secure backup. Both files are excluded from Git and are required to sign future updates of the application.

## Main project files

```text
app/
  backup.ts       JSON/CSV import, export, and native sharing
  finance.ts      Financial calculations and recommendations
  globals.css     Mobile interface and themes
  main.tsx        Native web view entry point
  page.tsx        Mobile screens, forms, navigation, localization, and native events
  storage.ts      IndexedDB persistence
  types.ts        Shared application state types
android/           Capacitor Android project
assets/
  icon.png         1024×1024 source icon
  splash.png       2732×2732 source splash screen
docs/
  finch-readme.png
```

## Financial data notes

Stock prices, quantities, purchase prices, and income information are entered manually. Finch does not retrieve live quotations. Projections are estimates based on the information currently stored on the device and must not be treated as financial advice.

## Backup formats

JSON backups contain the complete Finch state, including the profile and PIN hash. Importing one replaces the complete local state and requires the imported PIN on the next unlock.

CSV backups contain expenses and portfolio assets. Importing one replaces those two collections while preserving the current profile, language, theme, and PIN.

## License

No license has been defined yet.
