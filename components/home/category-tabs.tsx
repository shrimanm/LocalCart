"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = [
  { id: "all", name: "All", icon: "🛍️" },
  { id: "men", name: "Men", icon: "👨" },
  { id: "women", name: "Women", icon: "👩" },
  { id: "kids", name: "Kids", icon: "👶" },
  { id: "home", name: "Home & Living", icon: "🏠" },
  { id: "beauty", name: "Beauty", icon: "💄" },
  { id: "footwear", name: "Footwear", icon: "👟" },
  { id: "accessories", name: "Accessories", icon: "👜" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "electronics", name: "Electronics", icon: "📱" },
]

interface CategoryTabsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  productCounts?: Record<string, number>
}

export default function CategoryTabs({ selectedCategory, onCategoryChange, productCounts = {} }: CategoryTabsProps) {
  return (
    <div className="bg-white border-b sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 border-2 ${
                selectedCategory === category.id
                  ? "border-gray-900 text-gray-900 bg-gray-100 hover:bg-gray-200 shadow-md"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
              {productCounts[category.id] && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {productCounts[category.id]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
