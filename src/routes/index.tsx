import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import MetricCard from '../components/ui/MetricCard'
import EmptyState from '../components/ui/EmptyState'
import PortfolioList from '../components/portfolio/PortfolioList'
import AssetFormModal from '../components/portfolio/AssetFormModal'
import ChartsView from '../components/charts/ChartsView'
import HistoryChart from '../components/charts/HistoryChart'
import { useAssetStore } from '../store/assetStore'
import { useProfileStore } from '../store/profileStore'
import { useLocaleStore } from '../store/localeStore'
import { usePriceStore } from '../store/priceStore'
import { useTransactionStore } from '../store/transactionStore'
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics'
import { exportJSON, exportCSV, importJSON } from '../lib/storage'
import { positionValue } from '../types/asset'

export const Route = createFileRoute('/')({ component: Home })

// ─── Allocation health ──────────────────────────────────────────────────────
// Shows actual vs target for top-level regions (Brasil 80% / Internacional 20%)

import type { Asset } from '../types'

interface AllocationHealthProps {
  assets: Asset[]
  total: number
  convertToDisplay: (amount: number, from: 'BRL' | 'USD') => number
}

function AllocationHealth({ assets, total, convertToDisplay }: AllocationHealthProps) {
  if (total <= 0) return null

  const brlTotal = assets
    .filter((a) => a.currency === 'BRL')
    .reduce((s, a) => s + convertToDisplay(positionValue(a), 'BRL'), 0)
  const usdTotal = total - brlTotal

  const regions = [
    { label: 'Brasil', actual: Math.round((brlTotal / total) * 100), target: 80, color: '#22c55e' },
    { label: 'Internacional', actual: Math.round((usdTotal / total) * 100), target: 20, color: '#4f8cff' },
  ]

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Saúde da alocação</h2>
        <span className="text-xs text-stone-500">atual vs meta</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {regions.map((r) => {
          const diff = r.actual - r.target
          const isOk = Math.abs(diff) <= 5
          return (
            <div key={r.label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-200">{r.label}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-stone-400">Meta: {r.target}%</span>
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: isOk ? '#22c55e' : diff > 0 ? '#f59e0b' : '#f87171' }}
                  >
                    {r.actual}%
                    {diff !== 0 && <span className="ml-0.5 font-normal">({diff > 0 ? '+' : ''}{diff}%)</span>}
                  </span>
                </div>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="absolute top-0 left-0 h-full rounded-full opacity-30 transition-all duration-500"
                  style={{ width: `${r.target}%`, background: r.color }}
                />
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{ width: `${r.actual}%`, background: r.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Home() {
  const { assets, loading, add, remove, replace } = useAssetStore()
  const { profile } = useProfileStore()
  const { t, money, convertToDisplay } = useLocaleStore()
  const { quotes, loading: priceLoading, fetchPrices } = usePriceStore()
  const { add: addTransaction } = useTransactionStore()
  const [modalOpen, setModalOpen] = useState(false)
  const {
    count, total, hasQuantity, withValue, valuedShare,
    numTypes, totalTypes, diversification,
    byCount, byValue, topShare, topLabel,
  } = usePortfolioMetrics(assets, convertToDisplay)

  const handleImport = async (file: File) => {
    try {
      const list = await importJSON(file)
      replace(list)
    } catch {
      alert('Invalid JSON file.')
    }
  }

  const hasAssets = count > 0

  return (
    <div className="relative flex min-h-screen bg-[var(--c-bg)] text-[var(--c-text-2)]">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-96 w-[40rem] rounded-full bg-violet-600/15 blur-[140px]" />

      <Sidebar />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div id="top" />
        <Topbar
          userName={profile?.name?.split(' ')[0] ?? 'there'}
          onExportJSON={() => exportJSON(assets)}
          onExportCSV={() => exportCSV(assets)}
          onImport={handleImport}
          onNew={() => setModalOpen(true)}
        />

        {loading ? (
          <div className="mt-6 flex flex-col gap-6">
            {/* Charts skeleton */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center justify-center gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="h-36 w-36 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="flex flex-col gap-2">
                  {[80, 56, 48, 64].map((w, i) => (
                    <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: w }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="h-36 w-36 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="flex flex-col gap-2">
                  {[72, 48, 64, 40].map((w, i) => (
                    <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: w }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Metric cards skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="mb-3 h-3 w-24 animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="mb-2 h-7 w-32 animate-pulse rounded-lg bg-white/[0.06]" />
                  <div className="h-2 w-20 animate-pulse rounded-full bg-white/[0.06]" />
                </div>
              ))}
            </div>
            {/* Portfolio list skeleton */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-4 h-5 w-28 animate-pulse rounded-lg bg-white/[0.06]" />
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
                ))}
              </div>
            </div>
          </div>
        ) : !hasAssets ? (
          <div className="mt-6">
            <EmptyState onAdd={() => setModalOpen(true)} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {/* 1 — Allocation charts */}
            <section id="allocation">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {t('dashboard.allocation')}
                </h2>
                <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  <Sparkles size={13} />
                  {t('dashboard.largest')}{' '}
                  <span className="text-white">{topLabel}</span> ·{' '}
                  <span className="text-white">{topShare}%</span>
                </div>
              </div>
              <ChartsView
                byCount={byCount}
                byValue={byValue}
                total={total}
                hasQuantity={hasQuantity}
              />
            </section>

            {/* 2 — Summary metrics */}
            <section
              id="metrics"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <MetricCard
                label={t('metric.totalInvested')}
                value={money(total)}
                percent={valuedShare}
                color="#8b5cf6"
                delta={t('metric.ofValued', { withValue, count })}
                footer={t('metric.positions')}
              />
              <MetricCard
                label={t('metric.totalAssets')}
                value={count}
                percent={diversification}
                color="#2dd4bf"
                delta={t('metric.categoriesOf', { numTypes, totalTypes })}
                footer={t('metric.diversification')}
              />
              <MetricCard
                label={t('metric.topAllocation')}
                value={`${topShare}%`}
                percent={topShare}
                color="#4f8cff"
                delta={topLabel}
                footer={t('metric.largestCategory')}
              />
              <MetricCard
                label={t('metric.diversification')}
                value={`${numTypes}/${totalTypes}`}
                percent={diversification}
                color="#f59e0b"
                delta={t('metric.spread', { pct: diversification })}
                footer={t('metric.categoriesUsed')}
              />
            </section>

            {/* 3 — Allocation health vs target */}
            <AllocationHealth assets={assets} total={total} convertToDisplay={convertToDisplay} />

            {/* 4 — Portfolio history */}
            <HistoryChart />

            {/* 4 — Portfolio grouped by type */}
            <section id="portfolio">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {t('dashboard.myAssets')}
                  </h2>
                  <button
                    onClick={() => fetchPrices(assets.map((a) => a.ticker))}
                    disabled={priceLoading}
                    className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    title="Atualizar cotações via brapi.dev"
                  >
                    <RefreshCw size={12} className={priceLoading ? 'animate-spin' : ''} />
                    {priceLoading ? 'Buscando...' : 'Atualizar cotações'}
                  </button>
                </div>
                <PortfolioList assets={assets} quotes={quotes} onRemove={remove} />
              </div>
            </section>
          </div>
        )}
      </main>

      {modalOpen && (
        <AssetFormModal
          onClose={() => setModalOpen(false)}
          onSave={({ asset, transaction }) => {
            add(asset)
            addTransaction(transaction)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
