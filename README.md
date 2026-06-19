# WealthMind — Investment Portfolio Manager

A modern, dark-themed portfolio dashboard template for tracking investments
across **Stocks, REITs, Fixed Income, ETFs, Crypto, Funds, BDRs** and more.

Features: allocation donut charts, P&L per asset, transaction history, dividend
tracking, portfolio evolution chart, dark/light theme, CSV/JSON export, real-time
price quotes, and PWA support.

Built with **TanStack Start + React 19 + TypeScript + Tailwind CSS v4 + Zustand**.  
Data is persisted to local JSON files on the server — no external database required.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build           # production build
npm run preview         # preview the build
npm run generate-routes # regenerate routeTree.gen.ts after adding/removing routes
npm run test            # vitest
npm run lint            # eslint
npm run format          # prettier + eslint --fix
```

> **Always run `npm run generate-routes`** after creating or deleting files in
> `src/routes/`. TanStack Router's `routeTree.gen.ts` is auto-generated and must
> stay in sync.

---

## Pages

| Route | Description | Role required |
|---|---|---|
| `/` | Dashboard — allocation charts, metrics, history, portfolio list | viewer+ |
| `/allocation` | Allocation targets tree + aporte simulator | manager+ |
| `/transactions` | Transaction history (buy / sell) | manager+ |
| `/proventos` | Dividends & income log | manager+ |
| `/settings` | Profile edit, language, exchange rate | manager+ |

---

## Data persistence

The app has two layers:

| Layer | Location | Purpose |
|---|---|---|
| **Seed** | `src/db/db.json` | Initial profile, assets, and portfolio history shipped with the repo |
| **Runtime** | `src/db/data/` (gitignored) | Mutable files written by server functions on each save |

Runtime files:

| File | Server function |
|---|---|
| `src/db/data/portfolio.json` | `saveAssets` |
| `src/db/data/profile.json` | `updateProfile` |
| `src/db/data/transactions.json` | `saveTransactions` |
| `src/db/data/dividends.json` | `saveDividends` |

Server functions always try the runtime file first, then fall back to the seed.

---

## Architecture

### Framework stack

- **TanStack Start** — SSR meta-framework (Vite + React 19)
- **TanStack Router** — file-based routing; routes live in `src/routes/`
- **TanStack Query** — exchange rate caching in `ExchangeRateSync`
- **Zustand** — global state management replacing React context
- **Tailwind CSS v4** — utility-first styles with CSS custom properties for theming
- No external UI component library; all components are hand-built

### State management (Zustand stores)

All global state lives in `src/store/`:

| Store | Purpose | Persisted |
|---|---|---|
| `assetStore` | Asset list + CRUD; server-synced | `data/portfolio.json` |
| `profileStore` | Active profile; optimistic save + rollback | `data/profile.json` |
| `transactionStore` | Transaction history (buy/sell) | `data/transactions.json` |
| `dividendStore` | Dividend / income log | `data/dividends.json` |
| `priceStore` | Real-time price quotes from brapi.dev | In-memory only |
| `localeStore` | Language, exchange rate, `money()`, `formatDate()` | `localStorage` (locale + rate) |
| `uiStore` | Mobile nav, search query, dark/light theme | `localStorage` (theme) |
| `toastStore` | Toast notifications queue | In-memory only |

Stores that call server functions use a module-level `_fetched` flag to prevent
duplicate requests across component re-renders.

### Theming

CSS custom properties are defined in `src/styles.css`:

```css
:root { /* dark defaults */ }
[data-theme="light"] { /* light overrides */ }
```

Toggle with the Moon/Sun button in the Topbar (`useUIStore.toggleTheme`).

### Server functions

All I/O lives in `src/server/portfolio.ts` using `createServerFn`. Node built-ins
(`node:fs/promises`) are imported dynamically inside handlers to keep them out of
browser bundles.

| Function | Method | Description |
|---|---|---|
| `getAssets` | GET | Read portfolio from runtime file, fallback to seed |
| `saveAssets` | POST | Write portfolio to runtime file |
| `getProfile` | GET | Read profile from runtime file, fallback to seed |
| `updateProfile` | POST | Write profile to runtime file |
| `getTransactions` | GET | Read transaction log |
| `saveTransactions` | POST | Write transaction log |
| `getDividends` | GET | Read dividend log |
| `saveDividends` | POST | Write dividend log |
| `getPortfolioHistory` | GET | Read portfolio history from seed |
| `fetchExchangeRate` | GET | Live USD→BRL rate from awesomeapi.com.br |
| `fetchQuotes` | GET | Live price quotes from brapi.dev |

### Price quotes (5.1)

`fetchQuotes` calls `https://brapi.dev/api/quote/{tickers}` (free, no API key).
Prices are stored in `priceStore` (in-memory, not persisted). Use the
**"Atualizar cotações"** button in the Meus Ativos section to refresh.  
P&L % is shown alongside each asset once quotes are loaded.

---

## Project structure

