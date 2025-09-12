"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Calendar, Package, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserListings, type FoodListing } from "@/services/firestore"
import { Navbar } from "@/components/Navbar"
import { FoodCard } from "@/components/FoodCard"
import { Loader2 } from "lucide-react"

export function UserProfile() {
  const { user, loading: authLoading } = useAuth()
  const [userListings, setUserListings] = useState<FoodListing[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      return
    }

    if (user) {
      fetchUserListings()
    }
  }, [user, authLoading, router])

  const fetchUserListings = async () => {
    if (!user) return

    try {
      const listings = await getUserListings(user.uid)
      setUserListings(listings)
    } catch (error) {
      console.error("Error fetching user listings:", error)
    } finally {
      setLoading(false)
    }
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

  const availableListings = userListings.filter((listing) => listing.status === "available")
  const soldListings = userListings.filter((listing) => listing.status === "sold")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback className="text-2xl">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-2">{user.displayName || "Anonymous User"}</h1>
                <p className="text-gray-600 mb-4">{user.email}</p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.metadata.creationTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{userListings.length} listings</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{availableListings.length}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{soldListings.length}</div>
              <div className="text-sm text-gray-600">Items Sold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">4.8</div>
              <div className="text-sm text-gray-600">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Listings ({availableListings.length})</TabsTrigger>
            <TabsTrigger value="sold">Sold Items ({soldListings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {availableListings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">You don't have any active listings yet.</p>
                  <Button onClick={() => router.push("/create-listing")} className="bg-orange-600 hover:bg-orange-700">
                    Create Your First Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableListings.map((listing) => (
                  <FoodCard key={listing.id} item={listing} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sold" className="mt-6">
            {soldListings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No sold items yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldListings.map((listing) => (
                  <FoodCard key={listing.id} item={listing} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
