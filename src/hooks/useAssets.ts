import { useCallback, useEffect, useState } from 'react'
import type { Asset } from '../types'
import { getAssets, saveAssets } from '../server/portfolio'

export function useAssets() {
  const [assets, setAssets] = useState<Array<Asset>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAssets()
      .then((data) => {
        if (active) setAssets(data)
      })
      .catch((e) => console.error('Failed to load portfolio', e))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Recebe um updater fn para evitar closure stale sobre "assets"
  const persist = useCallback((updater: (prev: Array<Asset>) => Array<Asset>) => {
    setAssets((prev) => {
      const next = updater(prev)
      saveAssets({ data: next }).catch((e) =>
        console.error('Failed to save portfolio', e),
      )
      return next
    })
  }, []) // dep array vazio → referência estável para sempre

  const add = useCallback(
    (item: Asset) => persist((prev) => [...prev, item]),
    [persist],
  )

  const remove = useCallback(
    (id: string) => persist((prev) => prev.filter((a) => a.id !== id)),
    [persist],
  )

  const replace = useCallback(
    (list: Array<Asset>) => persist(() => list),
    [persist],
  )

  return { assets, loading, add, remove, replace }
}
