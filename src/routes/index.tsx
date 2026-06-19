import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import MetricCard from '../components/ui/MetricCard'
import EmptyState from '../components/ui/EmptyState'
import PortfolioList from '../components/portfolio/PortfolioList'
import AssetFormModal from '../components/portfolio/AssetFormModal'
import ChartsView from '../components/charts/ChartsView'
import { useAssets } from '../hooks/useAssets'
import { useProfileCtx } from '../context/ProfileContext'
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics'
import { exportJSON, importJSON } from '../lib/storage'
import { money } from '../lib/format'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { assets, loading, add, remove, replace } = useAssets()
  const { profile } = useProfileCtx()
  const [modalOpen, setModalOpen] = useState(false)
  const {
    count, total, hasQuantity, withValue, valuedShare,
    numTypes, totalTypes, diversification,
    byCount, byValue, topShare, topLabel,
  } = usePortfolioMetrics(assets)

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
    <div className="relative flex min-h-screen bg-[#0a0a12] text-stone-200">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-96 w-[40rem] rounded-full bg-violet-600/15 blur-[140px]" />

      <Sidebar />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div id="top" />
        <Topbar
          userName={profile?.name?.split(' ')[0] ?? 'there'}
          onExport={() => exportJSON(assets)}
          onImport={handleImport}
          onNew={() => setModalOpen(true)}
        />

        {loading ? (
          <div className="mt-6 flex flex-col gap-2">
            <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
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
                <h2 className="text-lg font-semibold text-white">Allocation</h2>
                <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  <Sparkles size={13} />
                  Largest: <span className="text-white">{topLabel}</span> ·{' '}
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
                label="Total invested"
                value={money(total)}
                percent={valuedShare}
                color="#8b5cf6"
                delta={`${withValue} of ${count} valued`}
                footer="positions"
              />
              <MetricCard
                label="Total assets"
                value={count}
                percent={diversification}
                color="#2dd4bf"
                delta={`${numTypes} of ${totalTypes} categories`}
                footer="diversification"
              />
              <MetricCard
                label="Top allocation"
                value={`${topShare}%`}
                percent={topShare}
                color="#4f8cff"
                delta={topLabel}
                footer="largest category"
              />
              <MetricCard
                label="Diversification"
                value={`${numTypes}/${totalTypes}`}
                percent={diversification}
                color="#f59e0b"
                delta={`${diversification}% spread`}
                footer="categories used"
              />
            </section>

            {/* 3 — Portfolio grouped by type */}
            <section id="portfolio">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Portfolio
                </h2>
                <PortfolioList assets={assets} onRemove={remove} />
              </div>
            </section>
          </div>
        )}
      </main>

      {modalOpen && (
        <AssetFormModal
          onClose={() => setModalOpen(false)}
          onSave={(item) => {
            add(item)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
