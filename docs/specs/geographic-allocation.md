# Spec: Geographic Allocation & Structured Portfolio Views

## Overview

Extend the portfolio model to support:
- Geographic classification of assets (BR / US / Global)
- Target allocation percentages per region
- Emergency reserve as a first-class concept
- Target weights per asset within its class
- FII sub-categorization (two-level hierarchy: category → FII)
- Computed "how much to invest" guidance per asset and per category

---

## 1. Core Type Changes

### 1.1 Region

```ts
// src/types/asset.ts

export type Region = 'BR' | 'US' | 'global'
```

- `BR` — Brazilian assets priced in BRL (stocks, FIIs, Tesouro, ETFs BR, etc.)
- `US` — US assets priced in USD (stocks, ETFs, REITs)
- `global` — Assets that span multiple markets or have no single home (crypto, global funds)

---

### 1.2 FII Category

```ts
// src/types/asset.ts

export type FiiCategoryId =
  | 'logistica'
  | 'cri_cra'
  | 'lajes_corporativas'
  | 'shoppings'
  | 'residencial'
  | 'hibrido'
  | 'fof'        // Fund of Funds
  | 'outros'
```

Only relevant when `Asset.type === 'reit'` and `Asset.region === 'BR'`.
US REITs do not use this field.

---

### 1.3 Updated Asset

```ts
// src/types/asset.ts (full updated interface)

export interface Asset {
  id: string
  ticker: string
  type: AssetTypeId
  region: Region                        // NEW — required
  quantity: number | null
  averagePrice: number
  createdAt: string

  // Allocation targets (optional — user fills these in)
  targetWeight?: number                 // NEW — % this asset should represent within its class (0–100)

  // FII-only fields
  fiiCategory?: FiiCategoryId           // NEW — only when type === 'reit' && region === 'BR'

  // Emergency reserve flag
  isEmergencyReserve?: boolean          // NEW — true removes asset from all allocation views
}
```

**Invariants:**
- `fiiCategory` must only be set when `type === 'reit'`
- `isEmergencyReserve === true` assets are excluded from geographic views and allocation math
- `targetWeight` values within the same `(region, type)` group should ideally sum to 100, but the UI shows a warning, not an error
- `averagePrice` is always in the asset's native currency (BRL for BR, USD for US, USD for global)

---

## 2. Portfolio Config (new top-level structure)

These are user-defined targets stored in the portfolio JSON alongside assets.

```ts
// src/types/portfolioConfig.ts  (new file)

export interface RegionTarget {
  region: Region
  targetPct: number    // 0–100, % of total portfolio (excluding emergency reserve)
}

export interface FiiCategoryTarget {
  categoryId: FiiCategoryId
  targetPct: number    // 0–100, % of total FII allocation for this region
}

export interface PortfolioConfig {
  regionTargets: RegionTarget[]           // e.g. [{ region: 'BR', targetPct: 60 }, ...]
  fiiCategoryTargets: FiiCategoryTarget[] // e.g. [{ categoryId: 'logistica', targetPct: 40 }, ...]
  currency: 'BRL' | 'USD'                 // display currency for cross-region totals
  fxRateBrlUsd?: number                   // optional manual FX rate (BRL per 1 USD)
}
```

**Validation rules:**
- `regionTargets[*].targetPct` should sum to 100 (UI warns if not)
- `fiiCategoryTargets[*].targetPct` should sum to 100 (UI warns if not)
- If `fxRateBrlUsd` is absent, cross-region totals are disabled and each view shows only its own currency

---

## 3. Updated Persistence Schema (`db.json` / `portfolio.json`)

```json
{
  "profile": { ... },

  "portfolioConfig": {
    "currency": "BRL",
    "fxRateBrlUsd": 5.40,
    "regionTargets": [
      { "region": "BR",     "targetPct": 60 },
      { "region": "US",     "targetPct": 30 },
      { "region": "global", "targetPct": 10 }
    ],
    "fiiCategoryTargets": [
      { "categoryId": "logistica",          "targetPct": 40 },
      { "categoryId": "cri_cra",            "targetPct": 30 },
      { "categoryId": "lajes_corporativas", "targetPct": 20 },
      { "categoryId": "shoppings",          "targetPct": 10 }
    ]
  },

  "assets": [
    {
      "id": "a1",
      "ticker": "PETR4",
      "type": "stock",
      "region": "BR",
      "quantity": 100,
      "averagePrice": 38.50,
      "targetWeight": 25,
      "createdAt": "2024-01-20T00:00:00.000Z"
    },
    {
      "id": "a4",
      "ticker": "HGLG11",
      "type": "reit",
      "region": "BR",
      "fiiCategory": "logistica",
      "quantity": 50,
      "averagePrice": 168.0,
      "targetWeight": 60,
      "createdAt": "2024-02-10T00:00:00.000Z"
    },
    {
      "id": "a_emergency",
      "ticker": "NUBANK-CDB",
      "type": "fixed_income",
      "region": "BR",
      "quantity": null,
      "averagePrice": 15000,
      "isEmergencyReserve": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],

  "portfolioHistory": [ ... ]
}
```

