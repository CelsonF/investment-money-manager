export type AssetTypeId =
  | 'stock'
  | 'reit'
  | 'fixed_income'
  | 'etf'
  | 'crypto'
  | 'fund'
  | 'other'

export interface Asset {
  id: string
  ticker: string
  type: AssetTypeId
  quantity: number | null
  averagePrice: number
  createdAt: string
}

export type Tab = 'portfolio' | 'analytics'

export interface ChartDatum {
  id: string
  label: string
  color: string
  value: number
}
