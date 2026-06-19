export type AssetTypeId =
  | 'stock'
  | 'reit'
  | 'fixed_income'
  | 'etf'
  | 'crypto'
  | 'fund'
  | 'bdr'
  | 'other'

export type Currency = 'BRL' | 'USD'

export interface Asset {
  id: string
  ticker: string
  type: AssetTypeId
  currency: Currency
  quantity: number | null
  averagePrice: number
  createdAt: string
}

/** Cost basis in the asset's own currency */
export function positionValue(a: Asset): number {
  return a.quantity != null ? a.averagePrice * a.quantity : a.averagePrice
}
