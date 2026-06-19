# WealthMind — Investment portfolio manager

A modern, dark-themed dashboard template to register and track an investment
portfolio by type (**Stocks, REITs, Fixed income, ETFs, Crypto, Funds and
others**), with average price, quantity, allocation donut charts, profile
management, and JSON export/import.

Built with **TanStack Start + React 19 + TypeScript + Tailwind CSS v4**.  
Data is persisted to local JSON files on the server — no external database
required. Clone it, run it, and it works out of the box.

## Running the project

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

## Data persistence

The app has two layers:

| Layer | Location | Purpose |
|---|---|---|
| **Seed** | `src/db/db.json` | Initial profile and assets shipped with the repo |
| **Runtime** | `data/portfolio.json`, `data/profile.json` | Mutable files written by server functions on each save |

Server functions always try the runtime file first, then fall back to the seed.
The `data/` directory is gitignored so runtime changes stay local.

## Structure

```
src/
├── routes/
│   ├── __root.tsx              # HTML shell, ProfileProvider, devtools
│   ├── index.tsx               # dashboard page
│   └── settings.tsx            # profile settings page
├── context/
│   └── ProfileContext.tsx      # ProfileProvider + useProfileCtx (single fetch)
├── server/
│   └── portfolio.ts            # server functions: getAssets, saveAssets,
│                               #   getProfile, updateProfile (Zod-validated)
├── db/
│   └── db.json                 # seed data (profile + assets)
├── types/                      # split type definitions
│   ├── asset.ts                # Asset, AssetTypeId
│   ├── profile.ts              # Profile, UserRole
│   ├── chart.ts                # ChartDatum
│   ├── navigation.ts           # NavItemConfig
│   └── index.ts                # barrel re-export
├── config/
│   ├── assetTypes.ts           # ASSET_TYPES array + assetTypeInfo()
│   └── navigation.ts           # MAIN_NAV, BOTTOM_NAV, filterNavByRole()
├── lib/
│   ├── cn.ts                   # clsx + tailwind-merge utility
│   ├── format.ts               # money() and pct()
│   ├── allocation.ts           # allocationByCount() / allocationByValue()
│   └── storage.ts              # exportJSON() / importJSON()
├── hooks/
│   ├── useAssets.ts            # load/save portfolio; exposes add, remove, replace
│   ├── useProfile.ts           # load/save profile with optimistic update + rollback
│   ├── usePortfolioMetrics.ts  # derived metrics from asset list (pure computation)
│   └── useScrollNav.ts         # scroll-based nav state for the sidebar
└── components/
    ├── layout/
    │   ├── Sidebar.tsx         # branding, role-filtered nav, user card
    │   └── Topbar.tsx          # welcome, export/import/new actions
    ├── portfolio/
    │   ├── AssetCard.tsx       # single asset row with remove action
    │   ├── AssetFormModal.tsx  # add-asset modal with validation
    │   └── PortfolioList.tsx   # assets grouped by type
    ├── profile/
    │   ├── ProfileAvatar.tsx   # avatar image or initials fallback
    │   └── ProfileCard.tsx     # display card with role badge
    ├── ui/
    │   ├── CircularProgress.tsx  # reusable SVG progress ring
    │   ├── MetricCard.tsx        # summary card with progress ring
    │   └── EmptyState.tsx        # empty portfolio prompt
    └── charts/
        ├── ChartsView.tsx        # renders the two distribution blocks
        ├── ChartBlock.tsx        # title + donut + table
        ├── DonutChart.tsx        # pure-SVG donut chart (no library)
        └── DistributionTable.tsx # values and percentages table
```

## Role system

Each profile has a `role`: `admin`, `manager`, or `viewer`. The sidebar reads
this at runtime and calls `filterNavByRole()` to show or hide menu items based
on their `allowedRoles` config. Add or restrict items in
[`src/config/navigation.ts`](src/config/navigation.ts).

## Customizing

- **Investment types and colors:** edit [`src/config/assetTypes.ts`](src/config/assetTypes.ts).
- **Currency / formatting:** change `'en-US'` and `'USD'` in [`src/lib/format.ts`](src/lib/format.ts).
- **Seed data:** edit [`src/db/db.json`](src/db/db.json) to change the default
  profile or pre-populate assets.
- **Navigation items:** add entries to `MAIN_NAV` or `BOTTOM_NAV` in
  [`src/config/navigation.ts`](src/config/navigation.ts); set `allowedRoles` to
  control visibility per role.
- **Adding a backend:** replace the file I/O in [`src/server/portfolio.ts`](src/server/portfolio.ts)
  with your database calls. The Zod schemas and server function signatures stay the same.

## Notes

- **No chart library** — `DonutChart` and `CircularProgress` are pure SVG, which
  keeps SSR working without hydration mismatches.
- **Single profile fetch** — `ProfileProvider` at the root means `getProfile()`
  is called once per page load, regardless of how many components consume it.
- **Optimistic updates with rollback** — `useProfile.save` applies changes to the
  UI immediately and reverts if the server call fails.
- The sidebar **Help Center** item and the topbar **search** are visual
  placeholders ready for you to wire up.
