import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, Check, Loader2, RefreshCw, Save } from 'lucide-react'
import { cn } from '../lib/cn'
import Sidebar from '../components/layout/Sidebar'
import ProfileAvatar from '../components/profile/ProfileAvatar'
import ProfileCard from '../components/profile/ProfileCard'
import { useProfileStore } from '../store/profileStore'
import { useLocaleStore } from '../store/localeStore'
import { type Locale, LOCALES } from '../i18n/translations'
import { fetchExchangeRate } from '../server/portfolio'
import { toast } from '../store/toastStore'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

const inputBase =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-stone-500 outline-none transition-colors'
const labelCls = 'mb-1.5 block text-xs font-medium text-stone-400'

interface SaveButtonProps {
  onClick: () => void
  saving: boolean
  saved: boolean
  disabled: boolean
  label: string
  savedLabel: string
}

function SaveButton({ onClick, saving, saved, disabled, label, savedLabel }: SaveButtonProps) {
  const icon = saving ? (
    <Loader2 size={16} className="animate-spin" />
  ) : saved ? (
    <Check size={16} />
  ) : (
    <Save size={16} />
  )

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {saved ? savedLabel : label}
    </button>
  )
}

function SettingsPage() {
  const { profile, loading, save } = useProfileStore()
  const { t, locale, setLocale, exchangeRate, setExchangeRate, formatDate } = useLocaleStore()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Exchange rate state
  const [rateInput, setRateInput] = useState(String(exchangeRate))
  const [fetchingRate, setFetchingRate] = useState(false)
  const [rateUpdatedAt, setRateUpdatedAt] = useState<string | null>(null)
  const [rateError, setRateError] = useState('')

  // Sync rateInput when exchangeRate changes externally
  useEffect(() => { setRateInput(String(exchangeRate)) }, [exchangeRate])

  const handleSaveRate = () => {
    const r = parseFloat(rateInput.replace(',', '.'))
    if (r > 0) setExchangeRate(r)
  }

  const handleFetchRate = async () => {
    setFetchingRate(true)
    setRateError('')
    try {
      const result = await fetchExchangeRate()
      if (result.rate) {
        setExchangeRate(result.rate)
        setRateInput(result.rate.toFixed(4))
        if (result.updatedAt) setRateUpdatedAt(result.updatedAt)
      } else {
        setRateError(t('fx.error'))
      }
    } catch {
      setRateError(t('fx.error'))
    } finally {
      setFetchingRate(false)
    }
  }

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setAvatar(profile.avatarUrl)
    }
  }, [profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await save({ name: trimmed, avatarUrl: avatar })
      setSaved(true)
      toast.success('Perfil salvo')
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error('Failed to save profile', e)
      toast.error('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex min-h-screen bg-[var(--c-bg)] text-[var(--c-text-2)]">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-96 w-[40rem] rounded-full bg-violet-600/15 blur-[140px]" />

      <Sidebar />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {t('settings.title')}
            </h1>
            <p className="text-sm text-stone-500">{t('settings.subtitle')}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" />
          </div>
        ) : profile ? (
          <div className="flex max-w-xl flex-col gap-5">
            <ProfileCard profile={{ ...profile, name, avatarUrl: avatar }} />

            {/* Profile edit */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-5 text-base font-semibold text-white">
                {t('settings.editProfile')}
              </h2>

              {/* Avatar upload */}
              <div className="mb-6 flex items-center gap-5">
                <div className="relative">
                  <ProfileAvatar
                    avatarUrl={avatar}
                    initials={profile.initials}
                    size="xl"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#1a1a2e] text-stone-300 transition-colors hover:bg-violet-600 hover:text-white"
                    title={t('settings.uploadPhoto')}
                  >
                    <Camera size={13} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t('settings.photo')}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{t('settings.photoHint')}</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs text-violet-400 underline-offset-2 hover:underline"
                  >
                    {t('settings.uploadPhoto')}
                  </button>
                  {avatar && (
                    <button
                      onClick={() => setAvatar(null)}
                      className="ml-3 mt-2 text-xs text-rose-400 underline-offset-2 hover:underline"
                    >
                      {t('settings.removePhoto')}
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelCls}>{t('settings.name')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settings.name')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className={cn(
                    inputBase,
                    'focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20',
                  )}
                />
              </div>

              <div className="mb-4">
                <label className={labelCls}>{t('settings.email')}</label>
                <input
                  value={profile.email}
                  readOnly
                  className={cn(inputBase, 'cursor-not-allowed opacity-50')}
                />
              </div>

              <div className="mb-6">
                <label className={labelCls}>{t('settings.role')}</label>
                <input
                  value={profile.role}
                  readOnly
                  className={cn(inputBase, 'cursor-not-allowed capitalize opacity-50')}
                />
              </div>

              <SaveButton
                onClick={handleSave}
                saving={saving}
                saved={saved}
                disabled={saving || !name.trim()}
                label={t('settings.save')}
                savedLabel={t('settings.saved')}
              />
            </div>

            {/* Language & Region */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-1 text-base font-semibold text-white">
                {t('settings.language')}
              </h2>
              <p className="mb-5 text-sm text-stone-500">
                {t('settings.languageSubtitle')}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(Object.entries(LOCALES) as Array<[Locale, (typeof LOCALES)[Locale]]>).map(
                  ([code, info]) => {
                    const active = locale === code
                    return (
                      <button
                        key={code}
                        onClick={() => setLocale(code)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all',
                          active
                            ? 'border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]',
                        )}
                      >
                        <span className="text-2xl leading-none">{info.flag}</span>
                        <div className="flex-1">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              active ? 'text-violet-300' : 'text-stone-200',
                            )}
                          >
                            {info.label}
                          </p>
                          <p className="text-xs text-stone-500">{info.currency}</p>
                        </div>
                        <div
                          className={cn(
                            'h-4 w-4 shrink-0 rounded-full border-2',
                            active
                              ? 'border-violet-400 bg-violet-400'
                              : 'border-stone-600 bg-transparent',
                          )}
                        />
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            {/* Exchange rate */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-1 text-base font-semibold text-white">
                {t('fx.title')}
              </h2>
              <p className="mb-5 text-sm text-stone-500">{t('fx.subtitle')}</p>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={labelCls}>{t('fx.label')}</label>
                  <input
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRate()}
                    inputMode="decimal"
                    placeholder="5.8000"
                    className={cn(
                      inputBase,
                      'focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20',
                    )}
                  />
                </div>
                <button
                  onClick={handleSaveRate}
                  className="flex h-[46px] items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
                >
                  <Save size={14} />
                  {t('fx.save')}
                </button>
              </div>

              <button
                onClick={handleFetchRate}
                disabled={fetchingRate}
                className="mt-3 flex items-center gap-2 text-sm text-violet-400 underline-offset-2 transition-colors hover:text-violet-300 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={14} className={fetchingRate ? 'animate-spin' : ''} />
                {fetchingRate ? t('fx.fetching') : t('fx.fetch')}
              </button>

              {rateUpdatedAt && !rateError && (
                <p className="mt-2 text-xs text-stone-600">
                  {t('fx.updatedAt', { date: formatDate(rateUpdatedAt) })}
                </p>
              )}
              {rateError && (
                <p className="mt-2 text-xs text-rose-400">{rateError}</p>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
