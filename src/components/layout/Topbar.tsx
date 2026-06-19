import { useRef, useState } from 'react'
import { ChevronDown, Download, Menu, Moon, Plus, Search, Sun, Upload } from 'lucide-react'
import { useLocaleStore } from '../../store/localeStore'
import { useUIStore } from '../../store/uiStore'

const iconBtn =
  'flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white'

interface TopbarProps {
  userName: string
  onExportJSON: () => void
  onExportCSV: () => void
  onImport: (file: File) => void
  onNew: () => void
}

export default function Topbar({ userName, onExportJSON, onExportCSV, onImport, onNew }: TopbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const { t } = useLocaleStore()
  const { toggleMobileNav, setSearchQuery, searchQuery, theme, toggleTheme } = useUIStore()

  return (
    <header className="flex flex-wrap items-center gap-3 sm:gap-4">
      {/* Hamburger — visible only on mobile */}
      <button
        onClick={toggleMobileNav}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={16} />
      </button>

      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {t('topbar.welcome', { name: userName })}
        </h1>
        <p className="text-sm text-stone-500">{t('topbar.subtitle')}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-500"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('topbar.search')}
            className="w-44 rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pr-3 pl-9 text-sm text-stone-200 placeholder:text-stone-500 outline-none transition-colors focus:border-violet-500/50 md:w-56"
          />
        </div>

        <button onClick={toggleTheme} className={iconBtn} title="Alternar tema" type="button">
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            className={iconBtn}
            title="Exportar"
          >
            <Download size={16} />
            <ChevronDown size={10} className="absolute bottom-1.5 right-1.5" />
          </button>
          {exportOpen && (
            <div
              className="absolute right-0 top-full z-30 mt-1 min-w-[140px] rounded-xl border border-white/[0.08] bg-[var(--c-modal)] py-1 shadow-2xl"
              onMouseLeave={() => setExportOpen(false)}
            >
              <button
                onClick={() => { onExportJSON(); setExportOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Exportar JSON
              </button>
              <button
                onClick={() => { onExportCSV(); setExportOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Exportar CSV
              </button>
            </div>
          )}
        </div>
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
          <Plus size={16} />
          <span className="hidden sm:inline">{t('topbar.newAsset')}</span>
        </button>
      </div>
    </header>
  )
}
