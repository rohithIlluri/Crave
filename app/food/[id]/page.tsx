"use client"

import { FoodDetail } from "@/components/FoodDetail"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function FoodDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthProvider>
      <FoodDetail id={params.id} />
      <Toaster />
    </AuthProvider>
  )
}
