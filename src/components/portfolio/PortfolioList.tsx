import { ASSET_TYPES } from '../../config/assetTypes'
import type { Asset } from '../../types'
import AssetCard from './AssetCard'

interface PortfolioListProps {
  assets: Array<Asset>
  onRemove: (id: string) => void
}

export default function PortfolioList({ assets, onRemove }: PortfolioListProps) {
  const groups = ASSET_TYPES.map((t) => ({
    ...t,
    items: assets.filter((a) => a.type === t.id),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.id}>
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: g.color }}
            />
            <h2 className="m-0 text-[15px] font-semibold text-white">
              {g.label}
            </h2>
            <span className="text-xs text-stone-500">({g.items.length})</span>
          </div>
          <div className="flex flex-col gap-2">
            {g.items.map((a) => (
              <AssetCard key={a.id} asset={a} group={g} onRemove={onRemove} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
