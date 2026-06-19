import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import MetricCard from '../components/MetricCard'
import EmptyState from '../components/EmptyState'
import PortfolioList from '../components/PortfolioList'
import AssetFormModal from '../components/AssetFormModal'
import ChartsView from '../components/charts/ChartsView'
import OverviewPanel from '../components/OverviewPanel'
import { useAssets } from '../hooks/useAssets'
import { exportJSON, importJSON } from '../lib/storage'
import { allocationByCount, allocationByValue } from '../lib/allocation'
import { money, pct } from '../lib/format'
import { ASSET_TYPES } from '../constants/assetTypes'
import type { ChartDatum, Tab } from '../types'

export const Route = createFileRoute('/')({ component: Home })

const USER_NAME = 'John'

function Home() {
  const { assets, loading, add, remove, replace } = useAssets()
  const [tab, setTab] = useState<Tab>('portfolio')
  const [modalOpen, setModalOpen] = useState(false)

  const count = assets.length
  const total = assets.reduce(
    (s, a) => s + (Number(a.averagePrice) || 0) * (Number(a.quantity) || 0),
    0,
  )
  const hasQuantity = assets.some((a) => a.quantity)
  const withValue = assets.filter(
    (a) => a.quantity != null && a.quantity > 0,
  ).length
  const valuedShare = count ? Math.round((withValue / count) * 100) : 0
  const numTypes = ASSET_TYPES.filter((t) =>
    assets.some((a) => a.type === t.id),
  ).length
  const diversification = Math.round((numTypes / ASSET_TYPES.length) * 100)

  const byCount = allocationByCount(assets)
  const byValue = allocationByValue(assets)
  const useValue = hasQuantity && byValue.length > 0
  const allocation: Array<ChartDatum> = useValue ? byValue : byCount
  const allocTotal = useValue ? total : count
  const top = allocation.reduce<ChartDatum | null>(
    (m, d) => (d.value > (m?.value ?? -1) ? d : m),
    null,
  )
  const topShare = top ? pct(top.value, allocTotal) : 0
  const topLabel = top ? top.label : '—'

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

      <Sidebar tab={tab} setTab={setTab} />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Topbar
          userName={USER_NAME}
          onExport={() => exportJSON(assets)}
          onImport={handleImport}
          onNew={() => setModalOpen(true)}
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total invested"
            value={money(total)}
            percent={valuedShare}
            color="#8b5cf6"
            delta={`${withValue} of ${count || 0} valued`}
            footer="positions"
          />
          <MetricCard
            label="Total assets"
            value={count}
            percent={diversification}
            color="#2dd4bf"
            delta={`${numTypes} of ${ASSET_TYPES.length} categories`}
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
            value={`${numTypes}/${ASSET_TYPES.length}`}
            percent={diversification}
            color="#f59e0b"
            delta={`${diversification}% spread`}
            footer="categories used"
          />
        </div>

        {loading ? (
          <div className="mt-6 flex flex-col gap-2">
            <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        ) : !hasAssets ? (
          <div className="mt-6">
            <EmptyState onAdd={() => setModalOpen(true)} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <section className="xl:col-span-2">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TabButton
                    active={tab === 'portfolio'}
                    onClick={() => setTab('portfolio')}
                  >
                    Portfolio
                  </TabButton>
                  <TabButton
                    active={tab === 'analytics'}
                    onClick={() => setTab('analytics')}
                  >
                    Analytics
                  </TabButton>
                </div>

                {tab === 'portfolio' ? (
                  <PortfolioList assets={assets} onRemove={remove} />
                ) : (
                  <ChartsView
                    assets={assets}
                    total={total}
                    hasQuantity={hasQuantity}
                  />
                )}
              </div>
            </section>

            <aside>
              <OverviewPanel
                data={allocation}
                totalRef={allocTotal}
                byValue={useValue}
                topLabel={topLabel}
                topShare={topShare}
              />
            </aside>
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ' +
        (active
          ? 'bg-white/[0.08] text-white'
          : 'text-stone-400 hover:text-stone-200')
      }
    >
      {children}
    </button>
  )
}
