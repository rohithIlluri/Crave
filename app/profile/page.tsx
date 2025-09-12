"use client"

import { UserProfile } from "@/components/UserProfile"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function ProfilePage() {
  return (
    <AuthProvider>
      <UserProfile />
      <Toaster />
    </AuthProvider>
  )
}
