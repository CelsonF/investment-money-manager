import { useState } from 'react'
import { ArrowUpDown, ChevronDown, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ASSET_TYPES } from '../../config/assetTypes'
import { useLocaleStore } from '../../store/localeStore'
import { useUIStore } from '../../store/uiStore'
import { positionValue } from '../../types/asset'
import type { Asset } from '../../types'
import type { AssetType } from '../../config/assetTypes'
import type { PriceQuote } from '../../store/priceStore'

type SortKey = 'name' | 'value' | 'share'

interface PortfolioListProps {
  assets: Array<Asset>
  quotes?: Record<string, PriceQuote>
  onRemove: (id: string) => void
}

type AssetGroup = AssetType & {
  items: Array<Asset>
  total: number     // already in display currency
  share: number
}

// ─── Confirmation dialog ───────────────────────────────────────────────────────

function ConfirmRemoveDialog({
  ticker,
  onConfirm,
  onCancel,
}: {
  ticker: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-80 rounded-2xl border border-[var(--c-border-2)] bg-[var(--c-modal)] p-6 shadow-2xl">
        <div className="mb-1 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15">
            <Trash2 size={15} className="text-rose-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Remover ativo</h3>
        </div>
        <p className="mb-5 mt-2 text-sm text-stone-400">
          Tem certeza que deseja remover{' '}
          <span className="font-semibold text-white">{ticker}</span> da carteira?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-sm text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500/20 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/30 hover:text-rose-300"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Asset group row ───────────────────────────────────────────────────────────

function AssetGroupRow({
  group,
  quotes = {},
  onRemoveRequest,
}: {
  group: AssetGroup
  quotes?: Record<string, PriceQuote>
  onRemoveRequest: (id: string, ticker: string) => void
}) {
  const [open, setOpen] = useState(false)
  const { t, money, convertToDisplay, displayCurrency } = useLocaleStore()

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-white/[0.02] transition-colors',
        open ? 'border-white/10' : 'border-white/[0.06] hover:border-white/[0.09]',
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tracking-wide"
          style={{ background: `${group.color}22`, color: group.color }}
        >
          {group.abbr}
        </span>

        <span className="flex-1 text-sm font-semibold text-white">{group.label}</span>

        <div className="flex items-center gap-5">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] uppercase tracking-wider text-stone-600">
              {t('portfolio.assetsCol')}
            </p>
            <p className="text-sm font-medium text-stone-200 tabular-nums">
              {group.items.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-stone-600">
              {t('portfolio.total')}
            </p>
            <p className="text-sm font-semibold text-white tabular-nums">
              {money(group.total)}
            </p>
          </div>

          <div className="hidden min-w-[52px] text-right md:block">
            <p className="text-[10px] uppercase tracking-wider text-stone-600">
              {t('portfolio.allocation')}
            </p>
            <p
              className="text-sm font-semibold tabular-nums"
              style={{ color: group.color }}
            >
              {group.share}%
            </p>
          </div>

          <ChevronDown
            size={15}
            className={cn(
              'shrink-0 text-stone-600 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* CSS grid trick: grid-template-rows 0fr→1fr animates height with no JS */}
      <div
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        className="grid transition-[grid-template-rows] duration-200 ease-out"
      >
      <div className="overflow-hidden">
      <div className="border-t border-white/[0.05] bg-black/10 px-3 pb-3 pt-2">
          <div className="flex flex-col gap-1.5">
            {group.items.map((asset) => {
              const hasQty = asset.quantity != null && asset.quantity > 0
              const assetCurrency = asset.currency ?? 'BRL'
              const nativeValue = positionValue(asset)
              const displayValue = convertToDisplay(nativeValue, assetCurrency)
              const isCrossRate = assetCurrency !== displayCurrency
              const quote = quotes[asset.ticker]
              const pnlPct = quote
                ? ((quote.price - asset.averagePrice) / asset.averagePrice) * 100
                : null
              return (
                <div
                  key={asset.id}
                  className="group/row flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                >
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: `${group.color}22`, color: group.color }}
                  >
                    {asset.ticker}
                  </span>

                  <div className="min-w-0 flex-1">
                    {hasQty && (
                      <p className="text-xs text-stone-500 tabular-nums">
                        {asset.quantity} × {asset.currency}{' '}
                        {asset.averagePrice.toLocaleString()}
                      </p>
                    )}
                    {isCrossRate && (
                      <p className="text-[10px] text-stone-600 tabular-nums">
                        {assetCurrency} {nativeValue.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {pnlPct !== null && (
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-xs font-medium tabular-nums',
                        pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {pnlPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </span>
                  )}

                  <span className="text-sm font-medium text-white tabular-nums">
                    {money(displayValue)}
                  </span>

                  <button
                    onClick={() => onRemoveRequest(asset.id, asset.ticker)}
                    aria-label={`Remover ${asset.ticker}`}
                    className="flex rounded-md p-1.5 text-stone-700 transition-colors hover:bg-rose-500/10 hover:text-rose-400 group-hover/row:text-stone-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function PortfolioList({ assets, quotes = {}, onRemove }: PortfolioListProps) {
  const { t, convertToDisplay } = useLocaleStore()
  const { searchQuery } = useUIStore()
  const [pending, setPending] = useState<{ id: string; ticker: string } | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('value')

  const query = searchQuery.toLowerCase()

  const groups: Array<AssetGroup> = ASSET_TYPES.map((type) => {
    const items = assets.filter((a) => {
      const matchType = a.type === type.id
      const matchSearch =
        !query ||
        a.ticker.toLowerCase().includes(query) ||
        type.label.toLowerCase().includes(query)
      return matchType && matchSearch
    })
    const total = items.reduce(
      (s, a) => s + convertToDisplay(positionValue(a), a.currency ?? 'BRL'),
      0,
    )
    return { ...type, items, total, share: 0 }
  }).filter((g) => g.items.length > 0)

  const portfolioTotal = groups.reduce((s, g) => s + g.total, 0)
  const groupsWithShare = groups.map((g) => ({
    ...g,
    share: portfolioTotal > 0 ? Math.round((g.total / portfolioTotal) * 100) : 0,
  }))

  const sortedGroups = [...groupsWithShare].sort((a, b) => {
    if (sortKey === 'name') return a.label.localeCompare(b.label)
    if (sortKey === 'share') return b.share - a.share
    return b.total - a.total // value (default)
  })

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'value', label: 'Valor' },
    { key: 'share', label: '%' },
    { key: 'name', label: 'Nome' },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-sm text-stone-500">
          {assets.length}{' '}
          {assets.length === 1 ? t('portfolio.asset') : t('portfolio.assets')}{' '}
          {t('portfolio.assetsCol').toLowerCase() === 'assets' ? 'in' : 'em'}{' '}
          {groupsWithShare.length}{' '}
          {groupsWithShare.length === 1
            ? t('portfolio.category')
            : t('portfolio.categories')}
        </span>
        <div className="flex items-center gap-1">
          <ArrowUpDown size={11} className="text-stone-600" />
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs transition-colors',
                sortKey === key
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-stone-500 hover:text-stone-300',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sortedGroups.map((g) => (
        <AssetGroupRow
          key={g.id}
          group={g}
          quotes={quotes}
          onRemoveRequest={(id, ticker) => setPending({ id, ticker })}
        />
      ))}

      {pending && (
        <ConfirmRemoveDialog
          ticker={pending.ticker}
          onConfirm={() => { onRemove(pending.id); setPending(null) }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}
