import { useRef } from 'react'
import { Download, Moon, Plus, Search, Upload } from 'lucide-react'

const iconBtn =
  'flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white'

interface TopbarProps {
  userName: string
  onExport: () => void
  onImport: (file: File) => void
  onNew: () => void
}

export default function Topbar({
  userName,
  onExport,
  onImport,
  onNew,
}: TopbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Welcome back, {userName}!
        </h1>
        <p className="text-sm text-stone-500">
          Here's how your portfolio is doing today.
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-500"
          />
          <input
            type="search"
            placeholder="Search..."
            className="w-44 rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pr-3 pl-9 text-sm text-stone-200 placeholder:text-stone-500 outline-none transition-colors focus:border-violet-500/50 md:w-56"
          />
        </div>

        <button className={iconBtn} title="Theme" type="button">
          <Moon size={16} />
        </button>
        <button onClick={onExport} className={iconBtn} title="Export JSON">
          <Download size={16} />
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className={iconBtn}
          title="Import JSON"
        >
          <Upload size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImport(f)
            e.target.value = ''
          }}
          className="hidden"
        />
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> <span className="hidden sm:inline">New asset</span>
        </button>
      </div>
    </header>
  )
}
