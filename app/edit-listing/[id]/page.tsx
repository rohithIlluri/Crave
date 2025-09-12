"use client"

import { EditListingForm } from "@/components/EditListingForm"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export default function EditListingPage({ params }: { params: { id: string } }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <EditListingForm listingId={params.id} />
        <Toaster />
      </div>
    </AuthProvider>
  )
}
