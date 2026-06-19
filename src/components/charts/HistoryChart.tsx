import { useQuery } from '@tanstack/react-query'
import { getPortfolioHistory } from '../../server/portfolio'
import { useLocaleStore } from '../../store/localeStore'

interface Point { month: string; totalValue: number }

const W = 600
const H = 180
const PAD = { top: 16, right: 16, bottom: 32, left: 8 }

function buildPath(points: Point[]): string {
  if (points.length < 2) return ''
  const values = points.map((p) => p.totalValue)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const x = (i: number) => PAD.left + (i / (points.length - 1)) * iW
  const y = (v: number) => PAD.top + iH - ((v - min) / range) * iH

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.totalValue)}`).join(' ')
}

function buildArea(points: Point[]): string {
  if (points.length < 2) return ''
  const line = buildPath(points)
  const iW = W - PAD.left - PAD.right
  const bottom = PAD.top + H - PAD.top - PAD.bottom

  return `${line} L${PAD.left + iW},${bottom} L${PAD.left},${bottom} Z`
}

function shortMonth(month: string): string {
  const [, m] = month.split('-')
  const date = new Date(2000, parseInt(m, 10) - 1)
  return date.toLocaleString('default', { month: 'short' })
}

export default function HistoryChart() {
  const { money } = useLocaleStore()
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['portfolio-history'],
    queryFn: () => getPortfolioHistory(),
    staleTime: Infinity,
  })

  if (isLoading) {
    return (
      <div className="h-[180px] animate-pulse rounded-xl bg-white/[0.04]" />
    )
  }
  if (history.length < 2) return null

  const line = buildPath(history)
  const area = buildArea(history)
  const values = history.map((p) => p.totalValue)
  const max = Math.max(...values)
  const last = history[history.length - 1]
  const prev = history[history.length - 2]
  const delta = last.totalValue - prev.totalValue
  const deltaSign = delta >= 0 ? '+' : ''
  const deltaPct = ((delta / prev.totalValue) * 100).toFixed(1)

  // Label positions — show first, middle, last
  const labelIdxs = [0, Math.floor(history.length / 2), history.length - 1]
  const iW = W - PAD.left - PAD.right
  const labelX = (i: number) => PAD.left + (i / (history.length - 1)) * iW

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-1)] p-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">
            Evolução do patrimônio
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--c-text)]">
            {money(last.totalValue)}
          </p>
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums ${
            delta >= 0
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {deltaSign}{deltaPct}% último mês
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: H }}
      >
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={area} fill="url(#histGrad)" />

        {/* Line */}
        <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" />

        {/* Last point dot */}
        {(() => {
          const iH = H - PAD.top - PAD.bottom
          const range = (max - Math.min(...values)) || 1
          const lx = PAD.left + iW
          const ly = PAD.top + iH - ((last.totalValue - Math.min(...values)) / range) * iH
          return (
            <>
              <circle cx={lx} cy={ly} r={5} fill="#8b5cf6" />
              <circle cx={lx} cy={ly} r={3} fill="white" />
            </>
          )
        })()}

        {/* Month labels */}
        {labelIdxs.map((i) => (
          <text
            key={i}
            x={labelX(i)}
            y={H - 4}
            textAnchor={i === 0 ? 'start' : i === history.length - 1 ? 'end' : 'middle'}
            fontSize={10}
            fill="var(--c-text-subtle)"
          >
            {shortMonth(history[i].month)}
          </text>
        ))}
      </svg>
    </div>
  )
}
