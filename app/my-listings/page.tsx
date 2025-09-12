"use client"

import { MyListings } from "@/components/MyListings"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function MyListingsPage() {
  return (
    <AuthProvider>
      <MyListings />
      <Toaster />
    </AuthProvider>
  )
}
