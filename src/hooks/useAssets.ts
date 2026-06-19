import { useCallback, useEffect, useState } from 'react'
import type { Asset } from '../types'
import { getAssets, saveAssets } from '../server/portfolio'

/**
 * Portfolio state backed by a local JSON database (`data/portfolio.json`),
 * read/written through TanStack Start server functions.
 *
 * The initial load runs inside an effect (client only), so the hook stays
 * SSR-safe — during server rendering the portfolio starts empty and `loading`
 * stays `true` until the data is fetched in the browser.
 */
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

  const persist = useCallback((list: Array<Asset>) => {
    setAssets(list)
    saveAssets({ data: list }).catch((e) =>
      console.error('Failed to save portfolio', e),
    )
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
