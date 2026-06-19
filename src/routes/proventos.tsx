import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BadgeDollarSign, Plus, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import Sidebar from '../components/layout/Sidebar'
import { useDividendStore } from '../store/dividendStore'
import { useLocaleStore } from '../store/localeStore'
import { assetTypeFromValue, ASSET_TYPES } from '../config/assetTypes'
import type { Dividend, DividendKind } from '../types'

export const Route = createFileRoute('/proventos')({ component: ProventosPage })

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 [color-scheme:dark]'
const labelCls = 'mb-1.5 block text-xs font-medium text-stone-400'

const DIVIDEND_KINDS: { value: DividendKind; label: string }[] = [
  { value: 'dividendo', label: 'Dividendo' },
  { value: 'jcp', label: 'JCP' },
  { value: 'rendimento', label: 'Rendimento' },
  { value: 'amortizacao', label: 'Amortização' },
  { value: 'outros', label: 'Outros' },
]

const KIND_COLORS: Record<DividendKind, string> = {
  dividendo: 'bg-violet-500/10 text-violet-400',
  jcp: 'bg-blue-500/10 text-blue-400',
  rendimento: 'bg-teal-500/10 text-teal-400',
  amortizacao: 'bg-amber-500/10 text-amber-400',
  outros: 'bg-stone-500/10 text-stone-400',
}

function parseNum(v: string) { return parseFloat(v.replace(/\./g, '').replace(',', '.')) }

function DividendModal({ onClose, onSave }: { onClose: () => void; onSave: (d: Dividend) => void }) {
  const { money } = useLocaleStore()
  const [assetTypeValue, setAssetTypeValue] = useState('br_stock')
  const [ticker, setTicker] = useState('')
  const [kind, setKind] = useState<DividendKind>('dividendo')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState('')
  const [perUnit, setPerUnit] = useState('')
  const [error, setError] = useState('')

  const currency = assetTypeValue.startsWith('us_') ? 'USD' : 'BRL' as const
  const qty = parseNum(quantity) || 0
  const ppu = parseNum(perUnit) || 0
  const total = Math.round(qty * ppu * 100) / 100

  const save = () => {
    setError('')
    const ticker_ = ticker.trim().toUpperCase()
    if (!ticker_) return setError('Informe o ticker.')
    if (!(ppu > 0)) return setError('Informe o valor por cota.')
    if (!(qty > 0)) return setError('Informe a quantidade.')
    onSave({
      id: crypto.randomUUID(),
      ticker: ticker_,
      assetType: assetTypeFromValue(assetTypeValue),
      currency,
      kind,
      quantity: qty,
      amountPerUnit: Math.round(ppu * 100) / 100,
      total,
      paymentDate: date,
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
        <h2 className="mb-5 text-base font-semibold text-white">Registrar Provento</h2>

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
            <label className={labelCls}>Ativo</label>
            <input autoFocus value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="HGLG11" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tipo de provento</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as DividendKind)} className={inputCls}>
              {DIVIDEND_KINDS.map((k) => (
                <option key={k.value} value={k.value} className="bg-[#15151f]">{k.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Data de pagamento</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Quantidade de cotas</label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" inputMode="decimal" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Valor por cota <span className="text-stone-600">({currency})</span></label>
            <input value={perUnit} onChange={(e) => setPerUnit(e.target.value)} placeholder="1,20" inputMode="decimal" className={inputCls} />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/[0.06]">
          <span className="text-sm text-stone-400">Total recebido</span>
          <span className="text-base font-bold tabular-nums text-violet-400">
            {currency} {money(total)}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm text-stone-400 hover:text-white">
            Cancelar
          </button>
          <button
            onClick={save}
            className="flex-1 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Salvar provento
          </button>
        </div>
      </div>
    </div>
  )
}

function ProventosPage() {
  const { dividends, loading, load, add, remove } = useDividendStore()
  const { t, money, convertToDisplay, formatDate } = useLocaleStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => { load() }, [load])

  const sorted = [...dividends].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  )

  const thisYear = new Date().getFullYear().toString()
  const yearTotal = useMemo(
    () => dividends
      .filter((d) => d.paymentDate.startsWith(thisYear))
      .reduce((s, d) => s + convertToDisplay(d.total, d.currency), 0),
    [dividends, thisYear, convertToDisplay],
  )

  const allTimeTotal = useMemo(
    () => dividends.reduce((s, d) => s + convertToDisplay(d.total, d.currency), 0),
    [dividends, convertToDisplay],
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
                {t('prov.title')}
              </h1>
              <p className="text-sm text-stone-500">{t('prov.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90"
          >
            <Plus size={15} />
            {t('prov.new')}
          </button>
        </div>

        {/* Summary cards */}
        {dividends.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-xs text-stone-500">{t('prov.totalYear')} ({thisYear})</p>
              <p className="mt-1 text-2xl font-bold text-violet-400 tabular-nums">{money(yearTotal)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-xs text-stone-500">Total recebido (todos os anos)</p>
              <p className="mt-1 text-2xl font-bold text-white tabular-nums">{money(allTimeTotal)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
              <BadgeDollarSign size={28} className="text-stone-600" />
            </div>
            <div>
              <p className="text-base font-medium text-white">{t('prov.empty')}</p>
              <p className="mt-1 text-sm text-stone-500">{t('prov.emptyDesc')}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              {t('prov.new')}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-stone-600">
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">{t('prov.date')}</th>
                  <th className="px-4 py-3">{t('prov.asset')}</th>
                  <th className="px-4 py-3 text-right">{t('prov.qty')}</th>
                  <th className="px-4 py-3 text-right">{t('prov.perUnit')}</th>
                  <th className="px-4 py-3 text-right">{t('prov.total')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map((div) => (
                  <tr key={div.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold', KIND_COLORS[div.kind])}>
                        {DIVIDEND_KINDS.find((k) => k.value === div.kind)?.label ?? div.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-stone-400">
                      {formatDate(div.paymentDate + 'T00:00:00.000Z')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{div.ticker}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-300">{div.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-300">
                      {div.currency} {div.amountPerUnit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-violet-400">
                      {div.currency} {money(div.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(div.id)}
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
        <DividendModal
          onClose={() => setModalOpen(false)}
          onSave={(div) => { add(div); setModalOpen(false) }}
        />
      )}
    </div>
  )
}
