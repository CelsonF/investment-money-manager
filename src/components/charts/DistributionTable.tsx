import { pct } from '../../lib/format'
import type { ChartDatum } from '../../types'

interface DistributionTableProps {
  data: Array<ChartDatum>
  totalRef: number
  format: (v: number) => string
}

export default function DistributionTable({
  data,
  totalRef,
  format,
}: DistributionTableProps) {
  return (
    <div className="mt-4 border-t border-white/[0.06] pt-1">
      {data.map((d) => (
        <div
          key={d.id}
          className="flex items-center gap-3 border-b border-white/[0.04] py-2 last:border-0"
        >
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: d.color }}
          />
          <span className="text-sm text-stone-300">{d.label}</span>
          <span className="ml-auto text-[13px] text-stone-500 tabular-nums">
            {format(d.value)}
          </span>
          <span className="min-w-11 text-right text-sm font-semibold text-white tabular-nums">
            {pct(d.value, totalRef)}%
          </span>
        </div>
      ))}
    </div>
  )
}
