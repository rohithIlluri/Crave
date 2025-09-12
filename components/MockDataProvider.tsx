"use client"

import type React from "react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

const mockListings = [
  {
    title: "Homemade Chocolate Chip Cookies",
    description: "Fresh baked chocolate chip cookies made with organic ingredients. Perfect for any occasion!",
    price: 15,
    quantity: 24,
    category: "dessert",
    imageUrls: [],
    location: "Downtown Area",
    pickupDetails: "Available for pickup weekdays after 5pm",
    status: "available" as const,
  },
  {
    title: "Authentic Italian Lasagna",
    description: "Traditional family recipe lasagna, serves 4-6 people. Made with fresh ingredients.",
    price: 25,
    quantity: 1,
    category: "meal",
    imageUrls: [],
    location: "North Side",
    pickupDetails: "Best served fresh, pickup within 2 hours",
    status: "available" as const,
  },
  {
    title: "Fresh Banana Bread",
    description: "Moist banana bread made with ripe bananas and walnuts. No preservatives.",
    price: 12,
    quantity: 1,
    category: "baked goods",
    imageUrls: [],
    location: "Central Park Area",
    pickupDetails: "Available all day, contact for pickup time",
    status: "available" as const,
  },
]

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const createMockData = async () => {
    if (!user) return

    try {
      const now = Timestamp.now()

      for (const listing of mockListings) {
        await addDoc(collection(db, "listings"), {
          ...listing,
          producerId: user.uid,
          producerName: user.displayName || "Test User",
          producerPhotoURL: user.photoURL || "",
          createdAt: now,
          updatedAt: now,
        })
      }

      console.log("Mock data created successfully")
    } catch (error) {
      console.error("Error creating mock data:", error)
    }
  }

  // Uncomment the line below to create mock data when a user signs in
  // useEffect(() => {
  //   if (user) {
  //     createMockData()
  //   }
  // }, [user])

  return <>{children}</>
}
