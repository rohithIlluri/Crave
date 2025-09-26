"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { FoodGrid } from "@/components/FoodGrid"
import { SearchBar } from "@/components/SearchBar"
import { CategoryFilter } from "@/components/CategoryFilter"
import { FloatingAddButton } from "@/components/FloatingAddButton"
import { AuthProvider } from "@/contexts/AuthContext"
import { MockDataProvider } from "@/components/MockDataProvider"
import { LocationProvider } from "@/contexts/LocationContext"
import { Toaster } from "sonner"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
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
        <LocationProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pb-20">
              <div className="sticky top-16 z-40 bg-white border-b border-gray-200 p-4">
                <SearchBar onSearch={setSearchTerm} />
                <CategoryFilter onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} />
              </div>

              <FoodGrid categoryFilter={selectedCategory} searchTerm={searchTerm} />
            </main>
            <FloatingAddButton />
            <Toaster />
          </div>
        </LocationProvider>
      </MockDataProvider>
    </AuthProvider>
  )
}
