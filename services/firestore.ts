import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface FoodListing {
  id?: string
  title: string
  description: string
  price: number
  quantity: number
  category: string
  imageUrls: string[]
  producerId: string
  producerName: string
  producerPhotoURL: string
  location: string | null
  pickupDetails: string
  status: "available" | "sold" | "pending"
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface User {
  id: string
  displayName: string
  email: string
  photoURL?: string
  createdAt: Timestamp
}

// Helper function to create mock data when Firestore is not accessible
const getMockListings = (): FoodListing[] => [
  {
    id: "mock-1",
    title: "Grandma's Famous Chocolate Chip Cookies",
    description:
      "Made with love using a 50-year-old family recipe. These cookies are soft, chewy, and loaded with premium chocolate chips. Perfect for any occasion or just a sweet treat!",
    price: 15,
    quantity: 24,
    category: "dessert",
    imageUrls: ["/chocolate-chip-cookies.png", "/close-up-chocolate-chip-cookies.png"],
    producerId: "mock-user",
    producerName: "Sarah's Kitchen",
    producerPhotoURL: "/woman-chef-preparing-food.png",
    location: "Downtown Brooklyn",
    pickupDetails:
      "Available for pickup weekdays after 5pm and weekends 10am-6pm. Please message 30 minutes before pickup.",
    status: "available",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "mock-2",
    title: "Authentic Italian Lasagna",
    description:
      "Traditional family recipe passed down through generations. Made with fresh pasta, homemade marinara sauce, ricotta, mozzarella, and ground beef. Serves 6-8 people.",
    price: 35,
    quantity: 1,
    category: "meal",
    imageUrls: ["/homemade-lasagna.png"],
    producerId: "mock-user-2",
    producerName: "Nonna Maria's Kitchen",
    producerPhotoURL: "",
    location: "Little Italy, Manhattan",
    pickupDetails: "Best served fresh within 2 hours of pickup. Can be reheated. Available Tuesday-Sunday.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
  },
  {
    id: "mock-3",
    title: "Fresh Banana Bread Loaf",
    description:
      "Moist and delicious banana bread made with overripe bananas, walnuts, and a hint of cinnamon. No preservatives or artificial ingredients. Perfect for breakfast or snacking.",
    price: 12,
    quantity: 2,
    category: "baked goods",
    imageUrls: ["/banana-bread-loaf.jpg"],
    producerId: "mock-user-3",
    producerName: "Baker's Delight",
    producerPhotoURL: "",
    location: "Park Slope, Brooklyn",
    pickupDetails: "Available all day. Best consumed within 3 days. Can be frozen for longer storage.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
  },
  {
    id: "mock-4",
    title: "Spicy Thai Green Curry",
    description:
      "Authentic Thai green curry with coconut milk, fresh vegetables, and your choice of protein. Made with homemade curry paste and fresh herbs. Medium spice level.",
    price: 18,
    quantity: 3,
    category: "meal",
    imageUrls: ["/thai-curry-bowl.jpg"],
    producerId: "mock-user-4",
    producerName: "Thai Kitchen NYC",
    producerPhotoURL: "",
    location: "Chinatown, Manhattan",
    pickupDetails:
      "Ready for pickup after 6pm. Stays hot for 2 hours. Rice included. Specify protein preference when ordering.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
  },
  {
    id: "mock-5",
    title: "Artisan Sourdough Bread",
    description:
      "Hand-crafted sourdough bread with a perfect golden crust and soft, airy interior. Made with wild yeast starter that's been maintained for over 5 years. 24-hour fermentation process.",
    price: 8,
    quantity: 4,
    category: "baked goods",
    imageUrls: ["/rustic-sourdough-loaf.png"],
    producerId: "mock-user-5",
    producerName: "Artisan Bread Co.",
    producerPhotoURL: "",
    location: "Williamsburg, Brooklyn",
    pickupDetails: "Fresh daily at 2pm. Best consumed within 3 days. Can provide slicing upon request.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)),
  },
  {
    id: "mock-6",
    title: "Nutritious Vegan Buddha Bowl",
    description:
      "Colorful and nutritious bowl with quinoa, roasted sweet potatoes, avocado, chickpeas, kale, and homemade tahini dressing. Completely plant-based and gluten-free.",
    price: 14,
    quantity: 5,
    category: "healthy",
    imageUrls: ["/vegan-buddha-bowl.png"],
    producerId: "mock-user-6",
    producerName: "Green Eats",
    producerPhotoURL: "",
    location: "East Village, Manhattan",
    pickupDetails: "Available lunch hours 11am-3pm. Dressing served on the side. Perfect for meal prep.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)),
  },
]

// Listings CRUD operations
export const createListing = async (listing: Omit<FoodListing, "id" | "createdAt" | "updatedAt">) => {
  try {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, "listings"), {
      ...listing,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error: any) {
    console.error("Error creating listing:", error)
    if (error.code === "permission-denied") {
      throw new Error("Permission denied. Please check your Firestore security rules or sign in.")
    }
    throw new Error("Failed to create listing. Please try again.")
  }
}

export const getListings = async (categoryFilter?: string, lastDoc?: DocumentSnapshot, limitCount = 20) => {
  try {
    let q

    if (categoryFilter && categoryFilter !== "All") {
      // Try the composite query first (requires index)
      try {
        q = query(
          collection(db, "listings"),
          where("category", "==", categoryFilter.toLowerCase()),
          orderBy("createdAt", "desc"),
          limit(limitCount),
        )

        if (lastDoc) {
          q = query(q, startAfter(lastDoc))
        }

        const snapshot = await getDocs(q)
        const listings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FoodListing[]

        const availableListings = listings.filter((listing) => listing.status === "available")

        return {
          listings: availableListings,
          lastDoc: snapshot.docs[snapshot.docs.length - 1],
          hasMore: snapshot.docs.length === limitCount,
        }
      } catch (indexError: any) {
        if (indexError.code === "failed-precondition") {
          console.log("Composite index not available, falling back to client-side filtering")
          // Fall back to getting all documents and filtering client-side
          q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(100))
        } else {
          throw indexError
        }
      }
    } else {
      // Simple query without category filter
      q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(limitCount))

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }
    }

    const snapshot = await getDocs(q)
    let listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodListing[]

    // Filter by category on client side if needed
    if (categoryFilter && categoryFilter !== "All") {
      listings = listings.filter((listing) => listing.category === categoryFilter.toLowerCase())
    }

    // Filter available items on client side
    const availableListings = listings.filter((listing) => listing.status === "available")

    return {
      listings: availableListings.slice(0, limitCount),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: availableListings.length === limitCount,
    }
  } catch (error: any) {
    console.error("Error fetching listings:", error)

    // If any error occurs, return mock data for demo purposes
    console.log("Using mock data due to Firestore restrictions")
    const mockListings = getMockListings()

    // Apply category filter to mock data
    const filteredMockListings =
      categoryFilter && categoryFilter !== "All"
        ? mockListings.filter((listing) => listing.category === categoryFilter.toLowerCase())
        : mockListings

    return {
      listings: filteredMockListings,
      lastDoc: null,
      hasMore: false,
    }
  }
}

