import { useCallback, useEffect, useState } from 'react'
import type { Profile } from '../types'
import { getProfile, updateProfile } from '../server/portfolio'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProfile()
      .then((data) => {
        if (active) setProfile(data)
      })
      .catch((e) => console.error('Failed to load profile', e))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const save = useCallback(
    async (updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => {
      if (!profile) return null
      const updated: Profile = { ...profile, ...updates }
      if (updates.name) {
        const parts = updates.name.trim().split(/\s+/)
        updated.initials =
          parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : updates.name[0].toUpperCase()
      }
      setProfile(updated)
      await updateProfile({ data: updated })
      return updated
    },
    [profile],
  )

  return { profile, loading, save }
}
