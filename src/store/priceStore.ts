import { create } from 'zustand'
import { fetchQuotes } from '../server/portfolio'
import { toast } from './toastStore'

export interface PriceQuote {
  price: number
  changePercent: number
  updatedAt: string
}

interface PriceState {
  quotes: Record<string, PriceQuote>
  loading: boolean
  fetchPrices: (tickers: string[]) => Promise<void>
}

export const usePriceStore = create<PriceState>()((set, get) => ({
  quotes: {},
  loading: false,

  fetchPrices: async (tickers) => {
    if (!tickers.length) return
    const unique = [...new Set(tickers)]
    set({ loading: true })
    try {
      const result = await fetchQuotes({ data: unique })
      const now = new Date().toISOString()
      const next = { ...get().quotes }
      for (const [ticker, q] of Object.entries(result)) {
        next[ticker] = { ...q, updatedAt: now }
      }
      set({ quotes: next, loading: false })
      const found = Object.keys(result).length
      if (found > 0) toast.success(`${found} cotações atualizadas`)
      else toast.info('Nenhuma cotação encontrada')
    } catch {
      set({ loading: false })
      toast.error('Erro ao buscar cotações')
    }
  },
}))
