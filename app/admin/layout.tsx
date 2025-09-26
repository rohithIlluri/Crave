"use client"

import { AdminNavbar } from '@/components/AdminNavbar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
