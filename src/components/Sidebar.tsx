import type { ComponentType } from 'react'
import {
  HelpCircle,
  LayoutDashboard,
  PieChart,
  Settings,
  Sparkles,
  Wallet,
} from 'lucide-react'
import type { Tab } from '../types'

interface NavItemProps {
  icon: ComponentType<{ size?: number }>
  label: string
  active?: boolean
  onClick?: () => void
}

function NavItem({ icon: Icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={
        'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ' +
        (active
          ? 'bg-white/[0.06] text-white ring-1 ring-white/10'
          : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200')
      }
    >
      <Icon size={18} />
      {label}
    </button>
  )
}

interface SidebarProps {
  tab: Tab
  setTab: (tab: Tab) => void
}

export default function Sidebar({ tab, setTab }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c14] p-5 lg:flex">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <Sparkles size={18} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          Wealth<span className="text-violet-400">Mind</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1.5">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          active={tab === 'portfolio'}
          onClick={() => setTab('portfolio')}
        />
        <NavItem
          icon={Wallet}
          label="Portfolio"
          active={tab === 'portfolio'}
          onClick={() => setTab('portfolio')}
        />
        <NavItem
          icon={PieChart}
          label="Analytics"
          active={tab === 'analytics'}
          onClick={() => setTab('analytics')}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 pt-6">
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={HelpCircle} label="Help Center" />

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
            JP
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              John Phelps
            </div>
            <div className="text-xs text-stone-500">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
