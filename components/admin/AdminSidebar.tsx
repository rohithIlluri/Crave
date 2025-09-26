"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Home, 
  Database, 
  Settings, 
  Users, 
  Activity,
  Shield
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

const adminMenuItems = [
  { 
    label: 'Dashboard', 
    path: '/admin', 
    icon: Home,
    permission: 'canAccessAdminPanel' 
  },
  { 
    label: 'Database Tools', 
    path: '/admin/database', 
    icon: Database,
    permission: 'canManageDatabase' 
  },
  { 
    label: 'System Info', 
    path: '/admin/system', 
    icon: Settings,
    permission: 'canViewSystemInfo' 
  },
  { 
    label: 'User Management', 
    path: '/admin/users', 
    icon: Users,
    permission: 'canManageUsers' 
  },
  { 
    label: 'Content Moderation', 
    path: '/admin/moderation', 
    icon: Shield,
    permission: 'canModerateContent' 
  },
  { 
    label: 'Activity Logs', 
    path: '/admin/logs', 
    icon: Activity,
    permission: 'canViewSystemInfo' 
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { hasPermission } = usePermissions()

  const filteredItems = adminMenuItems.filter(item => 
    hasPermission(item.permission as any)
  )

  return (
    <Card className="w-64 h-[calc(100vh-4rem)] m-4 p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Admin Panel</h2>
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push(item.path)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </div>
    </Card>
  )
}
