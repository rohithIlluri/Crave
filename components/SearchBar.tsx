"use client"

import type React from "react"

import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SearchBarProps {
  onSearch?: (searchTerm: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchTerm)
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search for homemade food..."
          className="pl-10 pr-4 py-3 rounded-full border-gray-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>Within 5 miles of your location</span>
        <Button variant="link" className="p-0 h-auto text-orange-600 text-sm">
          Change
        </Button>
      </div>
    </div>
  )
}
