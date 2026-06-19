import { Plus, Wallet } from 'lucide-react'
import { useLocaleStore } from '../../store/localeStore'

interface EmptyStateProps {
  onAdd: () => void
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  const { t } = useLocaleStore()

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
        <Wallet size={26} />
      </div>
      <h3 className="text-lg font-semibold text-white">{t('empty.title')}</h3>
      <p className="mt-1 mb-6 max-w-xs text-sm text-stone-500">
        {t('empty.description')}
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90"
      >
        <Plus size={16} />
        {t('empty.button')}
      </button>
    </div>
  )
}
