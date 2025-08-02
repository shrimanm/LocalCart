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
import { Search, Menu } from "lucide-react"
import BannerCarousel from "@/components/home/banner-carousel"
import CategoryTabs from "@/components/home/category-tabs"
import ProductCard from "@/components/products/product-card"
import Header from "@/components/home/header"
import BottomNav from "@/components/ui/bottom-nav"
import RouteGuard from "@/components/auth/route-guard"
import { useBackButton } from "@/hooks/useBackButton"
import type { Product } from "@/lib/types"

function HomePageContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [priceRange, setPriceRange] = useState([0, 10000])


  const [showFilters, setShowFilters] = useState(false)
  const [isClosingFilters, setIsClosingFilters] = useState(false)
  const [activeFilterSection, setActiveFilterSection] = useState<string>('price')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableShops, setAvailableShops] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [customMinPrice, setCustomMinPrice] = useState('')
  const [customMaxPrice, setCustomMaxPrice] = useState('')
  
  // Temporary filter states (only applied on "Apply Filters" click)
  const [tempSelectedBrands, setTempSelectedBrands] = useState<string[]>([])
  const [tempSelectedShops, setTempSelectedShops] = useState<string[]>([])
  const [tempSelectedPriceRanges, setTempSelectedPriceRanges] = useState<string[]>([])
  const [tempCustomMinPrice, setTempCustomMinPrice] = useState('')
  const [tempCustomMaxPrice, setTempCustomMaxPrice] = useState('')
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [brandSearch, setBrandSearch] = useState('')
  const [shopSearch, setShopSearch] = useState('')
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set())

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [profileChecking, setProfileChecking] = useState(true)

  // Prevent app exit on back button
  const { goBack } = useBackButton({
    preventExit: true,
    fallbackUrl: "/home"
  })

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Check if user needs to complete profile (only for truly new users)
    if (!user.name) {
      router.push("/onboarding")
      return
    }

    // Profile is complete, allow home page to load
    setProfileChecking(false)
    fetchProducts()
    fetchWishlist()
    fetchFilterOptions()
  }, [user, selectedCategory, sortBy, searchQuery, priceRange, selectedBrands, selectedShops, selectedPriceRanges, customMinPrice, customMaxPrice, selectedCategories, pagination.page, router])

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

      // Handle price filtering - only apply if filters are actually set
      if (customMinPrice || customMaxPrice || selectedPriceRanges.length > 0) {
        let minPrice = 0
        let maxPrice = 50000
        
        // Custom price range takes priority
        if (customMinPrice) minPrice = parseInt(customMinPrice)
        if (customMaxPrice) maxPrice = parseInt(customMaxPrice)
        
        // If no custom price, use selected price ranges
        if (!customMinPrice && !customMaxPrice && selectedPriceRanges.length > 0) {
          const ranges = selectedPriceRanges.map(range => {
            if (range === '0-500') return { min: 0, max: 500 }
            if (range === '501-1000') return { min: 501, max: 1000 }
            if (range === '1001-1500') return { min: 1001, max: 1500 }
            if (range === '1501-2000') return { min: 1501, max: 2000 }
            if (range === '2001-3000') return { min: 2001, max: 3000 }
            if (range === '3000+') return { min: 3000, max: 50000 }
            return { min: 0, max: 50000 }
          })
          minPrice = Math.min(...ranges.map(r => r.min))
          maxPrice = Math.max(...ranges.map(r => r.max))
        }
        
        if (minPrice > 0) params.append("minPrice", minPrice.toString())
        if (maxPrice < 50000) params.append("maxPrice", maxPrice.toString())
      }
      if (selectedBrands.length > 0) params.append("brands", selectedBrands.join(','))
      if (selectedShops.length > 0) params.append("shops", selectedShops.join(','))
      if (selectedCategories.length > 0) {
        console.log('Applying category filter:', selectedCategories)
        params.append("categories", selectedCategories.join(','))
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        console.log('Products fetched:', data.products?.length, 'Total:', data.pagination?.total)
        console.log('Current page:', data.pagination?.page, 'Total pages:', data.pagination?.pages)
        console.log('Product names:', data.products?.map((p: any) => p.name))
        setProducts(data.products || [])
        setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 })
      } else {
        console.error('Failed to fetch products:', response.status, data)
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

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/products/filters')
      const data = await response.json()
      
      if (response.ok) {
        console.log('Filter options:', data)
        setAvailableBrands(data.brands || [])
        setAvailableShops(data.shops || [])
        setAvailableCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
      // Fallback to sample data
      console.log('Filter API error:', error)
      setAvailableBrands(['Nike', 'Adidas', 'Puma', 'Reebok'])
      setAvailableShops(['Fashion Store', 'Style Hub', 'Trendy Shop'])
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
    setSortBy("rating")
    setPriceRange([0, 10000])
    setSelectedBrands([])
    setSelectedShops([])
    setSelectedPriceRanges([])
    setCustomMinPrice('')
    setCustomMaxPrice('')
    setSelectedCategories([])
    setBrandSearch('')
    setShopSearch('')
    
    // Also reset temporary states
    setTempSelectedBrands([])
    setTempSelectedShops([])
    setTempSelectedPriceRanges([])
    setTempCustomMinPrice('')
    setTempCustomMaxPrice('')
    setTempSelectedCategories([])

    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Show loading while checking profile completion
  if (profileChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
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
            {/* Filter Toggle */}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="p-2">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="2" width="14" height="1.5" rx="0.75" />
                <rect x="3" y="6" width="10" height="1.5" rx="0.75" />
                <rect x="5" y="10" width="6" height="1.5" rx="0.75" />
              </svg>
            </Button>
            
            {/* Clear Button */}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-900 hover:underline text-sm">
              Clear
            </Button>

            {/* Sort Options */}
            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="-price">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className={`fixed inset-0 bg-black/50 z-50 ${isClosingFilters ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'}`}>
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-white rounded-b-2xl max-h-[80vh] overflow-y-auto w-full max-w-4xl ${isClosingFilters ? 'animate-out slide-out-to-top duration-300 ease-in' : 'animate-in slide-in-from-top duration-500 ease-out'}`}>
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-900">
                        Clear All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setIsClosingFilters(true)
                        setTimeout(() => {
                          setShowFilters(false)
                          setIsClosingFilters(false)
                        }, 300)
                      }}>
                        ✕
                      </Button>
                    </div>
                  </div>

                  {/* AJIO Style Filter Layout */}
                  <div className="flex h-96">
                    {/* Left Column - Filter Categories */}
                    <div className="w-2/5 bg-gray-50 space-y-0 shadow-lg">
                      <div 
                        onClick={() => setActiveFilterSection('price')}
                        className={`p-4 border-b cursor-pointer text-sm font-medium ${
                          activeFilterSection === 'price' 
                            ? 'bg-white border-l-4 border-l-gray-900 text-gray-900' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        PRICE
                      </div>
                      <div 
                        onClick={() => setActiveFilterSection('brand')}
                        className={`p-4 border-b cursor-pointer text-sm font-medium ${
                          activeFilterSection === 'brand' 
                            ? 'bg-white border-l-4 border-l-gray-900 text-gray-900' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        BRAND
                      </div>
                      <div 
                        onClick={() => setActiveFilterSection('shop')}
                        className={`p-4 border-b cursor-pointer text-sm font-medium ${
                          activeFilterSection === 'shop' 
                            ? 'bg-white border-l-4 border-l-gray-900 text-gray-900' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        SHOP
                      </div>
                      <div 
                        onClick={() => setActiveFilterSection('category')}
                        className={`p-4 border-b cursor-pointer text-sm font-medium ${
                          activeFilterSection === 'category' 
                            ? 'bg-white border-l-4 border-l-gray-900 text-gray-900' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        CATEGORY
                      </div>
                    </div>
                    
                    {/* Right Column - Filter Options */}
                    <div className="w-3/5 bg-white p-4 overflow-y-auto shadow-lg">
                      {/* Price Range Section */}
                      {activeFilterSection === 'price' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">PRICE</h4>
                            <button 
                              onClick={() => {
                                setTempSelectedPriceRanges([])
                                setTempCustomMinPrice('')
                                setTempCustomMaxPrice('')
                              }}
                              className="text-xs text-gray-900 hover:underline"
                            >
                              CLEAR
                            </button>
                          </div>
                          
                          {/* Predefined Price Ranges */}
                          <div className="space-y-3">
                            {[
                              { label: 'Below ₹500', value: '0-500' },
                              { label: '₹501 - ₹1000', value: '501-1000' },
                              { label: '₹1001 - ₹1500', value: '1001-1500' },
                              { label: '₹1501 - ₹2000', value: '1501-2000' },
                              { label: '₹2001 - ₹3000', value: '2001-3000' },
                              { label: 'More than ₹3000', value: '3000+' }
                            ].map((range) => (
                              <label key={range.value} className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={tempSelectedPriceRanges.includes(range.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempSelectedPriceRanges([...tempSelectedPriceRanges, range.value])
                                    } else {
                                      setTempSelectedPriceRanges(tempSelectedPriceRanges.filter(r => r !== range.value))
                                    }
                                  }}
                                  className="w-4 h-4 text-[#00B4D8] border-gray-300 rounded focus:ring-[#00B4D8]"
                                />
                                <span className="text-sm text-gray-700">{range.label}</span>
                              </label>
                            ))}
                          </div>
                          
                          {/* Custom Price Range */}
                          <div className="pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-medium mb-3 text-gray-800">CUSTOM RANGE</h5>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <Input 
                                  type="number" 
                                  placeholder="₹ Min" 
                                  value={tempCustomMinPrice}
                                  onChange={(e) => setTempCustomMinPrice(e.target.value)}
                                  className="text-sm border-gray-300 focus:border-gray-900"
                                />
                              </div>
                              <span className="text-gray-400 text-sm">TO</span>
                              <div className="flex-1">
                                <Input 
                                  type="number" 
                                  placeholder="₹ Max" 
                                  value={tempCustomMaxPrice}
                                  onChange={(e) => setTempCustomMaxPrice(e.target.value)}
                                  className="text-sm border-gray-300 focus:border-gray-900"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Brand Section */}
                      {activeFilterSection === 'brand' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">BRAND</h4>
                            <button 
                              onClick={() => {
                                setTempSelectedBrands([])
                                setBrandSearch('')
                              }}
                              className="text-xs text-[#00B4D8] hover:underline"
                            >
                              CLEAR
                            </button>
                          </div>
                          <Input 
                            type="text" 
                            placeholder="Search brands..." 
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="text-sm border-gray-300 focus:border-[#00B4D8]"
                          />
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {availableBrands.length > 0 ? availableBrands
                              .filter(brand => brand.toLowerCase().includes(brandSearch.toLowerCase()))
                              .map((brand) => (
                              <label key={brand} className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={tempSelectedBrands.includes(brand)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempSelectedBrands([...tempSelectedBrands, brand])
                                    } else {
                                      setTempSelectedBrands(tempSelectedBrands.filter(b => b !== brand))
                                    }
                                  }}
                                  className="w-4 h-4 text-[#00B4D8] border-gray-300 rounded focus:ring-[#00B4D8]"
                                />
                                <span className="text-sm text-gray-700">{brand}</span>
                              </label>
                            )) : (
                              <div className="text-center py-4 text-gray-500 text-sm">Loading brands...</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Shop Section */}
                      {activeFilterSection === 'shop' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">SHOP</h4>
                            <button 
                              onClick={() => {
                                setTempSelectedShops([])
                                setShopSearch('')
                              }}
                              className="text-xs text-[#00B4D8] hover:underline"
                            >
                              CLEAR
                            </button>
                          </div>
                          <Input 
                            type="text" 
                            placeholder="Search shops..." 
                            value={shopSearch}
                            onChange={(e) => setShopSearch(e.target.value)}
                            className="text-sm border-gray-300 focus:border-[#00B4D8]"
                          />
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {availableShops.length > 0 ? availableShops
                              .filter(shop => shop.toLowerCase().includes(shopSearch.toLowerCase()))
                              .map((shop) => (
                              <label key={shop} className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={tempSelectedShops.includes(shop)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempSelectedShops([...tempSelectedShops, shop])
                                    } else {
                                      setTempSelectedShops(tempSelectedShops.filter(s => s !== shop))
                                    }
                                  }}
                                  className="w-4 h-4 text-[#00B4D8] border-gray-300 rounded focus:ring-[#00B4D8]"
                                />
                                <span className="text-sm text-gray-700">{shop}</span>
                              </label>
                            )) : (
                              <div className="text-center py-4 text-gray-500 text-sm">Loading shops...</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Category Section */}
                      {activeFilterSection === 'category' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">CATEGORY</h4>
                            <button 
                              onClick={() => {
                                setTempSelectedCategories([])
                              }}
                              className="text-xs text-[#00B4D8] hover:underline"
                            >
                              CLEAR
                            </button>
                          </div>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {availableCategories.length > 0 ? availableCategories.map((category) => (
                              <label key={category} className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={tempSelectedCategories.includes(category)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempSelectedCategories([...tempSelectedCategories, category])
                                    } else {
                                      setTempSelectedCategories(tempSelectedCategories.filter(c => c !== category))
                                    }
                                  }}
                                  className="w-4 h-4 text-[#00B4D8] border-gray-300 rounded focus:ring-[#00B4D8]"
                                />
                                <span className="text-sm text-gray-700">{category}</span>
                              </label>
                            )) : (
                              <div className="text-center py-4 text-gray-500 text-sm">Loading categories...</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={() => {
                        // Apply the temporary filters to actual filter states
                        setSelectedBrands(tempSelectedBrands)
                        setSelectedShops(tempSelectedShops)
                        setSelectedPriceRanges(tempSelectedPriceRanges)
                        setCustomMinPrice(tempCustomMinPrice)
                        setCustomMaxPrice(tempCustomMaxPrice)
                        setSelectedCategories(tempSelectedCategories)
                        
                        setIsClosingFilters(true)
                        setTimeout(() => {
                          setShowFilters(false)
                          setIsClosingFilters(false)
                        }, 300)
                      }} 
                      className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white shadow-lg"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto">
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
                  <Button onClick={resetFilters} className="bg-gray-900 hover:bg-gray-800 text-white">
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

                {/* Load More Button */}
                {pagination.page < pagination.pages && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-2"
                    >
                      Load More Products
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
