import { ASSET_TYPES } from '../constants/assetTypes'
import { positionValue } from '../types/asset'
import type { Asset, ChartDatum, Currency } from '../types'

type Converter = (amount: number, currency: Currency) => number
const identity: Converter = (amount) => amount

/** Number of assets per type. */
export const allocationByCount = (assets: Array<Asset>): Array<ChartDatum> =>
  ASSET_TYPES.map((t) => ({
    id: t.id,
    label: t.label,
    color: t.color,
    value: assets.filter((a) => a.type === t.id).length,
  })).filter((d) => d.value > 0)

/** Invested value per type, converted to the display currency via `convert`. */
export const allocationByValue = (
  assets: Array<Asset>,
  convert: Converter = identity,
): Array<ChartDatum> =>
  ASSET_TYPES.map((t) => ({
    id: t.id,
    label: t.label,
    color: t.color,
    value: assets
      .filter((a) => a.type === t.id)
      .reduce((s, a) => s + convert(positionValue(a), a.currency ?? 'BRL'), 0),
  })).filter((d) => d.value > 0)
