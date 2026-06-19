import { create } from 'zustand'
import type { Transaction } from '../types'
import { getTransactions, saveTransactions } from '../server/portfolio'
import { toast } from './toastStore'

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  load: () => Promise<void>
  add: (txn: Transaction) => void
  remove: (id: string) => void
}

let _fetched = false

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  loading: false,

  load: async () => {
    if (_fetched) return
    _fetched = true
    set({ loading: true })
    try {
      const data = await getTransactions()
      set({ transactions: data, loading: false })
    } catch {
      _fetched = false
      toast.error('Erro ao carregar transações')
      set({ loading: false })
    }
  },

  add: (txn) => {
    const next = [txn, ...get().transactions]
    set({ transactions: next })
    saveTransactions({ data: { transactions: next } })
      .then(() => toast.success('Transação registrada'))
      .catch(() => {
        set({ transactions: get().transactions.filter((t) => t.id !== txn.id) })
        toast.error('Erro ao salvar transação')
      })
  },

  remove: (id) => {
    const prev = get().transactions
    const next = prev.filter((t) => t.id !== id)
    set({ transactions: next })
    saveTransactions({ data: { transactions: next } })
      .then(() => toast.success('Transação removida'))
      .catch(() => {
        set({ transactions: prev })
        toast.error('Erro ao remover transação')
      })
  },
}))
