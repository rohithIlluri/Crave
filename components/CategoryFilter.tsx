"use client"
import { Button } from "@/components/ui/button"

const categories = ["All", "meal", "dessert", "snack", "beverage", "baked goods", "healthy", "vegan", "gluten-free"]

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void
  selectedCategory?: string
}

export function CategoryFilter({ onCategoryChange, selectedCategory = "All" }: CategoryFilterProps) {
  const handleCategorySelect = (category: string) => {
    onCategoryChange?.(category)
  }

  return (
    <div className="mt-4">
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(category)}
            className={`whitespace-nowrap ${
              selectedCategory === category
                ? "bg-orange-600 hover:bg-orange-700"
                : "border-gray-300 hover:border-orange-600"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}
