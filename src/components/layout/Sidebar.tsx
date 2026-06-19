import { Link } from '@tanstack/react-router'
import { Sparkles, X } from 'lucide-react'
import { MAIN_NAV, BOTTOM_NAV, filterNavByRole } from '../../config/navigation'
import { useProfileStore } from '../../store/profileStore'
import { useScrollNav } from '../../hooks/useScrollNav'
import { useLocaleStore } from '../../store/localeStore'
import { useUIStore } from '../../store/uiStore'
import ProfileAvatar from '../profile/ProfileAvatar'
import { cn } from '../../lib/cn'
import type { NavItemConfig, TranslationKey } from '../../types'

interface NavItemProps {
  item: NavItemConfig
  active?: boolean
  onClick?: () => void
}

function NavItem({ item, active = false, onClick }: NavItemProps) {
  const Icon = item.icon
  const { t } = useLocaleStore()
  const label = t(`nav.${item.key}` as TranslationKey)

  const base =
    'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors'
  const activeCls = 'bg-white/[0.06] text-white ring-1 ring-white/10'
  const idleCls = 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'

  if (item.href) {
    return (
      <Link
        to={item.href}
        activeProps={{ className: cn(base, activeCls) }}
        inactiveProps={{ className: cn(base, idleCls) }}
      >
        <Icon size={18} />
        {label}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={cn(base, active ? activeCls : idleCls)}>
      <Icon size={18} />
      {label}
    </button>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { profile } = useProfileStore()
  const { isHome, activeKey, navigate } = useScrollNav()

  const role = profile?.role ?? 'viewer'
  const mainItems = filterNavByRole(MAIN_NAV, role)
  const bottomItems = filterNavByRole(BOTTOM_NAV, role)

  const handleNavClick = (item: NavItemConfig) => {
    navigate(item)
    onClose?.()
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Wealth<span className="text-violet-400">Mind</span>
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1.5">
        {mainItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={isHome && activeKey === item.key}
            onClick={() => handleNavClick(item)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 pt-6">
        {bottomItems.map((item) => (
          <NavItem key={item.key} item={item} onClick={() => handleNavClick(item)} />
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
    </>
  )
}

export default function Sidebar() {
  const { mobileNavOpen, closeMobileNav } = useUIStore()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--c-border)] bg-[var(--c-sidebar)] p-5 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileNav}
          />
          {/* Drawer */}
          <aside className="absolute top-0 left-0 flex h-full w-64 shrink-0 flex-col border-r border-[var(--c-border)] bg-[var(--c-sidebar)] p-5">
            <SidebarContent onClose={closeMobileNav} />
          </aside>
        </div>
      )}
    </>
  )
}
