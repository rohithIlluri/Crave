import { UserRole, UserPermissions } from '@/types/auth'

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  user: {
    canAccessAdminPanel: false,
    canManageDatabase: false,
    canViewSystemInfo: false,
    canModerateContent: false,
    canManageUsers: false,
  },
  moderator: {
    canAccessAdminPanel: true,
    canManageDatabase: false,
    canViewSystemInfo: true,
    canModerateContent: true,
    canManageUsers: false,
  },
  admin: {
    canAccessAdminPanel: true,
    canManageDatabase: true,
    canViewSystemInfo: true,
    canModerateContent: true,
    canManageUsers: true,
  },
}

export const checkPermission = (userRole: UserRole, permission: keyof UserPermissions): boolean => {
  return DEFAULT_PERMISSIONS[userRole][permission]
}
