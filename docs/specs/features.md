# Spec: Feature Catalogue

A summary of every implemented feature, where to find it, and how it works.

---

## Dashboard (`/`)

### Allocation charts
Two donut charts (by value and by count) built with pure SVG (`DonutChart`).
Source: `src/components/charts/ChartsView.tsx`.

### Metric cards
Four summary cards: total invested, total assets, top allocation, diversification.
Driven by `usePortfolioMetrics` hook.

### Allocation health (4.3)
Compact section showing current vs target % for Brasil (target 80%) and
Internacional (target 20%). Derives actual split from asset `currency` field.
Component: `AllocationHealth` in `src/routes/index.tsx`.

### Portfolio evolution chart (3.4)
Pure-SVG line chart showing `portfolioHistory` from the seed (`db.json`).
Uses TanStack Query with `staleTime: Infinity`.
Source: `src/components/charts/HistoryChart.tsx`.

### Meus Ativos
Assets grouped by type, with:
- **Sort** by value / % / name (3.5)
- **Search** filter from `useUIStore.searchQuery` (3.2)
- **Expand animation** using CSS `grid-template-rows: 0fr → 1fr` (3.6)
- **P&L %** shown when `priceStore.quotes` has a quote for the ticker (4.1 / 5.1)
- **Delete confirmation dialog** before removing an asset (1.6)
- **"Atualizar cotações"** button that fetches live prices from brapi.dev (5.1)

---

## Transaction History (`/transactions`) — 4.2

Log of every buy and sell. Stored in `src/db/data/transactions.json`.

When a user adds an asset via the modal (`AssetFormModal`), the modal emits
`{ asset, transaction }` — both are saved simultaneously. Additional transactions
can be added manually from the `/transactions` page.

**Transaction fields:** ticker, assetType, currency, kind (buy|sell), quantity,
price, otherCosts, total, date, createdAt.

---

## Proventos & Dividendos (`/proventos`) — 4.5

Log of dividends, JCP, interest income, and amortizations.
Stored in `src/db/data/dividends.json`.

Shows:
- Year-to-date total (in display currency)
- All-time total
- Full log table sorted by payment date

**Dividend fields:** ticker, assetType, currency, kind, quantity, amountPerUnit,
total, paymentDate, createdAt.

Dividend kinds: `dividendo`, `jcp`, `rendimento`, `amortizacao`, `outros`.

---

## Allocation Targets (`/allocation`) — 4.3

Tree-structured allocation targets from `db.json.allocationTree`.
Allows editing local target % values with dirty-state save.
Includes an aporte simulator to show how to distribute a new investment.

---

## Settings (`/settings`)

- **Profile edit** — name, avatar (base64), read-only email + role
- **Language** — toggle between pt-BR and en-US; updates `localeStore`
- **Exchange rate** — manual input or auto-fetch from awesomeapi.com.br

---

## Export / Import — 4.4

**Export dropdown** in the Topbar:
- **Export JSON** — full portfolio with metadata
- **Export CSV** — spreadsheet-friendly: ticker, type, currency, qty, avg price,
  total value, created date

**Import JSON** — accepts the same JSON format (or a plain array of assets).

---

## Real-time prices — 5.1

`fetchQuotes` server function calls `https://brapi.dev/api/quote/{tickers}`.
- Free, no API key required
- Returns `regularMarketPrice` and `regularMarketChangePercent`
- Results stored in `priceStore.quotes` (in-memory, cleared on page refresh)
- P&L % is calculated as `(currentPrice - averagePrice) / averagePrice * 100`

---

## Toasts — 3.1

`useToastStore` with a `toast` shorthand for use outside React:

```ts
toast.success('Ativo adicionado')
toast.error('Erro ao salvar')
toast.info('3 cotações atualizadas')
```

Toasts auto-dismiss after 3.5 s. Rendered by `<Toaster />` in the root layout.

---

## Dark / Light theme — 3.3

CSS custom properties in `src/styles.css` under `:root` (dark) and
`[data-theme="light"]`. `useUIStore.toggleTheme` toggles the attribute on
`<html>`. Theme choice is persisted to `localStorage`.

---

## PWA — 5.5

Configured with `vite-plugin-pwa` in `vite.config.ts`.

- Service worker uses Workbox for static asset caching
- NetworkFirst strategy for brapi.dev (5-minute TTL) and awesomeapi.com.br (10-minute TTL)
- `public/manifest.json` configured with WealthMind name, icons, theme colour `#8b5cf6`
- Installs as a standalone app on Android / iOS / Desktop

---

## Mobile sidebar — 2.3

`Sidebar` renders two variants:
- **Desktop**: `<aside hidden lg:flex>` fixed to the left
- **Mobile**: full-screen drawer overlay controlled by `useUIStore.mobileNavOpen`

The hamburger button (`<Menu>`) is visible only on screens below `lg`.

---

## Roadmap (not yet implemented)

| Item | Description |
|---|---|
| 5.2 | Index comparison (IBOVESPA, S&P 500, CDI) |
| 5.3 | IRPF report (average cost, capital gains) |
| 5.4 | Multi-portfolio support |
