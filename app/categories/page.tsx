"use client"

import { Categories } from "@/components/Categories"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function CategoriesPage() {
  return (
    <AuthProvider>
      <Categories />
      <Toaster />
    </AuthProvider>
  )
}
