import { allocationByCount, allocationByValue } from '../lib/allocation'
import { pct } from '../lib/format'
import { ASSET_TYPES } from '../config/assetTypes'
import type { Asset, ChartDatum } from '../types'

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

export function usePortfolioMetrics(assets: Array<Asset>): PortfolioMetrics {
  const count = assets.length
  const total = assets.reduce((s, a) => s + a.averagePrice * (a.quantity ?? 0), 0)
  const hasQuantity = assets.some((a) => a.quantity != null && a.quantity > 0)
  const withValue = assets.filter((a) => a.quantity != null && a.quantity > 0).length
  const valuedShare = count ? Math.round((withValue / count) * 100) : 0

  const numTypes = ASSET_TYPES.filter((t) => assets.some((a) => a.type === t.id)).length
  const totalTypes = ASSET_TYPES.length
  const diversification = Math.round((numTypes / totalTypes) * 100)

  const byCount = allocationByCount(assets)
  const byValue = allocationByValue(assets)

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
