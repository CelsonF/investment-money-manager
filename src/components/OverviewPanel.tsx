import { Sparkles } from 'lucide-react'
import { money, pct } from '../lib/format'
import type { ChartDatum } from '../types'
import DonutChart from './charts/DonutChart'

interface OverviewPanelProps {
  data: Array<ChartDatum>
  totalRef: number
  byValue: boolean
  topLabel: string
  topShare: number
}

export default function OverviewPanel({
  data,
  totalRef,
  byValue,
  topLabel,
  topShare,
}: OverviewPanelProps) {
  const format = byValue ? money : (v: number) => `${v}`

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white">Allocation</h2>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-stone-400">
          {byValue ? 'By value' : 'By count'}
        </span>
      </div>

      <DonutChart
        data={data}
        totalRef={totalRef}
        format={format}
        centerLabel={byValue ? 'Total' : 'Assets'}
      />

      <div className="mt-5 space-y-2.5">
        {data.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-stone-300">{d.label}</span>
            <span className="ml-auto text-stone-500 tabular-nums">
              {format(d.value)}
            </span>
            <span className="min-w-10 text-right font-semibold text-white tabular-nums">
              {pct(d.value, totalRef)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-violet-300">
          <Sparkles size={15} /> Insight
        </div>
        <p className="text-sm text-stone-400">
          Your largest allocation is <span className="text-white">{topLabel}</span> at{' '}
          <span className="text-white">{topShare}%</span> of the portfolio.
        </p>
      </div>
    </div>
  )
}
