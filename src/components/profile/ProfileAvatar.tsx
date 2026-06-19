interface ProfileAvatarProps {
  avatarUrl: string | null
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-xl',
}

export default function ProfileAvatar({
  avatarUrl,
  initials,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const sizeClass = sizeMap[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Profile"
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 font-semibold text-white ${className}`}
    >
      {initials}
    </div>
  )
}