export const getListing = async (id: string) => {
  try {
    const docRef = doc(db, "listings", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FoodListing
    }
    return null
  } catch (error: any) {
    console.error("Error fetching listing:", error)

    // Return mock data if permission denied or other error
    const mockListings = getMockListings()
    return mockListings.find((listing) => listing.id === id) || null
  }
}

export const updateListing = async (id: string, updates: Partial<FoodListing>) => {
  try {
    const docRef = doc(db, "listings", id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error: any) {
    console.error("Error updating listing:", error)
    if (error.code === "permission-denied") {
      throw new Error("Permission denied. You can only edit your own listings.")
    }
    throw new Error("Failed to update listing. Please try again.")
  }
}

export const deleteListing = async (id: string) => {
  try {
    const docRef = doc(db, "listings", id)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error("Error deleting listing:", error)
    if (error.code === "permission-denied") {
      throw new Error("Permission denied. You can only delete your own listings.")
    }
    throw new Error("Failed to delete listing. Please try again.")
  }
}

export const getUserListings = async (userId: string) => {
  try {
    const q = query(collection(db, "listings"), where("producerId", "==", userId), orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodListing[]
  } catch (error: any) {
    console.error("Error fetching user listings:", error)
    return []
  }
}

export const searchListings = async (searchTerm: string) => {
  try {
    // Simple query without complex filtering to avoid index issues
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(100))

    const snapshot = await getDocs(q)
    const allListings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodListing[]

    // Client-side filtering for search
    return allListings.filter(
      (listing) =>
        listing.status === "available" &&
        (listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  } catch (error: any) {
    console.error("Error searching listings:", error)

    // Return filtered mock data if error occurs
    const mockListings = getMockListings()
    return mockListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }
}
