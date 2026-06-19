import { useState } from 'react'
import { ArrowDownLeft, Calculator, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useLocaleStore } from '../../store/localeStore'
import { useAportSimulation } from '../../hooks/usePortfolioData'

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'

function parseDecimal(v: string): number {
  return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0
}

export default function AportSimulator() {
  const { money } = useLocaleStore()
  const [inputValue, setInputValue] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const aportValue = parseDecimal(inputValue)
  const { result, treeValid } = useAportSimulation(confirmed ? aportValue : 0)

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <Calculator size={16} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Simulador de Aporte</h2>
          <p className="text-xs text-stone-500">
            Descobre quanto investir em cada ativo para otimizar a alocação
          </p>
        </div>
      </div>

      {!treeValid && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          A árvore tem pesos inconsistentes. Corrija antes de simular.
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <input
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setConfirmed(false) }}
            placeholder="Valor do aporte (ex: 1000)"
            inputMode="decimal"
            className={inputCls}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && aportValue > 0 && treeValid) setConfirmed(true)
            }}
          />
        </div>
        <button
          disabled={aportValue <= 0 || !treeValid}
          onClick={() => setConfirmed(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDownLeft size={15} />
          Simular
        </button>
      </div>

      {result && (
        <div className="mt-5">
          {/* Summary row */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.03] px-4 py-3 text-center ring-1 ring-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Aporte</p>
              <p className="mt-1 text-base font-bold tabular-nums text-white">
                {money(result.aport_total)}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] px-4 py-3 text-center ring-1 ring-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Alocado</p>
              <p className="mt-1 text-base font-bold tabular-nums text-emerald-400">
                {money(result.total_allocated)}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] px-4 py-3 text-center ring-1 ring-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Restante</p>
              <p
                className={cn(
                  'mt-1 text-base font-bold tabular-nums',
                  result.unallocated > 0.01 ? 'text-amber-400' : 'text-stone-400',
                )}
              >
                {money(result.unallocated)}
              </p>
            </div>
          </div>

          {/* Allocation list */}
          <div className="flex flex-col gap-1.5">
            {result.allocations.map((alloc) => {
              const pct = (alloc.amount / result.aport_total) * 100
              return (
                <div
                  key={alloc.node_id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
                >
                  {/* Path breadcrumb */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-[10px] text-stone-600">
                      {alloc.path.map((segment, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {segment}
                          {i < alloc.path.length - 1 && (
                            <ChevronRight size={9} className="shrink-0" />
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {alloc.node_name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-500">
                      <span>
                        {alloc.current_pct_global.toFixed(1)}% →{' '}
                        <span className="text-emerald-400">
                          {alloc.new_pct_global.toFixed(1)}%
                        </span>
                      </span>
                      <span>·</span>
                      <span>meta: {alloc.target_pct_global.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Amount + bar */}
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-emerald-400">
                      {money(alloc.amount)}
                    </p>
                    <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-500/60"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-600">
                      {pct.toFixed(1)}% do aporte
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {result.allocations.length === 0 && (
            <p className="mt-3 text-center text-sm text-stone-500">
              Todos os ativos estão na meta ou acima. Nenhum aporte necessário.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
