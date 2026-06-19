# Spec: State Management (Zustand)

## Overview

All global state is managed with **Zustand** stores located in `src/store/`.
React Context and custom hooks (`useAssets`, `useProfile`) were removed in favour
of this pattern to reduce boilerplate and allow state access outside React trees.

---

## Store catalogue

### `assetStore.ts`
- Holds the portfolio asset list.
- Calls `getAssets()` server fn on first `load()` (idempotent via `_fetched` flag).
- `add`, `remove`, `replace` apply optimistic updates then call `saveAssets()`.
- On server error, state is reverted and a toast is shown.

### `profileStore.ts`
- Holds the active `Profile`.
- `save(updates)` applies an optimistic update and rolls back on failure.
- Computes `initials` from the updated name automatically.

### `transactionStore.ts`
- Holds the full transaction log (`Transaction[]`), newest-first.
- `add(txn)` / `remove(id)` call `saveTransactions` with the full updated list.

### `dividendStore.ts`
- Holds the dividend / income log (`Dividend[]`).
- Same pattern as `transactionStore`.

### `priceStore.ts`
- In-memory only (never persisted).
- `fetchPrices(tickers)` calls the `fetchQuotes` server fn (brapi.dev).
- Merges results into `quotes: Record<string, PriceQuote>`.

### `localeStore.ts`
- Persisted to `localStorage` (only `locale` and `exchangeRate` are serialized).
- Exposes `money(n)`, `formatDate(iso)`, `t(key, vars)`, `convertToDisplay(amount, from)`.
- `onRehydrateStorage` syncs `displayCurrency` after hydration.

### `uiStore.ts`
- Persisted to `localStorage` (only `theme`).
- `toggleTheme()` sets `document.documentElement.setAttribute('data-theme', next)`.

### `toastStore.ts`
- In-memory only.
- `add(message, type)` auto-removes the toast after 3.5 s.
- `toast` singleton (`toast.success`, `toast.error`, `toast.info`) allows calling
  toasts from outside React components (e.g., inside store actions).

---

## Idempotent fetch pattern

Each server-backed store (`assetStore`, `profileStore`, `transactionStore`,
`dividendStore`) guards against duplicate server calls with a module-level flag:

```ts
let _fetched = false

load: async () => {
  if (_fetched) return
  _fetched = true
  // ...fetch...
  // On error: _fetched = false  (allow retry)
}
```

This means calling `load()` from multiple components or `useEffect`s in the
same session only ever triggers one network request.

---

## Loading stores in the root

`src/routes/__root.tsx` renders a `RootLayout` component that calls
`profileStore.load()` and `assetStore.load()` in a single `useEffect`. The
transaction and dividend stores are loaded lazily inside their respective route
components.