---

## 4. Derived / Computed Values

These are **never stored** — always computed at runtime from assets + config.

### 4.1 Region Summary

```ts
interface RegionSummary {
  region: Region
  totalValue: number          // sum of (qty × avgPrice) for all non-emergency assets in region
  currentPct: number          // totalValue / portfolioTotal * 100
  targetPct: number           // from portfolioConfig.regionTargets
  gapPct: number              // targetPct - currentPct (positive = underweight)
  gapValue: number            // how much BRL/USD to invest to close the gap
  byType: TypeSummary[]       // breakdown by AssetTypeId within this region
}
```

### 4.2 Type Summary (within a region)

```ts
interface TypeSummary {
  typeId: AssetTypeId
  label: string
  color: string
  totalValue: number
  currentPct: number          // of region total
  assets: AssetWithWeight[]
  // only for type === 'reit' && region === 'BR':
  fiiCategories?: FiiCategorySummary[]
}
```

### 4.3 FII Category Summary

```ts
interface FiiCategorySummary {
  categoryId: FiiCategoryId
  label: string
  totalValue: number
  currentPct: number          // of total FII value within this region
  targetPct: number           // from portfolioConfig.fiiCategoryTargets
  gapPct: number
  gapValue: number
  assets: AssetWithWeight[]
}
```

### 4.4 Asset with computed weight

```ts
interface AssetWithWeight {
  asset: Asset
  currentValue: number        // qty × averagePrice
  currentWeight: number       // % of its parent group (type or fii category)
  targetWeight: number        // asset.targetWeight ?? 0
  weightGap: number           // targetWeight - currentWeight
}
```

### 4.5 Emergency Reserve Summary

```ts
interface EmergencyReserveSummary {
  totalValue: number
  assets: Asset[]
  monthsCovered?: number      // optional: user sets monthly expense in profile
}
```

---

## 5. Entity Relations Diagram

```
PortfolioConfig
├── regionTargets[]          ──→  Region
│     └── targetPct
└── fiiCategoryTargets[]     ──→  FiiCategoryId
      └── targetPct

Asset
├── type: AssetTypeId
├── region: Region
├── fiiCategory?: FiiCategoryId   (only when type='reit' && region='BR')
├── targetWeight?: number
└── isEmergencyReserve?: boolean

─────────────────────────────────────────────────────
Computed tree (runtime only):

Portfolio
├── emergencyReserve           (assets where isEmergencyReserve=true)
└── regions[]                  (grouped by Asset.region)
      └── RegionSummary
            ├── currentPct / targetPct / gapValue
            └── byType[]
                  └── TypeSummary
                        ├── assets[] (with weights)
                        └── fiiCategories[]    (only for reit/BR)
                              └── FiiCategorySummary
                                    └── assets[] (with weights)
```

---

## 6. New Files to Create

| File | Purpose |
|---|---|
| `src/types/portfolioConfig.ts` | `PortfolioConfig`, `RegionTarget`, `FiiCategoryTarget` |
| `src/types/region.ts` | `Region`, `FiiCategoryId` |
| `src/types/computed.ts` | `RegionSummary`, `TypeSummary`, `FiiCategorySummary`, `AssetWithWeight`, `EmergencyReserveSummary` |
| `src/config/fiiCategories.ts` | `FII_CATEGORIES` array with id/label/color, analogous to `assetTypes.ts` |
| `src/config/regions.ts` | `REGIONS` array with id/label/flag emoji |
| `src/lib/regionAllocation.ts` | Pure functions that compute `RegionSummary[]` and `EmergencyReserveSummary` |
| `src/hooks/usePortfolioConfig.ts` | Load/save `PortfolioConfig` via server function |

---

## 7. Files to Modify

| File | Change |
|---|---|
| `src/types/asset.ts` | Add `region`, `targetWeight`, `fiiCategory`, `isEmergencyReserve` |
| `src/types/index.ts` | Re-export new types |
| `src/db/db.json` | Add `portfolioConfig`, add `region` to all seed assets |
| `src/server/portfolio.ts` | Add `loadConfig` / `saveConfig` server functions |
| `src/components/portfolio/AssetFormModal.tsx` | Add fields: region, fiiCategory, targetWeight, isEmergencyReserve |

---

## 8. Open Questions

1. **FX rate:** Should the user type the BRL/USD rate manually, or should it be fetched from an API? (Current app is local-first — manual input is the safe default.)
2. **US REITs:** Should they have their own category system parallel to Brazilian FIIs, or is that out of scope?
3. **Monthly expense for emergency coverage:** Should `Profile` gain a `monthlyExpense` field so the app can show "you have 6 months of reserve"?
4. **`targetWeight` scope:** Is the target weight relative to the asset's class within a region (e.g., % of BR stocks), or relative to the entire region total? The spec assumes the former — confirm before implementing.
