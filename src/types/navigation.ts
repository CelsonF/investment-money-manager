import type { ComponentType } from 'react'
import type { LinkProps } from '@tanstack/react-router'
import type { UserRole } from './profile'

export type NavItemType = 'link' | 'action'

export interface NavItemConfig {
  key: string
  type: NavItemType
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  target?: string
  href?: LinkProps['to']
  allowedRoles?: UserRole[]
}
