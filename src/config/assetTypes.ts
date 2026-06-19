import type { AssetTypeId } from '../types'

export interface AssetType {
  id: AssetTypeId
  label: string
  abbr: string
  color: string
}

export const ASSET_TYPES: Array<AssetType> = [
  { id: 'stock',        label: 'Ações',       abbr: 'AÇ',  color: '#4f8cff' },
  { id: 'reit',         label: 'FIIs',         abbr: 'FII', color: '#2dd4bf' },
  { id: 'fixed_income', label: 'Renda Fixa',   abbr: 'RF',  color: '#f59e0b' },
  { id: 'etf',          label: 'ETFs',         abbr: 'ETF', color: '#a78bfa' },
  { id: 'crypto',       label: 'Cripto',       abbr: 'C',   color: '#fb923c' },
  { id: 'fund',         label: 'Fundos',       abbr: 'FD',  color: '#f472b6' },
  { id: 'bdr',          label: 'BDRs',         abbr: 'BDR', color: '#38bdf8' },
  { id: 'other',        label: 'Outros',       abbr: 'OUT', color: '#94a3b8' },
]

export const assetTypeInfo = (id: AssetTypeId): AssetType =>
  ASSET_TYPES.find((t) => t.id === id) ?? ASSET_TYPES[ASSET_TYPES.length - 1]

export interface AssetTypeGroupItem {
  value: string
  id: AssetTypeId
  label: string
}

export interface AssetTypeGroup {
  label: string
  items: Array<AssetTypeGroupItem>
}

export const ASSET_TYPE_GROUPS: Array<AssetTypeGroup> = [
  {
    label: '🇧🇷 Investimentos Brasil',
    items: [
      { value: 'br_stock', id: 'stock', label: 'Ações' },
      { value: 'br_reit', id: 'reit', label: 'FIIs' },
      { value: 'br_fixed_income', id: 'fixed_income', label: 'Renda Fixa' },
      { value: 'br_etf', id: 'etf', label: 'ETFs' },
      { value: 'br_fund', id: 'fund', label: 'Fundos de Investimento' },
      { value: 'br_bdr', id: 'bdr', label: 'BDRs' },
      { value: 'br_crypto', id: 'crypto', label: 'Cripto' },
    ],
  },
  {
    label: '🇺🇸 Investimentos EUA',
    items: [
      { value: 'us_stock', id: 'stock', label: 'Stocks' },
      { value: 'us_etf', id: 'etf', label: 'ETFs' },
      { value: 'us_reit', id: 'reit', label: 'REITs' },
      { value: 'us_fixed_income', id: 'fixed_income', label: 'Bonds' },
      { value: 'us_crypto', id: 'crypto', label: 'Crypto' },
      { value: 'us_other', id: 'other', label: 'Outros' },
    ],
  },
]

export function assetTypeFromValue(value: string): AssetTypeId {
  for (const group of ASSET_TYPE_GROUPS) {
    const item = group.items.find((i) => i.value === value)
    if (item) return item.id
  }
  return 'other'
}
