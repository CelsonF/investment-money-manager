import { allocationByCount, allocationByValue } from '../lib/allocation'
import { positionValue } from '../types/asset'
import { pct } from '../lib/format'
import { ASSET_TYPES } from '../config/assetTypes'
import type { Asset, ChartDatum, Currency } from '../types'

type Converter = (amount: number, currency: Currency) => number
const identity: Converter = (amount) => amount

export interface PortfolioMetrics {
  count: number
  total: number
  hasQuantity: boolean
  withValue: number
  valuedShare: number
  numTypes: number
  totalTypes: number
  diversification: number
  byCount: Array<ChartDatum>
  byValue: Array<ChartDatum>
  topShare: number
  topLabel: string
}

export function usePortfolioMetrics(
  assets: Array<Asset>,
  convert: Converter = identity,
): PortfolioMetrics {
  const count = assets.length

  // Total in display currency (USD assets converted if viewing in BRL, and vice versa)
  const total = assets.reduce(
    (s, a) => s + convert(positionValue(a), a.currency ?? 'BRL'),
    0,
  )

  const hasQuantity = assets.some((a) => a.quantity != null && a.quantity > 0)
  const withValue = assets.filter((a) => a.quantity != null && a.quantity > 0).length
  const valuedShare = count ? Math.round((withValue / count) * 100) : 0

  const numTypes = ASSET_TYPES.filter((t) => assets.some((a) => a.type === t.id)).length
  const totalTypes = ASSET_TYPES.length
  const diversification = Math.round((numTypes / totalTypes) * 100)

  const byCount = allocationByCount(assets)
  const byValue = allocationByValue(assets, convert)

  const useValueAlloc = hasQuantity && byValue.length > 0
  const allocation = useValueAlloc ? byValue : byCount
  const allocTotal = useValueAlloc ? total : count
  const top = allocation.reduce<ChartDatum | null>(
    (m, d) => (d.value > (m?.value ?? -1) ? d : m),
    null,
  )

  return {
    count,
    total,
    hasQuantity,
    withValue,
    valuedShare,
    numTypes,
    totalTypes,
    diversification,
    byCount,
    byValue,
    topShare: top ? pct(top.value, allocTotal) : 0,
    topLabel: top ? top.label : '—',
  }
}
