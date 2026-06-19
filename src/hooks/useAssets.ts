import { useCallback, useEffect, useState } from 'react'
import type { Asset } from '../types'

const STORAGE_KEY = 'assets'

/**
 * Portfolio state persisted to localStorage.
 *
 * The read happens inside an effect (client only), which keeps the hook
 * SSR-safe — during server rendering the portfolio starts empty and `loading`
 * stays `true` until hydration in the browser.
 */
export function useAssets() {
  const [assets, setAssets] = useState<Array<Asset>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setAssets(JSON.parse(raw) as Array<Asset>)
    } catch (e) {
      console.error('Failed to load portfolio', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const persist = useCallback((list: Array<Asset>) => {
    setAssets(list)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error('Failed to save portfolio', e)
    }
  }, [])

  const add = useCallback(
    (item: Asset) => persist([...assets, item]),
    [assets, persist],
  )

  const remove = useCallback(
    (id: string) => persist(assets.filter((a) => a.id !== id)),
    [assets, persist],
  )

  const replace = useCallback(
    (list: Array<Asset>) => persist(list),
    [persist],
  )

  return { assets, loading, add, remove, replace }
}
