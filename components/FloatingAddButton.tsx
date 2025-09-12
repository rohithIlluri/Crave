"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthModal } from "./AuthModal"

export function FloatingAddButton() {
  const { user } = useAuth()
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleClick = () => {
    if (user) {
      router.push("/create-listing")
    } else {
      setAuthModalOpen(true)
    }
  }

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg z-40"
        onClick={handleClick}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="signup" />
    </>
  )
}
