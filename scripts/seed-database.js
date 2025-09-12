import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleListings = [
  {
    title: "Grandma's Famous Chocolate Chip Cookies",
    description:
      "Made with love using a 50-year-old family recipe. These cookies are soft, chewy, and loaded with premium chocolate chips. Perfect for any occasion or just a sweet treat!",
    price: 15,
    quantity: 24,
    category: "dessert",
    imageUrls: ["/chocolate-chip-cookies.png", "/close-up-chocolate-chip-cookies.png"],
    producerId: "demo-user-1",
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
    title: "Authentic Italian Lasagna",
    description:
      "Traditional family recipe passed down through generations. Made with fresh pasta, homemade marinara sauce, ricotta, mozzarella, and ground beef. Serves 6-8 people.",
    price: 35,
    quantity: 1,
    category: "meal",
    imageUrls: ["/homemade-lasagna.png"],
    producerId: "demo-user-2",
    producerName: "Nonna Maria's Kitchen",
    producerPhotoURL: "",
    location: "Little Italy, Manhattan",
    pickupDetails: "Best served fresh within 2 hours of pickup. Can be reheated. Available Tuesday-Sunday.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
  },
  {
    title: "Fresh Banana Bread Loaf",
    description:
      "Moist and delicious banana bread made with overripe bananas, walnuts, and a hint of cinnamon. No preservatives or artificial ingredients. Perfect for breakfast or snacking.",
    price: 12,
    quantity: 2,
    category: "baked goods",
    imageUrls: ["/banana-bread-loaf.jpg"],
    producerId: "demo-user-3",
    producerName: "Baker's Delight",
    producerPhotoURL: "",
    location: "Park Slope, Brooklyn",
    pickupDetails: "Available all day. Best consumed within 3 days. Can be frozen for longer storage.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)), // 4 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
  },
  {
    title: "Spicy Thai Green Curry",
    description:
      "Authentic Thai green curry with coconut milk, fresh vegetables, and your choice of protein. Made with homemade curry paste and fresh herbs. Medium spice level.",
    price: 18,
    quantity: 3,
    category: "meal",
    imageUrls: ["/thai-curry-bowl.jpg"],
    producerId: "demo-user-4",
    producerName: "Thai Kitchen NYC",
    producerPhotoURL: "",
    location: "Chinatown, Manhattan",
    pickupDetails:
      "Ready for pickup after 6pm. Stays hot for 2 hours. Rice included. Specify protein preference when ordering.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)), // 6 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
  },
  {
    title: "Artisan Sourdough Bread",
    description:
      "Hand-crafted sourdough bread with a perfect golden crust and soft, airy interior. Made with wild yeast starter that's been maintained for over 5 years. 24-hour fermentation process.",
    price: 8,
    quantity: 4,
    category: "baked goods",
    imageUrls: ["/rustic-sourdough-loaf.png"],
    producerId: "demo-user-5",
    producerName: "Artisan Bread Co.",
    producerPhotoURL: "",
    location: "Williamsburg, Brooklyn",
    pickupDetails: "Fresh daily at 2pm. Best consumed within 3 days. Can provide slicing upon request.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)), // 8 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)),
  },
  {
    title: "Nutritious Vegan Buddha Bowl",
    description:
      "Colorful and nutritious bowl with quinoa, roasted sweet potatoes, avocado, chickpeas, kale, and homemade tahini dressing. Completely plant-based and gluten-free.",
    price: 14,
    quantity: 5,
    category: "healthy",
    imageUrls: ["/vegan-buddha-bowl.png"],
    producerId: "demo-user-6",
    producerName: "Green Eats",
    producerPhotoURL: "",
    location: "East Village, Manhattan",
    pickupDetails: "Available lunch hours 11am-3pm. Dressing served on the side. Perfect for meal prep.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)), // 10 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)),
  },
  {
    title: "Homemade Chicken Pot Pie",
    description:
      "Comfort food at its finest! Flaky pastry crust filled with tender chicken, carrots, peas, and potatoes in a rich, creamy sauce. Made from scratch with love.",
    price: 22,
    quantity: 2,
    category: "meal",
    imageUrls: [],
    producerId: "demo-user-7",
    producerName: "Comfort Kitchen",
    producerPhotoURL: "",
    location: "Queens Village",
    pickupDetails: "Available evenings after 7pm. Can be frozen. Reheating instructions included.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)), // 12 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)),
  },
  {
    title: "Fresh Fruit Smoothie Packs",
    description:
      "Pre-portioned frozen smoothie packs with organic fruits and vegetables. Just add liquid and blend! Flavors: Green Goddess, Berry Blast, Tropical Paradise.",
    price: 6,
    quantity: 12,
    category: "beverage",
    imageUrls: [],
    producerId: "demo-user-8",
    producerName: "Smoothie Central",
    producerPhotoURL: "",
    location: "Upper West Side",
    pickupDetails: "Keep frozen. Each pack makes one 16oz smoothie. Instructions included.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 14 * 60 * 60 * 1000)), // 14 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 14 * 60 * 60 * 1000)),
  },
  {
    title: "Gluten-Free Chocolate Brownies",
    description:
      "Rich, fudgy brownies made with almond flour and premium dark chocolate. You won't believe they're gluten-free! Perfect for those with dietary restrictions.",
    price: 16,
    quantity: 9,
    category: "gluten-free",
    imageUrls: [],
    producerId: "demo-user-9",
    producerName: "Allergy-Free Treats",
    producerPhotoURL: "",
    location: "Astoria, Queens",
    pickupDetails: "Made in a dedicated gluten-free kitchen. Available weekends. Individual wrapping available.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 16 * 60 * 60 * 1000)), // 16 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 16 * 60 * 60 * 1000)),
  },
  {
    title: "Homemade Granola Mix",
    description:
      "Crunchy granola made with oats, nuts, seeds, and dried fruits. Lightly sweetened with maple syrup. Perfect for breakfast or snacking. Vegan and refined sugar-free.",
    price: 10,
    quantity: 6,
    category: "healthy",
    imageUrls: [],
    producerId: "demo-user-10",
    producerName: "Morning Crunch",
    producerPhotoURL: "",
    location: "Hoboken, NJ",
    pickupDetails: "Stays fresh for 2 weeks in airtight container. Bulk discounts available.",
    status: "available",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 18 * 60 * 60 * 1000)), // 18 hours ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 18 * 60 * 60 * 1000)),
  },
]

async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    for (let i = 0; i < sampleListings.length; i++) {
      const listing = sampleListings[i]
      console.log(`Adding listing ${i + 1}/${sampleListings.length}: ${listing.title}`)

      const docRef = await addDoc(collection(db, "listings"), listing)
      console.log(`✅ Added with ID: ${docRef.id}`)

      // Small delay to avoid overwhelming Firestore
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log("🎉 Database seeding completed successfully!")
    console.log(`Added ${sampleListings.length} sample listings to Firestore.`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)

    if (error.code === "permission-denied") {
      console.log("\n📋 To fix this error:")
      console.log("1. Go to Firebase Console → Firestore Database → Rules")
      console.log("2. Update your rules to allow writes")
      console.log("3. Or run this script after signing in to your app")
    }
  }
}

// Run the seeding function
seedDatabase()
