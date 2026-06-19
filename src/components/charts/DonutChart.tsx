import { useState } from 'react'
import { pct } from '../../lib/format'
import type { ChartDatum } from '../../types'

interface DonutChartProps {
  data: Array<ChartDatum>
  totalRef: number
  format: (v: number) => string
  centerLabel?: string
}

const SIZE = 180
const STROKE = 24
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export default function DonutChart({
  data,
  totalRef,
  format,
  centerLabel = 'Total',
}: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null)

  const sum = data.reduce((s, d) => s + d.value, 0)
  let accumulated = 0

  const selected = active != null ? data[active] : null

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <div className="relative shrink-0">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#ffffff10"
            strokeWidth={STROKE}
          />
          {data.map((d, i) => {
            const fraction = sum ? d.value / sum : 0
            const dash = fraction * C
            const offset = -accumulated * C
            accumulated += fraction
            const highlighted = active === i
            return (
              <circle
                key={d.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth={highlighted ? STROKE + 4 : STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                className="cursor-pointer transition-all duration-200"
                style={{ opacity: active == null || highlighted ? 1 : 0.35 }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {selected ? (
            <>
              <span className="text-lg font-semibold text-white tabular-nums">
                {pct(selected.value, totalRef)}%
              </span>
              <span className="max-w-[7rem] truncate text-xs text-stone-400">
                {selected.label}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-semibold text-white tabular-nums">
                {format(totalRef)}
              </span>
              <span className="text-xs text-stone-400">{centerLabel}</span>
            </>
          )}
        </div>
      </div>

      <ul className="flex w-full flex-col gap-1.5">
        {data.map((d, i) => (
          <li
            key={d.id}
            className="flex cursor-default items-center gap-2 text-sm"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            style={{ opacity: active == null || active === i ? 1 : 0.5 }}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-stone-300">{d.label}</span>
            <span className="ml-auto font-medium text-stone-500 tabular-nums">
              {pct(d.value, totalRef)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
