import { create } from 'zustand'
import type { Asset } from '../types'
import { getAssets, saveAssets } from '../server/portfolio'
import { toast } from './toastStore'

interface AssetState {
  assets: Asset[]
  loading: boolean
  load: () => Promise<void>
  add: (item: Asset) => void
  remove: (id: string) => void
  replace: (list: Asset[]) => void
}

let _fetched = false

export const useAssetStore = create<AssetState>()((set) => ({
  assets: [],
  loading: false,

  load: async () => {
    if (_fetched) return
    _fetched = true
    set({ loading: true })
    try {
      const data = await getAssets()
      set({ assets: data, loading: false })
    } catch (e) {
      console.error('Failed to load portfolio', e)
      _fetched = false
      toast.error('Erro ao carregar carteira')
      set({ loading: false })
    }
  },

  add: (item) => {
    set((s) => {
      const next = [...s.assets, item]
      saveAssets({ data: next })
        .then(() => toast.success('Ativo adicionado'))
        .catch(() => toast.error('Erro ao salvar ativo'))
      return { assets: next }
    })
  },

  remove: (id) => {
    set((s) => {
      const next = s.assets.filter((a) => a.id !== id)
      saveAssets({ data: next })
        .then(() => toast.success('Ativo removido'))
        .catch(() => toast.error('Erro ao remover ativo'))
      return { assets: next }
    })
  },

  replace: (list) => {
    set({ assets: list })
    saveAssets({ data: list })
      .then(() => toast.success('Carteira importada'))
      .catch(() => toast.error('Erro ao importar carteira'))
  },
}))
