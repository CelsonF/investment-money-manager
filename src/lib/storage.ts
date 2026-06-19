import type { Asset, AssetTypeId } from '../types'
import { ASSET_TYPES } from '../constants/assetTypes'

const TYPE_IDS = new Set<string>(ASSET_TYPES.map((t) => t.id))
const asAssetType = (v: unknown): AssetTypeId =>
  typeof v === 'string' && TYPE_IDS.has(v) ? (v as AssetTypeId) : 'other'

export function exportJSON(assets: Array<Asset>): void {
  const data = {
    generatedAt: new Date().toISOString(),
    total: assets.length,
    assets,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'investments.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(file: File): Promise<Array<Asset>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result ?? ''))
        const list: Array<Record<string, unknown>> = Array.isArray(data)
          ? data
          : data.assets
        if (!Array.isArray(list)) throw new Error('Invalid format')
        resolve(
          list.map((a) => ({
            id: typeof a.id === 'string' ? a.id : crypto.randomUUID(),
            ticker: String(a.ticker ?? '').toUpperCase(),
            type: asAssetType(a.type),
            quantity:
              a.quantity === null || a.quantity === undefined
                ? null
                : Number(a.quantity),
            averagePrice: Number(a.averagePrice) || 0,
            createdAt:
              typeof a.createdAt === 'string'
                ? a.createdAt
                : new Date().toISOString(),
          })),
        )
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Could not read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read the file'))
    reader.readAsText(file)
  })
}
