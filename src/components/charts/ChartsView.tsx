import { money } from '../../lib/format'
import { allocationByCount, allocationByValue } from '../../lib/allocation'
import type { Asset } from '../../types'
import ChartBlock from './ChartBlock'

interface ChartsViewProps {
  assets: Array<Asset>
  total: number
  hasQuantity: boolean
}

export default function ChartsView({
  assets,
  total,
  hasQuantity,
}: ChartsViewProps) {
  const byCount = allocationByCount(assets)
  const byValue = allocationByValue(assets)

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ChartBlock
        title="Distribution by number of assets"
        data={byCount}
        totalRef={assets.length}
        centerLabel="Assets"
        format={(v) => `${v}`}
      />
      {hasQuantity && byValue.length > 0 && (
        <ChartBlock
          title="Distribution by invested value"
          data={byValue}
          totalRef={total}
          centerLabel="Total"
          format={money}
        />
      )}
    </div>
  )
}
