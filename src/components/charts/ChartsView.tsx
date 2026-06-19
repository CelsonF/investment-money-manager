import { money } from '../../lib/format'
import type { ChartDatum } from '../../types'
import ChartBlock from './ChartBlock'

interface ChartsViewProps {
  byCount: Array<ChartDatum>
  byValue: Array<ChartDatum>
  total: number
  hasQuantity: boolean
}

export default function ChartsView({
  byCount,
  byValue,
  total,
  hasQuantity,
}: ChartsViewProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ChartBlock
        title="Distribution by number of assets"
        data={byCount}
        totalRef={byCount.reduce((s, d) => s + d.value, 0)}
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
