<p align="center">
  <img src="./docs/finch-readme.png" alt="Finch" width="100%" />
</p>

# Finch

<p align="center">
  <a href="https://github.com/brunoliratm/Finch/releases/latest"><img src="https://img.shields.io/github/v/release/brunoliratm/Finch?style=for-the-badge&color=6f52ed" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/platform-Android-3ddc84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/offline-first-6f52ed?style=for-the-badge" alt="Offline first" />
  <img src="https://img.shields.io/badge/languages-PT%20%7C%20EN-1f6feb?style=for-the-badge" alt="Portuguese and English" />
</p>

Finch is an offline-first Android personal finance application. It helps users track monthly expenses, manage an investment portfolio, understand financial indicators, and project their balance for the next 12 months.

The application stores financial records only on the user's device. Calculations, projections, and recommendations are produced locally.

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

> [!WARNING]
> **Financial data notes**
>
> Stock prices, quantities, purchase prices, and income information are entered manually. Finch does not retrieve live quotations. Projections are estimates based on the information currently stored on the device and must not be treated as financial advice.

## Privacy and local storage

Finch does not require a financial account, bank connection, market-data provider, external API, or internet permission. Profile information, expenses, assets, and preferences are stored in IndexedDB inside the Android application.

The PIN is stored as a salted SHA-256 hash and works as a local access lock. It is not a replacement for full database encryption.

Removing the application or clearing its storage removes local records. Android cloud backup is disabled, so users should export backups regularly.

> [!IMPORTANT]
> **Backup formats**
>
> **JSON:** Contains the complete Finch state, including the profile and PIN hash. Importing one replaces the complete local state and requires the imported PIN on the next unlock.
>
> **CSV:** Contains expenses and portfolio assets. Importing one replaces those two collections while preserving the current profile, language, theme, and PIN.

## Technology

<p>
  <img src="https://skill-icons-v2.vercel.app/api/icons?i=react,typescript,vite,capacitor,androidstudio&theme=dark" alt="React, TypeScript, Vite, Capacitor, and Android Studio" />
</p>

## Get Finch

Download the latest signed Android APK from the [GitHub Releases page](https://github.com/brunoliratm/Finch/releases/latest). For local development or Android builds, install the project dependencies and use the available npm scripts:

```bash
npm install
npm run dev
npm run android:release
```

## License

No license has been defined yet.
