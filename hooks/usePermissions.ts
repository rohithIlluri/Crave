import { useAuth } from '@/contexts/AuthContext'
import { UserPermissions } from '@/types/auth'

export function usePermissions() {
  const { user, hasPermission, isAdmin, isModerator } = useAuth()
  
  return {
    user,
    hasPermission,
    isAdmin,
    isModerator,
    canAccessAdminPanel: hasPermission('canAccessAdminPanel'),
    canManageDatabase: hasPermission('canManageDatabase'),
    canViewSystemInfo: hasPermission('canViewSystemInfo'),
    canModerateContent: hasPermission('canModerateContent'),
    canManageUsers: hasPermission('canManageUsers'),
  }
}
