import type { AssetTypeId, Currency } from './asset'

export type TransactionKind = 'buy' | 'sell'

export interface Transaction {
  id: string
  ticker: string
  assetType: AssetTypeId
  currency: Currency
  kind: TransactionKind
  quantity: number
  price: number
  otherCosts: number
  total: number
  date: string       // YYYY-MM-DD
  createdAt: string
}
