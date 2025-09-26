"use client"

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FirebaseTest } from '@/components/FirebaseTest'
import { DatabaseSeeder } from '@/components/DatabaseSeeder'
import { DebugInfo } from '@/components/DebugInfo'

export default function DatabaseToolsPage() {
  return (
    <ProtectedRoute requirePermission="canManageDatabase">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-gray-600">Tools for managing your Firebase database</p>
        </div>

        <div className="space-y-6">
          <DebugInfo />
          <FirebaseTest />
          <DatabaseSeeder />
        </div>
      </div>
    </ProtectedRoute>
  )
}
