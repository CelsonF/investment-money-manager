import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, Loader2, Save, Target } from 'lucide-react'
import { cn } from '../lib/cn'
import Sidebar from '../components/layout/Sidebar'
import AllocationTable from '../components/allocation/AllocationTable'
import AportSimulator from '../components/allocation/AportSimulator'
import {
  usePortfolioData,
  useUpdateTargets,
  useOptimisticNodeEdit,
} from '../hooks/usePortfolioData'
import { validateSiblingWeights } from '../lib/allocationValidation'
import { totalPortfolioValue } from '../lib/rebalancing'
import { useLocaleStore } from '../store/localeStore'
import type { AllocationTree } from '../types/allocation-tree'

export const Route = createFileRoute('/allocation')({ component: AllocationPage })

// ─── Edit-target modal ─────────────────────────────────────────────────────────

interface EditTargetModalProps {
  nodeId: string
  current: number
  onSave: (nodeId: string, value: number) => void
  onClose: () => void
}

function EditTargetModal({ nodeId, current, onSave, onClose }: EditTargetModalProps) {
  const [value, setValue] = useState(String(current))

  const parsed = parseFloat(value.replace(',', '.'))
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 100

  const handleSave = () => {
    if (isValid) {
      onSave(nodeId, Math.round(parsed * 100) / 100)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-80 rounded-2xl border border-[var(--c-border-2)] bg-[var(--c-modal)] p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-white">Editar meta local</h3>
        <p className="mb-4 text-xs text-stone-500">
          A soma dos irmãos deve ser 100%. Verifique depois de salvar.
        </p>
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          autoFocus
          className="mb-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-sm text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AllocationPage() {
  const { money } = useLocaleStore()
  const { data: tree, isLoading } = usePortfolioData()
  const updateTargets = useUpdateTargets()
  const optimisticEdit = useOptimisticNodeEdit()

  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editTarget, setEditTarget] = useState<{ nodeId: string; current: number } | null>(null)

  const validationErrors = tree ? validateSiblingWeights(tree.root) : []
  const isValid = validationErrors.length === 0
  const portfolioValue = tree ? totalPortfolioValue(tree.root) : 0

  const handleEditTarget = (nodeId: string, current: number) => {
    setEditTarget({ nodeId, current })
  }

  const handleApplyEdit = (nodeId: string, value: number) => {
    optimisticEdit(nodeId, value)
    setDirty(true)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!tree) return
    try {
      await updateTargets.mutateAsync(tree as AllocationTree)
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.')
    }
  }

  return (
    <div className="relative flex min-h-screen bg-[var(--c-bg)] text-[var(--c-text-2)]">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-96 w-[40rem] rounded-full bg-violet-600/15 blur-[140px]" />

      <Sidebar />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                <Target size={18} />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Alocação Global
                </h1>
                <p className="text-sm text-stone-500">
                  Defina metas e simule aportes para rebalancear
                </p>
              </div>
            </div>
          </div>

          {/* Save button */}
          {dirty && (
            <button
              onClick={handleSave}
              disabled={!isValid || updateTargets.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
                isValid
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-600/20'
                  : 'bg-red-500/30',
              )}
            >
              {updateTargets.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : saved ? (
                <Check size={15} />
              ) : (
                <Save size={15} />
              )}
              {saved ? 'Salvo!' : 'Salvar alterações'}
            </button>
          )}
        </div>

        {/* Stats bar */}
        {tree && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
              <span className="text-xs text-stone-500">Valor total da carteira</span>
              <p className="text-sm font-bold tabular-nums text-white">{money(portfolioValue)}</p>
            </div>
            {isValid ? (
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                <Check size={12} />
                Pesos consistentes
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                <AlertTriangle size={12} />
                {validationErrors.length} nível(eis) com pesos incorretos
              </div>
            )}
          </div>
        )}

        {/* Validation errors detail */}
        {validationErrors.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              Inconsistências
            </p>
            <ul className="flex flex-col gap-1.5">
              {validationErrors.map((e, i) => (
                <li key={i} className="text-xs text-amber-300/80">
                  <span className="font-medium text-amber-300">
                    {e.path.join(' › ')}:
                  </span>{' '}
                  soma atual = {e.actual_sum}% (esperado 100%)
                  <span className="ml-1 text-amber-400/60">
                    [{e.node_names.join(', ')}]
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-stone-500">
            <Loader2 size={22} className="animate-spin" />
          </div>
        )}

        {tree && (
          <div className="flex flex-col gap-6">
            <AllocationTable root={tree.root} onEditTarget={handleEditTarget} />
            <AportSimulator />
          </div>
        )}
      </main>

      {/* Edit target dialog */}
      {editTarget && (
        <EditTargetModal
          nodeId={editTarget.nodeId}
          current={editTarget.current}
          onSave={handleApplyEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
