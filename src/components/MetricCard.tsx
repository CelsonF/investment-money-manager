import type { ReactNode } from 'react'
import CircularProgress from './CircularProgress'

interface MetricCardProps {
  label: string
  value: ReactNode
  percent: number
  color: string
  delta: string
  deltaPositive?: boolean
  footer?: string
}

export default function MetricCard({
  label,
  value,
  percent,
  color,
  delta,
  deltaPositive = true,
  footer = 'Last month',
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs text-stone-400">{label}</div>
          <div className="mt-1 truncate text-2xl font-semibold tracking-tight text-white">
            {value}
          </div>
        </div>
        <CircularProgress percent={percent} color={color} size={52} stroke={5}>
          <span className="text-[11px] font-semibold text-white">
            {Math.round(percent)}%
          </span>
        </CircularProgress>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span
          className={deltaPositive ? 'text-emerald-400' : 'text-rose-400'}
        >
          {delta}
        </span>
        <span className="text-stone-500">{footer}</span>
      </div>
    </div>
  )
}
