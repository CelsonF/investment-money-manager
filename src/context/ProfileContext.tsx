import { createContext, useContext, type ReactNode } from 'react'
import { useProfile } from '../hooks/useProfile'

type ProfileContextValue = ReturnType<typeof useProfile>

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfile()
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfileCtx(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfileCtx must be used inside ProfileProvider')
  return ctx
}
