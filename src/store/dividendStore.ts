import { create } from 'zustand'
import type { Dividend } from '../types'
import { getDividends, saveDividends } from '../server/portfolio'
import { toast } from './toastStore'

interface DividendState {
  dividends: Dividend[]
  loading: boolean
  load: () => Promise<void>
  add: (div: Dividend) => void
  remove: (id: string) => void
}

let _fetched = false

export const useDividendStore = create<DividendState>()((set, get) => ({
  dividends: [],
  loading: false,

  load: async () => {
    if (_fetched) return
    _fetched = true
    set({ loading: true })
    try {
      const data = await getDividends()
      set({ dividends: data, loading: false })
    } catch {
      _fetched = false
      toast.error('Erro ao carregar proventos')
      set({ loading: false })
    }
  },

  add: (div) => {
    const next = [div, ...get().dividends]
    set({ dividends: next })
    saveDividends({ data: { dividends: next } })
      .then(() => toast.success('Provento registrado'))
      .catch(() => {
        set({ dividends: get().dividends.filter((d) => d.id !== div.id) })
        toast.error('Erro ao salvar provento')
      })
  },

  remove: (id) => {
    const prev = get().dividends
    const next = prev.filter((d) => d.id !== id)
    set({ dividends: next })
    saveDividends({ data: { dividends: next } })
      .then(() => toast.success('Provento removido'))
      .catch(() => {
        set({ dividends: prev })
        toast.error('Erro ao remover provento')
      })
  },
}))
