"use client"

import { CreateListingForm } from "@/components/CreateListingForm"
import { Navbar } from "@/components/Navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { Toaster } from "sonner"

export default function CreateListingPage() {
  return (
    <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <CreateListingForm />
          </main>
          <Toaster />
        </div>
      </LocationProvider>
    </AuthProvider>
  )
}
