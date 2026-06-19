import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import type { NavItemConfig } from '../types'

export function useScrollNav(defaultKey = 'dashboard') {
  const { location } = useRouterState()
  const isHome = location.pathname === '/'
  const [activeKey, setActiveKey] = useState(defaultKey)

  function navigate(item: NavItemConfig) {
    if (!item.target) return
    setActiveKey(item.key)
    if (!isHome) return
    if (item.target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return { isHome, activeKey, navigate }
}
