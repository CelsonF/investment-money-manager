import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Currency } from '../types'
import { type Locale, type TranslationKey, LOCALES, translations } from '../i18n/translations'

const DEFAULT_LOCALE: Locale = 'pt-BR'
const DEFAULT_RATE = 5.8

// Cached formatters per locale — avoids recreating on every call
const moneyFmts = new Map<Locale, Intl.NumberFormat>()
const dateFmts = new Map<Locale, Intl.DateTimeFormat>()

function moneyFmt(locale: Locale) {
  if (!moneyFmts.has(locale)) {
    moneyFmts.set(
      locale,
      new Intl.NumberFormat(locale, { style: 'currency', currency: LOCALES[locale].currency }),
    )
  }
  return moneyFmts.get(locale)!
}

function dateFmt(locale: Locale) {
  if (!dateFmts.has(locale)) {
    dateFmts.set(
      locale,
      new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }),
    )
  }
  return dateFmts.get(locale)!
}

interface LocaleState {
  locale: Locale
  exchangeRate: number
  displayCurrency: Currency
  setLocale: (l: Locale) => void
  setExchangeRate: (rate: number) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
  money: (n: number | string | null | undefined) => string
  formatDate: (iso: string) => string
  convertToDisplay: (amount: number, from: Currency) => number
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      exchangeRate: DEFAULT_RATE,
      displayCurrency: 'BRL' as Currency,

      setLocale: (l) => set({ locale: l, displayCurrency: l === 'pt-BR' ? 'BRL' : 'USD' }),

      setExchangeRate: (rate) => set({ exchangeRate: rate }),

      t: (key, vars) => {
        let str = translations[get().locale][key] ?? key
        if (vars) {
          for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v))
        }
        return str
      },

      money: (n) => moneyFmt(get().locale).format(Number(n) || 0),

      formatDate: (iso) => dateFmt(get().locale).format(new Date(iso)),

      convertToDisplay: (amount, from) => {
        const { exchangeRate, displayCurrency } = get()
        if (from === displayCurrency) return amount
        if (from === 'USD' && displayCurrency === 'BRL') return amount * exchangeRate
        if (from === 'BRL' && displayCurrency === 'USD') return amount / exchangeRate
        return amount
      },
    }),
    {
      name: 'wealthmind-locale',
      storage: createJSONStorage(() => localStorage),
      // Only persist primitive values — functions are rebuilt from store definition
      partialize: (s) => ({ locale: s.locale, exchangeRate: s.exchangeRate }),
      onRehydrateStorage: () => (state) => {
        // Keep displayCurrency in sync after localStorage rehydration
        if (state) state.displayCurrency = state.locale === 'pt-BR' ? 'BRL' : 'USD'
      },
    },
  ),
)
