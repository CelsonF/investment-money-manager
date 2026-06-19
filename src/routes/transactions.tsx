import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowLeftRight, Plus, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import Sidebar from '../components/layout/Sidebar'
import { useTransactionStore } from '../store/transactionStore'
import { useLocaleStore } from '../store/localeStore'
import { assetTypeFromValue, ASSET_TYPES } from '../config/assetTypes'
import type { Transaction } from '../types'

export const Route = createFileRoute('/transactions')({ component: TransactionsPage })

// ─── Transaction form modal ───────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 [color-scheme:dark]'
const labelCls = 'mb-1.5 block text-xs font-medium text-stone-400'

function parseNum(v: string) { return parseFloat(v.replace(/\./g, '').replace(',', '.')) }

function TransactionModal({ onClose, onSave }: { onClose: () => void; onSave: (t: Transaction) => void }) {
  const { t, money } = useLocaleStore()
  const [kind, setKind] = useState<'buy' | 'sell'>('buy')
  const [assetTypeValue, setAssetTypeValue] = useState('br_stock')
  const [ticker, setTicker] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [otherCosts, setOtherCosts] = useState('')
  const [error, setError] = useState('')

  const currency = assetTypeValue.startsWith('us_') ? 'USD' : 'BRL' as const
  const qty = parseNum(quantity) || 0
  const prc = parseNum(price) || 0
  const other = parseNum(otherCosts) || 0
  const total = Math.round((qty * prc + other) * 100) / 100

  const save = () => {
    setError('')
    const ticker_ = ticker.trim().toUpperCase()
    if (!ticker_) return setError('Informe o ticker.')
    if (!(prc > 0)) return setError('Informe um preço válido.')
    if (!(qty > 0)) return setError('Informe a quantidade.')
    onSave({
      id: crypto.randomUUID(),
      ticker: ticker_,
      assetType: assetTypeFromValue(assetTypeValue),
      currency,
      kind,
      quantity: qty,
      price: Math.round(prc * 100) / 100,
      otherCosts: Math.round(other * 100) / 100,
      total,
      date,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[var(--c-modal)] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{t('txn.modal.title')}</h2>
        </div>

        {/* Kind tabs */}
        <div className="mb-5 flex gap-1.5 rounded-xl bg-white/[0.03] p-1">
          {(['buy', 'sell'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                kind === k && k === 'buy' && 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
                kind === k && k === 'sell' && 'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/25',
                kind !== k && 'text-stone-500 hover:text-stone-300',
              )}
            >
              {k === 'buy' ? t('txn.buy') : t('txn.sell')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tipo de ativo</label>
            <select value={assetTypeValue} onChange={(e) => setAssetTypeValue(e.target.value)} className={inputCls}>
              {ASSET_TYPES.map((at) => (
                <option key={at.id} value={at.id} className="bg-[#15151f]">{at.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('txn.asset')}</label>
            <input autoFocus value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="PETR4" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('txn.date')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('txn.qty')}</label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" inputMode="decimal" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('txn.price')} <span className="text-stone-600">({currency})</span></label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" inputMode="decimal" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('txn.costs')} <span className="text-stone-600">(opt.)</span></label>
            <input value={otherCosts} onChange={(e) => setOtherCosts(e.target.value)} placeholder="0,00" inputMode="decimal" className={inputCls} />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/[0.06]">
          <span className="text-sm text-stone-400">{t('txn.total')}</span>
          <span className={cn('text-base font-bold tabular-nums', kind === 'buy' ? 'text-emerald-400' : 'text-rose-400')}>
            {currency} {money(total)}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm text-stone-400 hover:text-white">
            {t('txn.modal.cancel')}
          </button>
          <button
            onClick={save}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90',
              kind === 'buy' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-pink-600',
            )}
          >
            {t('txn.modal.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TransactionsPage() {
  const { transactions, loading, load, add, remove } = useTransactionStore()
  const { t, money, formatDate } = useLocaleStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => { load() }, [load])

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="relative flex min-h-screen bg-[var(--c-bg)] text-[var(--c-text-2)]">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-96 w-[40rem] rounded-full bg-violet-600/15 blur-[140px]" />

      <Sidebar />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {t('txn.title')}
              </h1>
              <p className="text-sm text-stone-500">{t('txn.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90"
          >
            <Plus size={15} />
            {t('txn.new')}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
              <ArrowLeftRight size={28} className="text-stone-600" />
            </div>
            <div>
              <p className="text-base font-medium text-white">{t('txn.empty')}</p>
              <p className="mt-1 text-sm text-stone-500">{t('txn.emptyDesc')}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              {t('txn.new')}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-stone-600">
                  <th className="px-4 py-3">{t('txn.kind')}</th>
                  <th className="px-4 py-3">{t('txn.date')}</th>
                  <th className="px-4 py-3">{t('txn.asset')}</th>
                  <th className="px-4 py-3 text-right">{t('txn.qty')}</th>
                  <th className="px-4 py-3 text-right">{t('txn.price')}</th>
                  <th className="px-4 py-3 text-right">{t('txn.total')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map((txn) => (
                  <tr key={txn.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          txn.kind === 'buy'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400',
                        )}
                      >
                        {txn.kind === 'buy' ? t('txn.buy') : t('txn.sell')}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-stone-400">
                      {formatDate(txn.date + 'T00:00:00.000Z')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{txn.ticker}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-300">{txn.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-300">
                      {txn.currency} {txn.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">
                      {txn.currency} {money(txn.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(txn.id)}
                        className="rounded-md p-1.5 text-stone-700 opacity-0 transition-colors hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen && (
        <TransactionModal
          onClose={() => setModalOpen(false)}
          onSave={(txn) => { add(txn); setModalOpen(false) }}
        />
      )}
    </div>
  )
}
