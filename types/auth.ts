export type UserRole = 'user' | 'admin' | 'moderator'

export interface UserPermissions {
  canAccessAdminPanel: boolean
  canManageDatabase: boolean
  canViewSystemInfo: boolean
  canModerateContent: boolean
  canManageUsers: boolean
}

export interface ExtendedUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  permissions: UserPermissions
  isVerified: boolean
  createdAt: Date
  lastLoginAt: Date
}
