import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { ASSET_TYPES } from '../constants/assetTypes'
import type { Asset, AssetTypeId } from '../types'

interface AssetFormModalProps {
  onClose: () => void
  onSave: (item: Asset) => void
}

const labelCls = 'mb-1.5 block text-xs font-medium text-stone-400'
const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-stone-500 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'

export default function AssetFormModal({
  onClose,
  onSave,
}: AssetFormModalProps) {
  const [ticker, setTicker] = useState('')
  const [type, setType] = useState<AssetTypeId>('stock')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')

  const save = () => {
    setError('')
    const t = ticker.trim().toUpperCase()
    const p = parseFloat(price.replace(',', '.'))
    const q = quantity === '' ? null : parseFloat(quantity.replace(',', '.'))
    if (!t) return setError('Enter the asset name or ticker.')
    if (!(p > 0)) return setError('Enter a valid average price.')
    if (q !== null && !(q >= 0))
      return setError('Quantity must be a valid number.')
    onSave({
      id: crypto.randomUUID(),
      ticker: t,
      type,
      quantity: q,
      averagePrice: Math.round(p * 100) / 100,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151f] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center">
          <h2 className="m-0 text-lg font-semibold text-white">New asset</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex rounded-md p-1 text-stone-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className={labelCls}>Asset / Ticker</label>
          <input
            autoFocus
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g. AAPL"
            className={inputCls}
          />
        </div>

        <div className="mb-4">
          <label className={labelCls}>Investment type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssetTypeId)}
            className={inputCls}
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#15151f]">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>Quantity (optional)</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 100"
              inputMode="decimal"
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Average price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 28.50"
              inputMode="decimal"
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className={inputCls}
            />
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
