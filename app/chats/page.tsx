"use client"

import { Chats } from "@/components/Chats"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function ChatsPage() {
  return (
    <AuthProvider>
      <Chats />
      <Toaster />
    </AuthProvider>
  )
}
