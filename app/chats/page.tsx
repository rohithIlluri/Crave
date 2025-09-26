"use client"

import { EnhancedChats } from "@/components/EnhancedChats"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function ChatsPage() {
  return (
    <AuthProvider>
      <EnhancedChats />
      <Toaster />
    </AuthProvider>
  )
}
