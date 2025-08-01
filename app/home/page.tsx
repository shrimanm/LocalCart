"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter } from "lucide-react"
import BannerCarousel from "@/components/home/banner-carousel"
import CategoryTabs from "@/components/home/category-tabs"
import ProductCard from "@/components/products/product-card"
import Header from "@/components/home/header"
import BottomNav from "@/components/ui/bottom-nav"
import RouteGuard from "@/components/auth/route-guard"
import type { Product } from "@/lib/types"

function HomePageContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [priceRange, setPriceRange] = useState([0, 10000])


  const [showFilters, setShowFilters] = useState(false)
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set())

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Check if user needs to complete profile
    if (!user.name || !user.age) {
      router.push("/onboarding")
      return
    }

    fetchProducts()
    fetchWishlist()
  }, [user, selectedCategory, sortBy, searchQuery, priceRange, pagination.page, router])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchQuery) params.append("search", searchQuery)

      if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString())
      if (priceRange[1] < 10000) params.append("maxPrice", priceRange[1].toString())

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)

      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        const wishlistedIds = new Set<string>(data.items.map((item: any) => item.productId))
        setWishlistedItems(wishlistedIds)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  const handleWishlistToggle = async (productId: string) => {
    if (!token) return

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        const data = await response.json()
        setWishlistedItems((prev) => {
          const newSet = new Set(prev)
          if (data.action === "added") {
            newSet.add(productId)
          } else {
            newSet.delete(productId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  useEffect(() => {
    // Update search query and category when URL params change
    const urlSearch = searchParams.get("search") || ""
    const urlCategory = searchParams.get("category") || "all"
    setSearchQuery(urlSearch)
    setSelectedCategory(urlCategory)
  }, [searchParams])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("createdAt")
    setPriceRange([0, 10000])

    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-cyan-50 pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Carousel */}
        <div className="py-6">
          <BannerCarousel />
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => {
            setSelectedCategory(category)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
        />

        {/* Filters and Sort */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-3">
            {/* Filter Toggle - Mobile */}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-2">
              <Filter className="h-4 w-4" />
            </Button>

            {/* Sort Options */}
            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="-price">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Filters Panel */}
          {(showFilters || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <Card className="lg:hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>


              </CardContent>
            </Card>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>


              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <Button onClick={resetFilters} className="bg-[#0077B6] hover:bg-[#005F8C]">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Results Info */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {products.length} of {pagination.total} products
                  </p>
                  {(searchQuery || selectedCategory !== "all") && (
                    <div className="flex gap-2">
                      {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}

                      {selectedCategory !== "all" && <Badge variant="secondary">Category: {selectedCategory}</Badge>}
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onWishlistToggle={handleWishlistToggle}
                      isWishlisted={wishlistedItems.has(product.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={pagination.page === page ? "default" : "outline"}
                            onClick={() => setPagination((prev) => ({ ...prev, page }))}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default function HomePage() {
  return (
    <RouteGuard>
      <HomePageContent />
    </RouteGuard>
  )
}
