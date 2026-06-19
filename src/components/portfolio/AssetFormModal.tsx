import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { assetTypeFromValue } from '../../config/assetTypes'
import { useLocaleStore } from '../../store/localeStore'
import type { Asset, Transaction, TranslationKey } from '../../types'

export interface AssetFormPayload {
  asset: Asset
  transaction: Transaction
}

type Tab = 'buy' | 'sell'

interface AssetFormModalProps {
  onClose: () => void
  onSave: (payload: AssetFormPayload) => void
}

const labelCls = 'text-xs font-medium text-stone-400'
const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 [color-scheme:dark]'

function parseDecimal(v: string) {
  return parseFloat(v.replace(/\./g, '').replace(',', '.'))
}

function calcTotal(qty: string, price: string, other: string) {
  const q = parseDecimal(qty) || 0
  const p = parseDecimal(price) || 0
  const o = parseDecimal(other) || 0
  return q * p + o
}

// Each group references translation keys for its label and items
const GROUPS: Array<{
  labelKey: TranslationKey
  items: Array<{ value: string; labelKey: TranslationKey }>
}> = [
  {
    labelKey: 'modal.group.br',
    items: [
      { value: 'br_stock', labelKey: 'modal.type.br_stock' },
      { value: 'br_reit', labelKey: 'modal.type.br_reit' },
      { value: 'br_fixed_income', labelKey: 'modal.type.br_fixed_income' },
      { value: 'br_etf', labelKey: 'modal.type.br_etf' },
      { value: 'br_fund', labelKey: 'modal.type.br_fund' },
      { value: 'br_bdr', labelKey: 'modal.type.br_bdr' },
      { value: 'br_crypto', labelKey: 'modal.type.br_crypto' },
    ],
  },
  {
    labelKey: 'modal.group.us',
    items: [
      { value: 'us_stock', labelKey: 'modal.type.us_stock' },
      { value: 'us_etf', labelKey: 'modal.type.us_etf' },
      { value: 'us_reit', labelKey: 'modal.type.us_reit' },
      { value: 'us_fixed_income', labelKey: 'modal.type.us_fixed_income' },
      { value: 'us_crypto', labelKey: 'modal.type.us_crypto' },
      { value: 'us_other', labelKey: 'modal.type.us_other' },
    ],
  },
]

export default function AssetFormModal({ onClose, onSave }: AssetFormModalProps) {
  const { t, money, convertToDisplay } = useLocaleStore()
  const [tab, setTab] = useState<Tab>('buy')
  const [assetTypeValue, setAssetTypeValue] = useState('br_stock')
  const [ticker, setTicker] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [otherCosts, setOtherCosts] = useState('')
  const [error, setError] = useState('')

  const isBuy = tab === 'buy'
  // Derive currency from group prefix: us_ → USD, br_ → BRL
  const assetCurrency = assetTypeValue.startsWith('us_') ? 'USD' : 'BRL'
  const rawTotal = calcTotal(quantity, price, otherCosts)
  // Show total converted to the display currency
  const displayTotal = convertToDisplay(rawTotal, assetCurrency)

  const save = () => {
    setError('')
    const ticker_ = ticker.trim().toUpperCase()
    const p = parseDecimal(price)
    const q = quantity === '' ? null : parseDecimal(quantity)
    const other = otherCosts === '' ? 0 : parseDecimal(otherCosts) || 0
    if (!ticker_) return setError(t('modal.error.ticker'))
    if (!(p > 0)) return setError(t('modal.error.price'))
    if (q !== null && !(q >= 0)) return setError(t('modal.error.qty'))
    const assetType = assetTypeFromValue(assetTypeValue)
    const qtyNum = q ?? 0
    const total = Math.round((qtyNum * p + other) * 100) / 100
    const asset: Asset = {
      id: crypto.randomUUID(),
      ticker: ticker_,
      type: assetType,
      currency: assetCurrency,
      quantity: q,
      averagePrice: Math.round(p * 100) / 100,
      createdAt: new Date().toISOString(),
    }
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      ticker: ticker_,
      assetType,
      currency: assetCurrency,
      kind: isBuy ? 'buy' : 'sell',
      quantity: qtyNum,
      price: Math.round(p * 100) / 100,
      otherCosts: Math.round(other * 100) / 100,
      total,
      date: date,
      createdAt: new Date().toISOString(),
    }
    onSave({ asset, transaction })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#15151f] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center border-b border-white/[0.06] px-6 pt-5 pb-4">
          <h2 className="text-base font-semibold text-white">{t('modal.title')}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Tabs */}
          <div className="mb-6 flex gap-1.5 rounded-xl bg-white/[0.03] p-1">
            {(['buy', 'sell'] as const).map((tabKey) => {
              const active = tab === tabKey
              const isBuyTab = tabKey === 'buy'
              return (
                <button
                  key={tabKey}
                  onClick={() => { setTab(tabKey); setError('') }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
                    active && isBuyTab &&
                      'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
                    active && !isBuyTab &&
                      'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/25',
                    !active && 'text-stone-500 hover:text-stone-300',
                  )}
                >
                  {isBuyTab ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  {isBuyTab ? t('modal.buy') : t('modal.sell')}
                </button>
              )
            })}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label className={cn(labelCls, 'mb-1.5 block')}>{t('modal.assetType')}</label>
              <select
                value={assetTypeValue}
                onChange={(e) => setAssetTypeValue(e.target.value)}
                className={inputCls}
              >
                {GROUPS.map((group) => (
                  <optgroup key={group.labelKey} label={t(group.labelKey)}>
                    {group.items.map((item) => (
                      <option key={item.value} value={item.value} className="bg-[#15151f]">
                        {t(item.labelKey)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className={cn(labelCls, 'mb-1.5 block')}>{t('modal.asset')}</label>
              <input
                autoFocus
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder={t('modal.placeholder.asset')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={cn(labelCls, 'mb-1.5 block')}>
                {t('modal.transactionDate')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={cn(labelCls, 'mb-1.5 block')}>{t('modal.quantity')}</label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                inputMode="decimal"
                className={inputCls}
              />
            </div>

            <div>
              <label className={cn(labelCls, 'mb-1.5 block')}>
                {isBuy ? t('modal.buyPrice') : t('modal.sellPrice')}{' '}
                <span className="text-stone-600">({assetCurrency})</span>
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                onKeyDown={(e) => e.key === 'Enter' && save()}
                className={inputCls}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className={labelCls}>{t('modal.otherCosts')}</span>
                <span className="text-xs text-stone-600">{t('modal.optional')}</span>
              </div>
              <input
                value={otherCosts}
                onChange={(e) => setOtherCosts(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                className={inputCls}
              />
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
        </div>

        {/* Total */}
        <div className="mx-6 mb-5 flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/[0.06]">
          <span className="text-sm font-semibold text-stone-300">
            {isBuy ? t('modal.totalValue') : t('modal.received')}
          </span>
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              isBuy ? 'text-emerald-400' : 'text-rose-400',
            )}
          >
            {money(displayTotal)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={onClose}
            className="text-sm font-medium text-stone-400 underline-offset-2 transition-colors hover:text-stone-200 hover:underline"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={save}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90',
              isBuy
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-600/20'
                : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-600/20',
            )}
          >
            <Plus size={15} />
            {isBuy ? t('modal.addBuy') : t('modal.addSell')}
          </button>
        </div>
      </div>
    </div>
  )
}
