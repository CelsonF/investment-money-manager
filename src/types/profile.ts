export type UserRole = 'admin' | 'manager' | 'viewer'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  initials: string
  createdAt: string
}