```
src/
├── routes/
│   ├── __root.tsx              # HTML shell, QueryClientProvider, ExchangeRateSync, Toaster
│   ├── index.tsx               # dashboard (allocation charts, metrics, history, portfolio)
│   ├── allocation.tsx          # allocation targets tree + aporte simulator
│   ├── transactions.tsx        # buy/sell transaction history
│   ├── proventos.tsx           # dividends & income log
│   └── settings.tsx            # profile + language + exchange rate
├── server/
│   ├── portfolio.ts            # all server functions (Zod-validated)
│   └── allocationTree.ts       # allocation tree server functions
├── store/
│   ├── assetStore.ts           # assets CRUD
│   ├── profileStore.ts         # profile load/save
│   ├── transactionStore.ts     # transaction history
│   ├── dividendStore.ts        # dividend/income log
│   ├── priceStore.ts           # real-time quotes (in-memory)
│   ├── localeStore.ts          # i18n, money(), formatDate(), exchange rate
│   ├── uiStore.ts              # mobile nav, search, theme
│   └── toastStore.ts           # toast queue + toast.success/error/info helpers
├── db/
│   ├── db.json                 # seed data (profile, assets, portfolioHistory, allocationTree)
│   └── data/                   # runtime files (gitignored)
├── types/
│   ├── asset.ts                # Asset, AssetTypeId, Currency, positionValue()
│   ├── profile.ts              # Profile, UserRole
│   ├── transaction.ts          # Transaction, TransactionKind
│   ├── dividend.ts             # Dividend, DividendKind
│   ├── chart.ts                # ChartDatum
│   ├── navigation.ts           # NavItemConfig (href: LinkProps['to'])
│   └── index.ts                # barrel re-export
├── config/
│   ├── assetTypes.ts           # ASSET_TYPES array + assetTypeInfo() + assetTypeFromValue()
│   └── navigation.ts           # MAIN_NAV, BOTTOM_NAV, filterNavByRole()
├── i18n/
│   └── translations.ts         # ptBR + enUS translation maps; TranslationKey type
├── lib/
│   ├── cn.ts                   # clsx + tailwind-merge
│   ├── format.ts               # pct()
│   ├── allocation.ts           # allocationByCount() / allocationByValue()
│   ├── rebalancing.ts          # rebalancing simulation helpers
│   ├── allocationValidation.ts # validation helpers for allocation tree edits
│   └── storage.ts              # exportJSON() / exportCSV() / importJSON()
├── hooks/
│   ├── usePortfolioMetrics.ts  # derived metrics from asset list (pure computation)
│   ├── usePortfolioData.ts     # combined portfolio data hook
│   └── useScrollNav.ts         # scroll-based nav state for the sidebar
└── components/
    ├── layout/
    │   ├── Sidebar.tsx         # desktop + mobile drawer (mobileNavOpen from uiStore)
    │   └── Topbar.tsx          # welcome, search, theme, export dropdown, new asset
    ├── portfolio/
    │   ├── AssetFormModal.tsx  # add-asset modal; emits { asset, transaction }
    │   └── PortfolioList.tsx   # assets grouped by type, sort, search, expand animation, P&L
    ├── allocation/
    │   ├── AllocationTable.tsx # nested allocation tree table
    │   └── AportSimulator.tsx  # "how much to invest" simulator
    ├── profile/
    │   ├── ProfileAvatar.tsx   # avatar image or initials fallback
    │   └── ProfileCard.tsx     # display card with role badge
    ├── ui/
    │   ├── CircularProgress.tsx  # reusable SVG progress ring
    │   ├── MetricCard.tsx        # summary card with progress ring
    │   ├── EmptyState.tsx        # empty portfolio prompt
    │   └── Toaster.tsx           # fixed bottom-right toast container
    └── charts/
        ├── ChartsView.tsx        # renders the two distribution blocks
        ├── ChartBlock.tsx        # title + donut + table
        ├── DonutChart.tsx        # pure-SVG donut chart (no library)
        ├── DistributionTable.tsx # values and percentages table
        └── HistoryChart.tsx      # pure-SVG portfolio evolution line chart
```

---

## Role system

Each profile has a `role`: `admin`, `manager`, or `viewer`. The sidebar reads
this at runtime and calls `filterNavByRole()` to show or hide menu items. Add or
restrict items in [`src/config/navigation.ts`](src/config/navigation.ts).

---

## Customizing

- **Investment types and colors:** edit [`src/config/assetTypes.ts`](src/config/assetTypes.ts).
- **Currency / locale:** change `locale` in [`src/store/localeStore.ts`](src/store/localeStore.ts)
  or let users switch it in Settings. The `money()` and `formatDate()` helpers
  adapt automatically.
- **Seed data:** edit [`src/db/db.json`](src/db/db.json) to change the default
  profile, pre-populate assets, or adjust the allocation tree.
- **Navigation items:** add entries to `MAIN_NAV` or `BOTTOM_NAV` in
  [`src/config/navigation.ts`](src/config/navigation.ts); set `allowedRoles` to
  control visibility per role.
- **Adding a real backend:** replace the file I/O in
  [`src/server/portfolio.ts`](src/server/portfolio.ts) with your database calls.
  The Zod schemas and server function signatures stay the same.

---

## Technical notes

- **No chart library** — `DonutChart`, `CircularProgress`, and `HistoryChart` are
  pure SVG. This keeps SSR working without hydration mismatches.
- **Idempotent fetches** — each store uses a module-level `_fetched` flag so
  `getAssets()` / `getProfile()` etc. are called at most once per browser session,
  regardless of how many components call `load()`.
- **Optimistic updates** — `assetStore.add/remove`, `transactionStore`, and
  `dividendStore` apply changes to the UI immediately and revert on server error.
- **PWA** — configured with `vite-plugin-pwa`. The service worker caches static
  assets and applies a NetworkFirst strategy for brapi.dev and awesomeapi.com.br.
- **Expand animation** — `PortfolioList` group expansion uses the CSS
  `grid-template-rows: 0fr → 1fr` trick with `transition-[grid-template-rows]`,
  requiring no JS animation library.
