import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, Check, Loader2, Save } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import ProfileAvatar from '../components/profile/ProfileAvatar'
import ProfileCard from '../components/profile/ProfileCard'
import { useProfile } from '../hooks/useProfile'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-stone-500 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'
const labelCls = 'mb-1.5 block text-xs font-medium text-stone-400'

function SettingsPage() {
  const { profile, loading, save } = useProfile()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    await save({ name: trimmed, avatarUrl: avatar })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="relative flex min-h-screen bg-[#0a0a12] text-stone-200">
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
              Profile Settings
            </h1>
            <p className="text-sm text-stone-500">
              Manage your account information.
            </p>
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

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-5 text-base font-semibold text-white">
                Edit Profile
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
                    title="Change photo"
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
                  <p className="text-sm font-medium text-white">
                    Profile photo
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    JPG, PNG or GIF up to 2 MB
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs text-violet-400 underline-offset-2 hover:underline"
                  >
                    Upload photo
                  </button>
                  {avatar && (
                    <button
                      onClick={() => setAvatar(null)}
                      className="ml-3 mt-2 text-xs text-rose-400 underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name field */}
              <div className="mb-4">
                <label className={labelCls}>Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              {/* Email (read-only) */}
              <div className="mb-4">
                <label className={labelCls}>Email</label>
                <input
                  value={profile.email}
                  readOnly
                  className={`${inputCls} cursor-not-allowed opacity-50`}
                />
              </div>

              {/* Role (read-only) */}
              <div className="mb-6">
                <label className={labelCls}>Role</label>
                <input
                  value={profile.role}
                  readOnly
                  className={`${inputCls} cursor-not-allowed capitalize opacity-50`}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
