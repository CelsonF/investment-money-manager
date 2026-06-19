# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Production build
npm run preview          # Preview the production build locally
npm run generate-routes  # Regenerate routeTree.gen.ts after adding/removing route files
npm run test             # Run tests with vitest
npm run lint             # ESLint
npm run format           # Prettier + ESLint auto-fix
npm run check            # Prettier format check (no write)
```

**Always run `npm run generate-routes` after creating or deleting files in `src/routes/`.** TanStack Router's `routeTree.gen.ts` is auto-generated and must stay in sync with the route files.

## Architecture

### Framework stack
- **TanStack Start** — SSR meta-framework (Vite + React 19)
- **TanStack Router** — file-based routing; routes live in `src/routes/`
- **Tailwind CSS v4** — utility-first styles, dark theme throughout (`bg-[#0a0a12]`)
- No external UI component library; all components are hand-built

### Data flow
This app has two data layers:

1. **Seed data** — `src/db/db.json` — static JSON containing the initial `profile`, `assets`, and `portfolioHistory`. The server reads from this file as a fallback when no runtime file exists.
2. **Runtime data** — `data/` directory (gitignored at runtime, but the folder may exist)
   - `data/portfolio.json` — mutable asset list written by `saveAssets`
   - `data/profile.json` — mutable profile written by `updateProfile`

Server functions (`src/server/portfolio.ts`) always try the runtime file first, then fall back to the seed.

### Server functions
All file I/O lives in `src/server/portfolio.ts` using `createServerFn` from `@tanstack/react-start`. These run only on the server and are tree-shaken from the client bundle. Node built-ins (`node:fs/promises`, `node:path`) are imported dynamically inside handlers to keep them out of browser code.

The calling convention is `fn({ data: value })` — the `inputValidator` receives `value` and the handler destructures `{ data }`.

### Component organization
```
src/components/
  ui/          # Reusable primitives: CircularProgress, MetricCard, EmptyState
  layout/      # Sidebar (dynamic, role-filtered), Topbar
  portfolio/   # AssetCard, AssetFormModal, PortfolioList, OverviewPanel
  profile/     # ProfileAvatar, ProfileCard
  charts/      # DonutChart, ChartBlock, ChartsView, DistributionTable
```
Root-level component files (e.g. `components/Sidebar.tsx`) are backward-compat re-exports pointing to the subdirectory versions.

### Types and config
- `src/types/` — split type definitions; `src/types.ts` is a barrel re-export
- `src/config/assetTypes.ts` — `ASSET_TYPES` array and `assetTypeInfo()` helper; `src/constants/assetTypes.ts` re-exports this
- `src/config/navigation.ts` — `MAIN_NAV`, `BOTTOM_NAV`, and `filterNavByRole()` — the sidebar menu is driven entirely by this config; add items here to extend the menu

### Routing
- `src/routes/__root.tsx` — shell document with `<head>` metadata and `<Scripts />`
- `src/routes/index.tsx` — dashboard (scroll-based single-page layout)
- `src/routes/settings.tsx` — profile settings page
- `src/routeTree.gen.ts` — auto-generated, do not edit manually

### Profile & role system
`useProfile` (hook) fetches the active `Profile` from the server. The profile contains a `role: UserRole` (`'admin' | 'manager' | 'viewer'`). The Sidebar passes this role to `filterNavByRole()` to show or hide menu items based on `allowedRoles` in the nav config.

### Key hooks
- `useAssets` — loads/saves the portfolio asset list; exposes `{ assets, loading, add, remove, replace }`
- `useProfile` — loads/saves profile; exposes `{ profile, loading, save }`

Both hooks follow the same pattern: load via a server function in a `useEffect`, persist optimistically via a `useCallback`.

### Charts and formatting
- **No chart library** — `DonutChart` and `CircularProgress` are pure SVG. Do not add a chart library; the SVG approach keeps SSR working without hydration issues.
- **Currency** — `money()` in `src/lib/format.ts` is hardcoded to `en-US` / `USD`. Change both `'en-US'` and `'USD'` there to localize the whole app.
- **Note:** `README.md` describes the original localStorage-only architecture and is outdated. The app now uses server functions and file-based persistence as described above.
