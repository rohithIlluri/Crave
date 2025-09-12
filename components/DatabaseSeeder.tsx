"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Database, Loader2, AlertTriangle, Trash2 } from "lucide-react"
import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const sampleListings = [
  {
    title: "Grandma's Famous Chocolate Chip Cookies",
    description:
      "Made with love using a 50-year-old family recipe. These cookies are soft, chewy, and loaded with premium chocolate chips. Perfect for any occasion or just a sweet treat!",
    price: 15,
    quantity: 24,
    category: "dessert",
    imageUrls: ["/chocolate-chip-cookies.png", "/close-up-chocolate-chip-cookies.png"],
    location: "Downtown Brooklyn",
    pickupDetails:
      "Available for pickup weekdays after 5pm and weekends 10am-6pm. Please message 30 minutes before pickup.",
    status: "available" as const,
  },
  {
    title: "Authentic Italian Lasagna",
    description:
      "Traditional family recipe passed down through generations. Made with fresh pasta, homemade marinara sauce, ricotta, mozzarella, and ground beef. Serves 6-8 people.",
    price: 35,
    quantity: 1,
    category: "meal",
    imageUrls: ["/homemade-lasagna.png"],
    location: "Little Italy, Manhattan",
    pickupDetails: "Best served fresh within 2 hours of pickup. Can be reheated. Available Tuesday-Sunday.",
    status: "available" as const,
  },
  {
    title: "Fresh Banana Bread Loaf",
    description:
      "Moist and delicious banana bread made with overripe bananas, walnuts, and a hint of cinnamon. No preservatives or artificial ingredients.",
    price: 12,
    quantity: 2,
    category: "baked goods",
    imageUrls: ["/banana-bread-loaf.jpg"],
    location: "Park Slope, Brooklyn",
    pickupDetails: "Available all day. Best consumed within 3 days. Can be frozen for longer storage.",
    status: "available" as const,
  },
  {
    title: "Spicy Thai Green Curry",
    description:
      "Authentic Thai green curry with coconut milk, fresh vegetables, and your choice of protein. Made with homemade curry paste and fresh herbs.",
    price: 18,
    quantity: 3,
    category: "meal",
    imageUrls: ["/thai-curry-bowl.jpg"],
    location: "Chinatown, Manhattan",
    pickupDetails: "Ready for pickup after 6pm. Stays hot for 2 hours. Rice included.",
    status: "available" as const,
  },
  {
    title: "Artisan Sourdough Bread",
    description:
      "Hand-crafted sourdough bread with a perfect golden crust and soft, airy interior. Made with wild yeast starter maintained for over 5 years.",
    price: 8,
    quantity: 4,
    category: "baked goods",
    imageUrls: ["/rustic-sourdough-loaf.png"],
    location: "Williamsburg, Brooklyn",
    pickupDetails: "Fresh daily at 2pm. Best consumed within 3 days. Can provide slicing upon request.",
    status: "available" as const,
  },
  {
    title: "Nutritious Vegan Buddha Bowl",
    description:
      "Colorful and nutritious bowl with quinoa, roasted sweet potatoes, avocado, chickpeas, kale, and homemade tahini dressing. Completely plant-based.",
    price: 14,
    quantity: 5,
    category: "healthy",
    imageUrls: ["/vegan-buddha-bowl.png"],
    location: "East Village, Manhattan",
    pickupDetails: "Available lunch hours 11am-3pm. Dressing served on the side. Perfect for meal prep.",
    status: "available" as const,
  },
  {
    title: "Homemade Apple Pie",
    description:
      "Classic American apple pie with flaky crust and cinnamon-spiced apple filling. Made with fresh Granny Smith apples.",
    price: 20,
    quantity: 1,
    category: "dessert",
    imageUrls: [],
    location: "Brooklyn Heights",
    pickupDetails: "Best served warm. Can provide vanilla ice cream for extra $3.",
    status: "available" as const,
  },
  {
    title: "Fresh Smoothie Bowls",
    description:
      "Thick smoothie bowls topped with granola, fresh fruits, and seeds. Choose from Acai, Mango, or Green varieties.",
    price: 12,
    quantity: 8,
    category: "healthy",
    imageUrls: [],
    location: "Williamsburg",
    pickupDetails: "Available mornings 8am-12pm. Toppings included.",
    status: "available" as const,
  },
]

