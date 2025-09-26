"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Database, Settings } from "lucide-react"
import Link from "next/link"

export function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-orange-600">FoodShare</span>
            </Link>
            <span className="ml-4 text-sm text-gray-500">Admin Panel</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/admin" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                Dashboard
              </Link>
              <Link href="/admin/database" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                Database
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
