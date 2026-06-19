import { ASSET_TYPES } from '../constants/assetTypes'
import type { Asset, ChartDatum } from '../types'

/** Number of assets per type. */
export const allocationByCount = (assets: Array<Asset>): Array<ChartDatum> =>
  ASSET_TYPES.map((t) => ({
    id: t.id,
    label: t.label,
    color: t.color,
    value: assets.filter((a) => a.type === t.id).length,
  })).filter((d) => d.value > 0)

/** Invested value (average price × quantity) per type. */
export const allocationByValue = (assets: Array<Asset>): Array<ChartDatum> =>
  ASSET_TYPES.map((t) => ({
    id: t.id,
    label: t.label,
    color: t.color,
    value: assets
      .filter((a) => a.type === t.id)
      .reduce((s, a) => s + a.averagePrice * (a.quantity ?? 0), 0),
  })).filter((d) => d.value > 0)
