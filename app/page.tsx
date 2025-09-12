"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { FoodGrid } from "@/components/FoodGrid"
import { SearchBar } from "@/components/SearchBar"
import { CategoryFilter } from "@/components/CategoryFilter"
import { FloatingAddButton } from "@/components/FloatingAddButton"
import { FirebaseTest } from "@/components/FirebaseTest"
import { DatabaseSeeder } from "@/components/DatabaseSeeder"
import { AuthProvider } from "@/contexts/AuthContext"
import { MockDataProvider } from "@/components/MockDataProvider"
import { Toaster } from "sonner"
import { DebugInfo } from "@/components/DebugInfo"
import { Button } from "@/components/ui/button"
import { Settings, X } from "lucide-react"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [showDevTools, setShowDevTools] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  return (
    <AuthProvider>
      <MockDataProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          {/* Developer Tools Toggle */}
          <div className="fixed top-20 right-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDevTools(!showDevTools)}
              className="bg-white shadow-lg"
            >
              {showDevTools ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </Button>
          </div>

          <main className="pb-20">
            <div className="sticky top-16 z-40 bg-white border-b border-gray-200 p-4">
              <SearchBar onSearch={setSearchTerm} />
              <CategoryFilter onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} />
            </div>

            {/* Developer Tools Panel */}
            {showDevTools && (
              <div className="p-4 bg-gray-100 border-b">
                <div className="max-w-4xl mx-auto space-y-4">
                  <h2 className="text-lg font-semibold mb-4">🛠️ Developer Tools</h2>

                  {/* Firebase Connection Test */}
                  <FirebaseTest />

                  {/* Database Seeder */}
                  <DatabaseSeeder />

                  {/* Debug Info */}
                  <DebugInfo />
                </div>
              </div>
            )}

            <FoodGrid categoryFilter={selectedCategory} searchTerm={searchTerm} />
          </main>
          <FloatingAddButton />
          <Toaster />
        </div>
      </MockDataProvider>
    </AuthProvider>
  )
}
