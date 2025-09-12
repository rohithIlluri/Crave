"use client"

import { useEffect, useState } from "react"
import { FoodCard } from "@/components/FoodCard"
import { getListings, type FoodListing } from "@/services/firestore"
import type { DocumentSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Database, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FoodGridProps {
  categoryFilter?: string
  searchTerm?: string
}

export function FoodGrid({ categoryFilter, searchTerm }: FoodGridProps) {
  const [listings, setListings] = useState<FoodListing[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  const loadListings = async (reset = false) => {
    try {
      setError(null)

      if (reset) {
        setLoading(true)
        setListings([])
        setLastDoc(null)
      } else {
        setLoadingMore(true)
      }

      const result = await getListings(categoryFilter, reset ? undefined : lastDoc || undefined)

      // Check if we're getting mock data (mock data has no lastDoc and specific IDs)
      const isMockData = result.listings.some((listing) => listing.id?.startsWith("mock-"))
      setUsingMockData(isMockData)

      if (reset) {
        setListings(result.listings)
      } else {
        setListings((prev) => [...prev, ...result.listings])
      }

      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Error loading listings:", error)
      setError("Unable to load food listings. Please check your internet connection and try again.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadListings(true)
  }, [categoryFilter])

  // Filter by search term on client side
  const filteredListings = searchTerm
    ? listings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : listings

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
        <p className="text-gray-600">Loading delicious food listings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={() => loadListings(true)} className="ml-2">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Data Source Indicator */}
      {usingMockData ? (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Showing sample data while your database is being set up. Sign in and use the
            developer tools to add real data!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Database className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Live Data:</strong> Showing real listings from your Firestore database.
            {filteredListings.length} items found.
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {filteredListings.length === 0 ? (
        <div className="text-center p-12">
          <div className="text-gray-400 mb-4">
            <Database className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? `No results for "${searchTerm}"` : "No food items found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {usingMockData
              ? "Add some sample data using the developer tools to see listings here."
              : "Be the first to share something delicious with your community!"}
          </p>
          {!searchTerm && (
            <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} variant="outline">
              {usingMockData ? "Add Sample Data" : "Create First Listing"}
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Category Header */}
          {categoryFilter && categoryFilter !== "All" && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold capitalize mb-2">{categoryFilter}</h2>
              <p className="text-gray-600">{filteredListings.length} items available</p>
            </div>
          )}

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !searchTerm && !usingMockData && (
            <div className="flex justify-center mt-8">
              <Button onClick={() => loadListings(false)} disabled={loadingMore} variant="outline">
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load More Listings"
                )}
              </Button>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && !usingMockData && filteredListings.length > 10 && (
            <div className="text-center mt-8 p-4 text-gray-500">
              <p>You've seen all available listings!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
