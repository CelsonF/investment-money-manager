import type { AssetTypeId, Currency } from './asset'

export type DividendKind = 'dividendo' | 'jcp' | 'rendimento' | 'amortizacao' | 'outros'

export interface Dividend {
  id: string
  ticker: string
  assetType: AssetTypeId
  currency: Currency
  kind: DividendKind
  quantity: number
  amountPerUnit: number
  total: number
  paymentDate: string   // YYYY-MM-DD
  createdAt: string
}
