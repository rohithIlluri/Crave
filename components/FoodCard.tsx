"use client"

import type React from "react"

import { Heart, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import type { FoodListing } from "@/services/firestore"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ContactSellerModal } from "@/components/ContactSellerModal"
import { AuthModal } from "@/components/AuthModal"

interface FoodCardProps {
  item: FoodListing
}

export function FoodCard({ item }: FoodCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      setAuthModalOpen(true)
      return
    }

    if (user.uid === item.producerId) {
      router.push(`/my-listings`)
      return
    }

    setContactModalOpen(true)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      setAuthModalOpen(true)
      return
    }

    setIsFavorited(!isFavorited)
    // TODO: Implement favorites functionality in Firestore
  }

  const handleCardClick = () => {
    router.push(`/food/${item.id}`)
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`
  }

  const getImageUrl = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0]
    }
    return "/placeholder.svg?height=200&width=300&text=No+Image"
  }

  const isOwnListing = user?.uid === item.producerId

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="relative" onClick={handleCardClick}>
          <img
            src={getImageUrl() || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </Button>
          {item.status !== "available" && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              {item.status.toUpperCase()}
            </div>
          )}
          {isOwnListing && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Your Listing
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 cursor-pointer" onClick={handleCardClick}>
              {item.title}
            </h3>
            <p className="text-2xl font-bold text-orange-600">{formatPrice(item.price)}</p>

            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-3 w-3" />
              <span>{item.producerName || "Anonymous Seller"}</span>
            </div>

            {item.location && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
            )}

            <div className="text-xs text-gray-400">
              Quantity: {item.quantity} • {item.category}
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 mt-3"
              onClick={handleContactSeller}
              disabled={item.status !== "available"}
            >
              {isOwnListing ? "View My Listing" : item.status === "available" ? "Contact Seller" : "Not Available"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ContactSellerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        listing={item}
        buyerName={user?.displayName || ""}
        buyerEmail={user?.email || ""}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="signin" />
    </>
  )
}
