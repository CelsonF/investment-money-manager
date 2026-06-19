import DistributionTable from './DistributionTable'
import DonutChart from './DonutChart'
import type { ChartDatum } from '../../types'

interface ChartBlockProps {
  title: string
  data: Array<ChartDatum>
  totalRef: number
  format: (v: number) => string
  centerLabel?: string
}

export default function ChartBlock({
  title,
  data,
  totalRef,
  format,
  centerLabel,
}: ChartBlockProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 className="mb-4 text-[15px] font-semibold text-white">{title}</h2>
      <DonutChart
        data={data}
        totalRef={totalRef}
        format={format}
        centerLabel={centerLabel}
      />
      <DistributionTable data={data} totalRef={totalRef} format={format} />
    </div>
  )
}
