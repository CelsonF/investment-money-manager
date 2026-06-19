import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { MAIN_NAV, BOTTOM_NAV, filterNavByRole } from '../../config/navigation'
import { useProfile } from '../../hooks/useProfile'
import ProfileAvatar from '../profile/ProfileAvatar'
import type { NavItemConfig } from '../../types'

interface NavItemProps {
  item: NavItemConfig
  active?: boolean
  onClick?: () => void
}

function NavItem({ item, active = false, onClick }: NavItemProps) {
  const Icon = item.icon
  const activeCls = 'bg-white/[0.06] text-white ring-1 ring-white/10'
  const idleCls =
    'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
  const base =
    'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors '

  if (item.href) {
    return (
      <Link
        to={item.href as '/settings'}
        className={base + idleCls}
        activeProps={{ className: base + activeCls }}
        inactiveProps={{ className: base + idleCls }}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={base + (active ? activeCls : idleCls)}>
      <Icon size={18} />
      {item.label}
    </button>
  )
}

export default function Sidebar() {
  const { profile } = useProfile()
  const { location } = useRouterState()
  const isHome = location.pathname === '/'

  const [activeKey, setActiveKey] = useState<string>('dashboard')

  const role = profile?.role ?? 'viewer'
  const mainItems = filterNavByRole(MAIN_NAV, role)
  const bottomItems = filterNavByRole(BOTTOM_NAV, role)

  const handleScrollNav = (item: NavItemConfig) => {
    if (!item.target) return
    setActiveKey(item.key)
    if (!isHome) return
    if (item.target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c14] p-5 lg:flex">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <Sparkles size={18} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          Wealth<span className="text-violet-400">Mind</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1.5">
        {mainItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={isHome && activeKey === item.key}
            onClick={() => handleScrollNav(item)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 pt-6">
        {bottomItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            onClick={() => handleScrollNav(item)}
          />
        ))}

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <ProfileAvatar
            avatarUrl={profile?.avatarUrl ?? null}
            initials={profile?.initials ?? '??'}
            size="md"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {profile?.name ?? 'Loading…'}
            </div>
            <div className="text-xs capitalize text-stone-500">
              {profile?.role ?? ''}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
