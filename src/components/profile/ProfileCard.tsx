import type { Profile } from '../../types'
import ProfileAvatar from './ProfileAvatar'

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-violet-500/15 text-violet-300',
  manager: 'bg-blue-500/15 text-blue-300',
  viewer: 'bg-stone-500/15 text-stone-400',
}

interface ProfileCardProps {
  profile: Profile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <ProfileAvatar
        avatarUrl={profile.avatarUrl}
        initials={profile.initials}
        size="lg"
      />
      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-white">
          {profile.name}
        </div>
        <div className="truncate text-sm text-stone-500">{profile.email}</div>
        <span
          className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeColor[profile.role] ?? roleBadgeColor.viewer}`}
        >
          {profile.role}
        </span>
      </div>
    </div>
  )
}
