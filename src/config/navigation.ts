import {
  HelpCircle,
  LayoutDashboard,
  PieChart,
  Settings,
  Wallet,
} from 'lucide-react'
import type { NavItemConfig, UserRole } from '../types'

export const MAIN_NAV: NavItemConfig[] = [
  {
    key: 'dashboard',
    type: 'link',
    icon: LayoutDashboard,
    label: 'Dashboard',
    target: 'top',
    allowedRoles: ['admin', 'manager', 'viewer'],
  },
  {
    key: 'analytics',
    type: 'link',
    icon: PieChart,
    label: 'Analytics',
    target: 'allocation',
    allowedRoles: ['admin', 'manager', 'viewer'],
  },
  {
    key: 'portfolio',
    type: 'link',
    icon: Wallet,
    label: 'Portfolio',
    target: 'portfolio',
    allowedRoles: ['admin', 'manager', 'viewer'],
  },
]

export const BOTTOM_NAV: NavItemConfig[] = [
  {
    key: 'settings',
    type: 'link',
    icon: Settings,
    label: 'Settings',
    href: '/settings',
    allowedRoles: ['admin', 'manager'],
  },
  {
    key: 'help',
    type: 'link',
    icon: HelpCircle,
    label: 'Help Center',
    target: 'top',
    allowedRoles: ['admin', 'manager', 'viewer'],
  },
]

export function filterNavByRole(
  items: NavItemConfig[],
  role: UserRole,
): NavItemConfig[] {
  return items.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role),
  )
}
