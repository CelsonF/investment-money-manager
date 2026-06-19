import { Trash2 } from 'lucide-react'
import type { Asset } from '../../types'
import type { AssetType } from '../../config/assetTypes'
import { money } from '../../lib/format'

interface AssetCardProps {
  asset: Asset
  group: AssetType
  onRemove: (id: string) => void
}

export default function AssetCard({ asset, group, onRemove }: AssetCardProps) {
  const hasQuantity = asset.quantity != null && asset.quantity > 0

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
      <span
        className="rounded-md px-2 py-1 text-[11px] font-semibold"
        style={{ background: `${group.color}22`, color: group.color }}
      >
        {asset.ticker}
      </span>

      <div className="ml-auto text-right">
        <div className="mb-0.5 text-[11px] text-stone-500">Average price</div>
        <div className="text-[15px] font-semibold text-white tabular-nums">
          {money(asset.averagePrice)}
        </div>
        {hasQuantity ? (
          <div className="text-xs text-stone-500 tabular-nums">
            {asset.quantity} · {money(asset.averagePrice * asset.quantity!)}
          </div>
        ) : null}
      </div>

      <button
        onClick={() => onRemove(asset.id)}
        aria-label={`Remove ${asset.ticker}`}
        className="flex rounded-md p-1.5 text-stone-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400 group-hover:text-stone-400"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
