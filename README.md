<p align="center">
  <img src="./docs/finch-readme.png" alt="Finch" width="100%" />
</p>

# Finch

Finch is a mobile-first personal finance application designed to work without external financial integrations. It helps users track monthly expenses, manage an investment portfolio, understand financial indicators, and project their balance for the next 12 months.

The application stores financial records only on the user's device. Calculations, projections, and recommendations are produced locally.

## Current scope

Finch is now developed exclusively for mobile interfaces. The current web build is a mobile preview used for development and testing before native packaging.

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
- Local JSON and CSV exports.
- Floating bottom navigation designed for mobile safe areas.
- Offline reopening after the first web load.

## Privacy and local storage

Finch does not require a financial account, bank connection, market-data provider, or external API. Profile information, expenses, assets, and preferences are stored in IndexedDB in the current browser.

The PIN is stored as a salted SHA-256 hash and works as a local access lock. It is not a replacement for full database encryption.

Removing the application or clearing browser storage can remove local records. Users should export backups regularly.

## Technology

- React 19
- TypeScript
- vinext and Vite
- Lucide icons
- Urbanist, bundled locally
- IndexedDB
- Service Worker and Web App Manifest
- Cloudflare-compatible Sites build

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Main project files

```text
app/
  finance.ts      Financial calculations and recommendations
  globals.css     Mobile interface and themes
  layout.tsx      Application metadata and social preview
  page.tsx        Mobile screens, forms, navigation, and localization
  storage.ts      IndexedDB persistence
public/
  manifest.webmanifest
  sw.js           Offline application cache
docs/
  finch-readme.png
```

## Financial data notes

Stock prices, quantities, purchase prices, and income information are entered manually. Finch does not retrieve live quotations. Projections are estimates based on the information currently stored on the device and must not be treated as financial advice.

## Planned mobile packaging

The mobile web interface is intended to be packaged for Android and iOS with Capacitor. The local data layer should be reviewed for native storage and encryption before production distribution.

## License

No license has been defined yet.
