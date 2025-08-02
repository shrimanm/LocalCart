"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { THEME_CLASSES } from "@/lib/theme-constants"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Star, X } from "lucide-react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import BottomNav from "@/components/ui/bottom-nav"

interface BookedItem {
  id: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  brand: string
  rating: number
  reviewCount: number
  shopName: string
  createdAt: string
}

export default function BookedPage() {
  const [items, setItems] = useState<BookedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push("/")
      return
    }
    
    if (user && token) {
      fetchBookedItems()
    }
  }, [user, token, router, loading])

  const fetchBookedItems = async () => {
    try {
      const response = await fetch("/api/booked", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Transform the data to match expected structure
        const transformedItems = data.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          images: item.product.images,
          brand: item.product.brand,
          rating: item.product.rating,
          reviewCount: item.product.reviewCount,
          shopName: item.product.shopName,
          createdAt: item.createdAt
        }))
        setItems(transformedItems)
      }
    } catch (error) {
      console.error("Error fetching booked items:", error)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (productId: string) => {
    try {
      const response = await fetch("/api/booked", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        setItems(items.filter((item) => item.productId !== productId))
      }
    } catch (error) {
      console.error("Error canceling booking:", error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00B4D8]"></div>
      </div>
    )
  }
  
  if (!user) return null

  return (
    <div className="min-h-screen bg-cyan-50 pb-20 pt-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-gray-600">{items.length} items</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00B4D8]"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-4">Book items from your wishlist to see them here</p>
            <Button onClick={() => router.push("/wishlist")} className="bg-[#00B4D8] hover:bg-[#0096C7]">
              Go to Wishlist
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow duration-200 bg-white">
                <CardContent className="p-4">
                  <div>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-32 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer" onClick={() => router.push(`/product/${item.productId}`)}>
                          <Image
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-contain transition-transform duration-300 hover:scale-105"
                            sizes="96px"
                          />
                        </div>
                        
                        {/* Booked badge */}
                        <div className="absolute top-1 right-1 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">✓</span>
                        </div>
                        
                        {/* Discount badge */}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-gray-900"
                          onClick={() => router.push(`/product/${item.productId}`)}
                        >
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-xs mb-2">{item.brand}</p>

                        <div className="flex items-center mb-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 ml-1">
                            {item.rating} ({item.reviewCount})
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-gray-500 line-through text-sm">{formatPrice(item.originalPrice)}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Desktop Only */}
                      <div className="hidden sm:flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => cancelBooking(item.productId)}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-4"
                          size="sm"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel Booking
                        </Button>
                        <Button
                          onClick={() => router.push(`/products/${item.productId}`)}
                          variant="outline"
                          className="text-xs px-4"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons - Mobile Only */}
                    <div className="flex sm:hidden gap-2 mt-3">
                      <Button
                        onClick={() => cancelBooking(item.productId)}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                        size="sm"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel Booking
                      </Button>
                      <Button
                        onClick={() => router.push(`/product/${item.productId}`)}
                        variant="outline"
                        className="flex-1 text-xs"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}