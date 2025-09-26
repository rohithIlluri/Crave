"use client"

import { useAuth } from '@/contexts/AuthContext'
import { UserPermissions } from '@/types/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePermission?: keyof UserPermissions
  requireAdmin?: boolean
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requirePermission, 
  requireAdmin = false,
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(fallbackPath)
      return
    }

    if (!loading && user) {
      if (requireAdmin && !isAdmin) {
        router.push(fallbackPath)
        return
      }

      if (requirePermission && !hasPermission(requirePermission)) {
        router.push(fallbackPath)
        return
      }
    }
  }, [user, loading, requirePermission, requireAdmin, fallbackPath, router, hasPermission, isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasAccess = requireAdmin ? isAdmin : 
                   requirePermission ? hasPermission(requirePermission) : true

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
