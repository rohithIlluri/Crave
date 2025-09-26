"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FoodCard } from "@/components/FoodCard"
import { getFeed, type FoodListing } from "@/services/firestore"
import type { DocumentSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Database, Sparkles, MapPin, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLocation } from "@/contexts/LocationContext"
import { useAsyncOperation } from "@/hooks/useAsync"
import { Loader } from "@/components/ui/loader"

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [connectionError, setConnectionError] = useState(false)

  const { coords, radiusKm, status, requestLocation } = useLocation()
  const router = useRouter()
  const { execute: executeWithLoading } = useAsyncOperation()

  const load = async (reset = false, isLocationChange = false) => {
    try {
      setError(null)
      setConnectionError(false)
      
      if (reset) {
        if (isLocationChange) {
          setIsRefreshing(true)
          // Don't clear listings immediately to prevent flash
        } else {
          setLoading(true)
          setListings([])
          setLastDoc(null)
        }
      } else {
        setLoadingMore(true)
      }

      const result = await executeWithLoading(
        () => getFeed({
          coords: coords || undefined,
          radiusKm,
          categoryFilter,
          lastDoc: reset ? undefined : lastDoc || undefined,
          limitCount: 20,
        }),
        reset ? 'Loading food listings...' : 'Loading more listings...'
      )

      const isMockData = result.listings.some((l) => l.id?.startsWith('mock-'))
      setUsingMockData(isMockData)

      if (isLocationChange) {
        // Smooth transition for location changes
        setListings(result.listings)
      } else {
        setListings((prev) => (reset ? result.listings : [...prev, ...result.listings]))
      }
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (e: any) {
      console.error('Error loading listings:', e)
      
      // Check for specific Firestore connection errors
      if (e.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
          e.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
          e.code === 'unavailable') {
        setConnectionError(true)
        setError('Connection blocked. Please check your ad blocker settings or try refreshing the page.')
      } else if (e.code === 'permission-denied') {
        setError('Permission denied. Please check your authentication status.')
      } else if (e.code === 'unauthenticated') {
        setError('Please sign in to view food listings.')
      } else {
        setError('Unable to load food listings. Please check your internet connection and try again.')
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsRefreshing(false)
    }
  }

  // Handle category changes (immediate reset)
  useEffect(() => {
    load(true, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter])

  // Handle location/radius changes (smooth refresh)
  useEffect(() => {
    // Only refetch if we have data already (not initial load)
    if (listings.length > 0 || coords) {
      load(true, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng, radiusKm])

  const filteredListings = searchTerm
    ? listings.filter(
        (l) =>
          l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : listings

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader 
          size="lg" 
          variant="spinner" 
          text="Loading delicious food listings..." 
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert className={connectionError ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}>
          <AlertCircle className={`h-4 w-4 ${connectionError ? "text-red-600" : "text-orange-600"}`} />
          <AlertDescription className={connectionError ? "text-red-800" : "text-orange-800"}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{error}</p>
                {connectionError && (
                  <p className="text-sm mt-1">
                    This is usually caused by ad blockers. Try disabling your ad blocker or refreshing the page.
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => load(true)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                {connectionError && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2"
                  >
                    Refresh Page
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Location Prompt */}
      {!coords && status !== 'granted' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">Get nearby food listings</p>
            <p className="text-xs text-blue-600">Allow location access to see food near you</p>
          </div>
          <Button size="sm" variant="outline" onClick={requestLocation} className="text-blue-600 border-blue-300">
            Use my location
          </Button>
        </div>
      )}

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
          <p className="text-sm text-orange-800">Updating nearby listings...</p>
        </div>
      )}

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
            <Button 
              onClick={() => router.push('/create-listing')} 
              variant="outline"
              className="bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
            >
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
              <Button onClick={() => load(false)} disabled={loadingMore} variant="outline">
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" variant="spinner" />
                    Loading more...
                  </div>
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
