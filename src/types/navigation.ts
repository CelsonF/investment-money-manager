import type { ComponentType } from 'react'
import type { UserRole } from './profile'

export type NavItemType = 'link' | 'action'

export interface NavItemConfig {
  key: string
  type: NavItemType
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  target?: string
  href?: string
  allowedRoles?: UserRole[]
}
