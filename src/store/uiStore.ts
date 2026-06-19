import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface UIState {
  mobileNavOpen: boolean
  toggleMobileNav: () => void
  closeMobileNav: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  theme: Theme
  toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mobileNavOpen: false,
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      closeMobileNav: () => set({ mobileNavOpen: false }),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.setAttribute('data-theme', next)
          return { theme: next }
        }),
    }),
    {
      name: 'wealthmind-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
)
