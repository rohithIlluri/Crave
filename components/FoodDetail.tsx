"use client"

import { ArrowLeft, Heart, Star, MapPin, Clock, Users, MessageCircle, Phone, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getListing, type FoodListing } from "@/services/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/Navbar"
import { AuthModal } from "@/components/AuthModal"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface FoodDetailProps {
  id: string
}

export function FoodDetail({ id }: FoodDetailProps) {
  const [listing, setListing] = useState<FoodListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListing(id)
        setListing(data)
      } catch (error) {
        console.error("Error fetching listing:", error)
        toast.error("Failed to load listing")
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id])

  const handleContactSeller = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    if (!listing) return

    // Create a mailto link or navigate to messaging
    const subject = `Interested in: ${listing.title}`
    const body = `Hi ${listing.producerName},\n\nI'm interested in your ${listing.title}. Is it still available?\n\nThanks!`
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    window.open(mailtoLink, "_blank")
    toast.success("Opening email client...")
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: url,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
      } catch (error) {
        toast.error("Failed to copy link")
      }
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center p-8">
          <p className="text-gray-500">Listing not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    )
  }

  const images =
    listing.imageUrls && listing.imageUrls.length > 0
      ? listing.imageUrls
      : ["/placeholder.svg?height=400&width=600&text=No+Image"]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <img
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-64 sm:h-80 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=400&width=600&text=No+Image"
          }}
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        {listing.status !== "available" && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded text-sm font-medium">
            {listing.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 bg-white">
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  currentImageIndex === index ? "border-orange-500" : "border-gray-200"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${listing.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 space-y-6 pb-24">
        {/* Title and Price */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-orange-600">{formatPrice(listing.price)}</p>
            <Badge variant={listing.status === "available" ? "default" : "secondary"}>{listing.status}</Badge>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Quantity: {listing.quantity}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Posted: {formatDate(listing.createdAt)}</span>
          </div>
          {listing.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 col-span-2">
              <MapPin className="h-4 w-4" />
              <span>{listing.location}</span>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 capitalize">
            {listing.category}
          </Badge>
        </div>

        {/* Description */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </CardContent>
        </Card>

        {/* Pickup Details */}
        {listing.pickupDetails && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Pickup Details</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.pickupDetails}</p>
            </CardContent>
          </Card>
        )}

        {/* Seller Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Seller</h3>
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={listing.producerPhotoURL || "/placeholder.svg"} />
                <AvatarFallback>{listing.producerName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{listing.producerName || "Anonymous Seller"}</h4>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>New Seller</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      {listing.status === "available" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleContactSeller}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Seller
            </Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleContactSeller}>
              <Phone className="h-4 w-4 mr-2" />
              Contact Seller
            </Button>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="signin" />
    </div>
  )
}
