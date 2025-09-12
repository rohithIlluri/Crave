"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/Navbar"
import { UtensilsCrossed, Cookie, Apple, Coffee, Cake, Salad, Leaf, Wheat } from "lucide-react"

const categories = [
  {
    id: "meal",
    name: "Meals",
    description: "Complete dishes and main courses",
    icon: UtensilsCrossed,
    color: "bg-red-100 text-red-700",
    count: 45,
  },
  {
    id: "dessert",
    name: "Desserts",
    description: "Sweet treats and desserts",
    icon: Cookie,
    color: "bg-pink-100 text-pink-700",
    count: 32,
  },
  {
    id: "snack",
    name: "Snacks",
    description: "Light bites and appetizers",
    icon: Apple,
    color: "bg-green-100 text-green-700",
    count: 28,
  },
  {
    id: "beverage",
    name: "Beverages",
    description: "Drinks and refreshments",
    icon: Coffee,
    color: "bg-blue-100 text-blue-700",
    count: 15,
  },
  {
    id: "baked goods",
    name: "Baked Goods",
    description: "Fresh bread, pastries, and baked items",
    icon: Cake,
    color: "bg-yellow-100 text-yellow-700",
    count: 38,
  },
  {
    id: "healthy",
    name: "Healthy",
    description: "Nutritious and wholesome options",
    icon: Salad,
    color: "bg-emerald-100 text-emerald-700",
    count: 22,
  },
  {
    id: "vegan",
    name: "Vegan",
    description: "Plant-based dishes",
    icon: Leaf,
    color: "bg-lime-100 text-lime-700",
    count: 18,
  },
  {
    id: "gluten-free",
    name: "Gluten-Free",
    description: "Gluten-free options",
    icon: Wheat,
    color: "bg-orange-100 text-orange-700",
    count: 12,
  },
]

export function Categories() {
  const router = useRouter()

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/?category=${categoryId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Categories</h1>
          <p className="text-gray-600">Discover delicious homemade food by category</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className="h-8 w-8" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                  <Badge variant="secondary" className="bg-gray-100">
                    {category.count} items
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Popular Items Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Popular This Week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Chocolate Chip Cookies", "Homemade Pasta", "Fresh Bread", "Fruit Smoothies"].map((item, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Popular Item</span>
                  </div>
                  <h4 className="font-medium">{item}</h4>
                  <p className="text-sm text-gray-600">Trending in your area</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
