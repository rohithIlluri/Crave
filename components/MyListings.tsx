"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye, Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserListings, deleteListing, updateListing, type FoodListing } from "@/services/firestore"
import { Navbar } from "@/components/Navbar"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Package } from "lucide-react" // Import the Package component

export function MyListings() {
  const { user, loading: authLoading } = useAuth()
  const [listings, setListings] = useState<FoodListing[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      return
    }

    if (user) {
      fetchListings()
    }
  }, [user, authLoading, router])

  const fetchListings = async () => {
    if (!user) return

    try {
      const userListings = await getUserListings(user.uid)
      setListings(userListings)
    } catch (error) {
      console.error("Error fetching listings:", error)
      toast.error("Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    try {
      await deleteListing(id)
      setListings(listings.filter((listing) => listing.id !== id))
      toast.success("Listing deleted successfully")
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast.error("Failed to delete listing")
    }
  }

  const handleMarkAsSold = async (id: string) => {
    try {
      await updateListing(id, { status: "sold" })
      setListings(listings.map((listing) => (listing.id === id ? { ...listing, status: "sold" } : listing)))
      toast.success("Listing marked as sold")
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error("Failed to update listing")
    }
  }

  const handleMarkAsAvailable = async (id: string) => {
    try {
      await updateListing(id, { status: "available" })
      setListings(listings.map((listing) => (listing.id === id ? { ...listing, status: "available" } : listing)))
      toast.success("Listing marked as available")
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error("Failed to update listing")
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-gray-600 mt-2">Manage your food listings</p>
          </div>
          <Button onClick={() => router.push("/create-listing")} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Package className="h-16 w-16 mx-auto" /> {/* Use the Package component */}
              </div>
              <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Start sharing your delicious homemade food with your community!</p>
              <Button onClick={() => router.push("/create-listing")} className="bg-orange-600 hover:bg-orange-700">
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={listing.imageUrls?.[0] || "/placeholder.svg?height=200&width=300&text=No+Image"}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/food/${listing.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/edit-listing/${listing.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {listing.status === "available" ? (
                          <DropdownMenuItem onClick={() => handleMarkAsSold(listing.id!)}>
                            Mark as Sold
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleMarkAsAvailable(listing.id!)}>
                            Mark as Available
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteListing(listing.id!)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant={listing.status === "available" ? "default" : "secondary"}>{listing.status}</Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                    <p className="text-2xl font-bold text-orange-600">{formatPrice(listing.price)}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>

                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                      <span>Quantity: {listing.quantity}</span>
                      <span>{formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
