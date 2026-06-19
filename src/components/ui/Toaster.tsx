import { CheckCircle, Info, XCircle, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useToastStore, type Toast } from '../../store/toastStore'

const CONFIG = {
  success: {
    icon: CheckCircle,
    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    iconCls: 'text-emerald-400',
  },
  error: {
    icon: XCircle,
    cls: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    iconCls: 'text-rose-400',
  },
  info: {
    icon: Info,
    cls: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    iconCls: 'text-violet-400',
  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToastStore()
  const { icon: Icon, cls, iconCls } = CONFIG[toast.type]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-sm',
        'animate-in slide-in-from-right-4 fade-in duration-200',
        cls,
      )}
    >
      <Icon size={16} className={cn('shrink-0', iconCls)} />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default function Toaster() {
  const { toasts } = useToastStore()
  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 bottom-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
