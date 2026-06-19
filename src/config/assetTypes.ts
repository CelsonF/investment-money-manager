import type { AssetTypeId } from '../types'

export interface AssetType {
  id: AssetTypeId
  label: string
  color: string
}

export const ASSET_TYPES: Array<AssetType> = [
  { id: 'stock', label: 'Stock', color: '#4f8cff' },
  { id: 'reit', label: 'REIT', color: '#2dd4bf' },
  { id: 'fixed_income', label: 'Fixed Income', color: '#f59e0b' },
  { id: 'etf', label: 'ETF', color: '#a78bfa' },
  { id: 'crypto', label: 'Crypto', color: '#fb923c' },
  { id: 'fund', label: 'Fund', color: '#f472b6' },
  { id: 'other', label: 'Other', color: '#94a3b8' },
]

export const assetTypeInfo = (id: AssetTypeId): AssetType =>
  ASSET_TYPES.find((t) => t.id === id) ?? ASSET_TYPES[ASSET_TYPES.length - 1]
