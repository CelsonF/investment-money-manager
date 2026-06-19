# WealthMind — Investment portfolio manager

A modern, dark-themed dashboard template to register and track an investment
portfolio by type (**Stocks, REITs, Fixed income, ETFs, Crypto, Funds and
others**), with average price, quantity, allocation donut charts and JSON
export/import.

Built with **TanStack Start + React 19 + TypeScript + Tailwind CSS v4**.
Data is stored locally in the browser (`localStorage`) — no backend — so anyone
can clone it and use it for their own portfolio.

## Running the project

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run preview    # preview the build
npm run lint       # eslint
npm run format     # prettier + eslint --fix
```

## Structure

```
src/
├── routes/
│   ├── __root.tsx                  # HTML shell, <head>, devtools
│   └── index.tsx                   # dashboard layout: state, tabs and modal
├── types.ts                        # Asset / AssetTypeId / Tab / ChartDatum
├── constants/
│   └── assetTypes.ts               # investment types + colors (ASSET_TYPES)
├── lib/
│   ├── format.ts                   # money() and pct()
│   ├── allocation.ts               # allocationByCount() / allocationByValue()
│   └── storage.ts                  # exportJSON() / importJSON()
├── hooks/
│   └── useAssets.ts                # state + localStorage persistence
└── components/
    ├── Sidebar.tsx                 # branding, nav tabs, user card
    ├── Topbar.tsx                  # welcome, search, export/import/new actions
    ├── CircularProgress.tsx        # reusable SVG progress ring
    ├── MetricCard.tsx              # summary card with progress ring
    ├── EmptyState.tsx              # empty state
    ├── AssetCard.tsx               # single asset row
    ├── PortfolioList.tsx           # assets grouped by type
    ├── AssetFormModal.tsx          # add-asset modal
    ├── OverviewPanel.tsx           # right-side allocation donut + insight
    └── charts/
        ├── ChartsView.tsx          # builds the distribution blocks
        ├── ChartBlock.tsx          # title + donut + table
        ├── DonutChart.tsx          # pure-SVG donut chart (no dependencies)
        └── DistributionTable.tsx   # values and percentages table
```

## Customizing

- **Investment types and colors:** edit [`src/constants/assetTypes.ts`](src/constants/assetTypes.ts).
- **Currency / formatting:** adjust `money()` in [`src/lib/format.ts`](src/lib/format.ts)
  (currently `en-US` / `USD`).
- **Persistence:** [`src/hooks/useAssets.ts`](src/hooks/useAssets.ts) uses
  `localStorage`. To sync with a backend, swap the `localStorage` calls for your
  API while keeping the same interface (`add`, `remove`, `replace`).

## Notes

- The donut and progress rings are drawn with pure SVG — no chart libraries —
  so they play well with TanStack Start SSR.
- `localStorage` is read inside an effect (client only), keeping the component
  SSR-safe.
- The sidebar's **Settings** / **Help Center** items and the topbar **theme
  toggle** / **search** are visual placeholders ready for you to wire up.