export function DatabaseSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [existingCount, setExistingCount] = useState<number | null>(null)
  const { user } = useAuth()

  const checkExistingData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "listings"))
      setExistingCount(snapshot.size)
    } catch (error) {
      console.error("Error checking existing data:", error)
      setExistingCount(0)
    }
  }

  const clearDatabase = async () => {
    if (!user) {
      toast.error("Please sign in first")
      return
    }

    if (!confirm("Are you sure you want to delete ALL listings? This cannot be undone.")) {
      return
    }

    setIsClearing(true)

    try {
      const snapshot = await getDocs(collection(db, "listings"))
      const deletePromises = snapshot.docs.map((docSnapshot) => deleteDoc(doc(db, "listings", docSnapshot.id)))

      await Promise.all(deletePromises)

      toast.success(`Deleted ${snapshot.size} listings`)
      await checkExistingData()
    } catch (error: any) {
      console.error("Error clearing database:", error)
      toast.error("Failed to clear database: " + error.message)
    } finally {
      setIsClearing(false)
    }
  }

  const seedDatabase = async () => {
    if (!user) {
      toast.error("Please sign in first to seed the database")
      return
    }

    setIsSeeding(true)
    setProgress(0)
    setCompleted(false)

    try {
      const now = Timestamp.now()
      let successCount = 0

      for (let i = 0; i < sampleListings.length; i++) {
        const listing = sampleListings[i]

        try {
          const docRef = await addDoc(collection(db, "listings"), {
            ...listing,
            producerId: user.uid,
            producerName: user.displayName || "Demo User",
            producerPhotoURL: user.photoURL || "",
            createdAt: Timestamp.fromDate(new Date(now.toMillis() - i * 2 * 60 * 60 * 1000)), // Spread over time
            updatedAt: now,
          })

          console.log(`Added listing: ${listing.title} with ID: ${docRef.id}`)
          successCount++
        } catch (listingError) {
          console.error(`Failed to add listing: ${listing.title}`, listingError)
        }

        setProgress(((i + 1) / sampleListings.length) * 100)

        // Small delay to show progress and avoid overwhelming Firestore
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setCompleted(true)
      toast.success(`Successfully added ${successCount} sample listings to Firestore!`)

      // Refresh the existing count
      await checkExistingData()
    } catch (error: any) {
      console.error("Error seeding database:", error)

      if (error.code === "permission-denied") {
        toast.error("Permission denied. Please check your Firestore security rules.")
      } else {
        toast.error("Failed to seed database: " + error.message)
      }
    } finally {
      setIsSeeding(false)
    }
  }

  // Check existing data on mount
  useEffect(() => {
    checkExistingData()
  }, [])

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          {existingCount !== null && (
            <p className="mb-2">
              Current listings in database: <strong>{existingCount}</strong>
            </p>
          )}
          <p>Manage your Firestore database with sample data for testing and development.</p>
        </div>

        {isSeeding && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Adding sample listings to Firestore...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {completed && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Database seeding completed successfully!</span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={seedDatabase}
            disabled={isSeeding || isClearing || !user}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding to Firestore...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Add Sample Data
              </>
            )}
          </Button>

          <Button variant="outline" onClick={checkExistingData} disabled={isSeeding || isClearing} size="sm">
            Refresh Count
          </Button>

          {existingCount && existingCount > 0 && (
            <Button variant="destructive" onClick={clearDatabase} disabled={isSeeding || isClearing || !user} size="sm">
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data
                </>
              )}
            </Button>
          )}
        </div>

        {!user && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Please sign in to manage database data.</span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>
            <strong>Sample data includes:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>{sampleListings.length} diverse food listings across different categories</li>
            <li>Realistic descriptions, prices, and pickup details</li>
            <li>Associated with your user account</li>
            <li>Images from the existing asset collection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
