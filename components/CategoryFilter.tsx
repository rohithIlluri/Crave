"use client"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Filter,
  UtensilsCrossed,
  Cookie,
  Apple,
  Coffee,
  Cake,
  Salad,
  Leaf,
  Wheat,
  Star
} from "lucide-react"

const categories = [
  { id: "All", name: "All Categories", icon: Star },
  { id: "meal", name: "Meals", icon: UtensilsCrossed },
  { id: "dessert", name: "Desserts", icon: Cookie },
  { id: "snack", name: "Snacks", icon: Apple },
  { id: "beverage", name: "Beverages", icon: Coffee },
  { id: "baked goods", name: "Baked Goods", icon: Cake },
  { id: "healthy", name: "Healthy", icon: Salad },
  { id: "vegan", name: "Vegan", icon: Leaf },
  { id: "gluten-free", name: "Gluten-Free", icon: Wheat },
]

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void
  selectedCategory?: string
}

export function CategoryFilter({ onCategoryChange, selectedCategory = "All" }: CategoryFilterProps) {
  const handleCategorySelect = (category: string) => {
    onCategoryChange?.(category)
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const SelectedIconComponent = selectedCategoryData?.icon || Star

  // Mobile-first: Always use dropdown for better mobile UX
  // Responsive sizing: full width on mobile, constrained width on larger screens
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={selectedCategory} onValueChange={handleCategorySelect}>
          <SelectTrigger className="w-full max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500">
            <SelectValue>
              <div className="flex items-center gap-2">
                <SelectedIconComponent className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{selectedCategoryData?.name || "All Categories"}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
