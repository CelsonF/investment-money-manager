import { create } from 'zustand'
import type { Profile } from '../types'
import { getProfile, updateProfile } from '../server/portfolio'
import { toast } from './toastStore'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  load: () => Promise<void>
  save: (updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => Promise<Profile | null>
}

// Module-level flag prevents double-fetching if multiple components call load()
let _fetched = false

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: null,
  loading: false,

  load: async () => {
    if (_fetched) return
    _fetched = true
    set({ loading: true })
    try {
      const data = await getProfile()
      set({ profile: data, loading: false })
    } catch (e) {
      console.error('Failed to load profile', e)
      _fetched = false
      toast.error('Erro ao carregar perfil')
      set({ loading: false })
    }
  },

  save: async (updates) => {
    const { profile } = get()
    if (!profile) return null
    const previous = profile
    const updated: Profile = { ...profile, ...updates }
    if (updates.name) {
      const parts = updates.name.trim().split(/\s+/)
      updated.initials =
        parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : updates.name[0].toUpperCase()
    }
    set({ profile: updated })
    try {
      await updateProfile({ data: updated })
    } catch (e) {
      set({ profile: previous })
      throw e
    }
    return updated
  },
}))
