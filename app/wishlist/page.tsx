"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { THEME_CLASSES } from "@/lib/theme-constants"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, Calendar } from "lucide-react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import BottomNav from "@/components/ui/bottom-nav"
import BookingDialog from "@/components/ui/booking-dialog"

interface WishlistItem {
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
  isBooked?: boolean
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bookedItems, setBookedItems] = useState<Set<string>>(new Set())
  const [bookingDialog, setBookingDialog] = useState<{ isOpen: boolean; product: WishlistItem | null }>({ isOpen: false, product: null })
  const [bookingLoading, setBookingLoading] = useState(false)
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push("/")
      return
    }
    
    if (user && token) {
      fetchWishlist()
      fetchBookedItems()
    }
  }, [user, token, router, loading])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist", {
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
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookedItems = async () => {
    try {
      const response = await fetch("/api/booked", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const bookedIds = new Set<string>(data.items.map((item: any) => item.productId))
        setBookedItems(bookedIds)
      }
    } catch (error) {
      console.error("Error fetching booked items:", error)
    }
  }

  const removeFromWishlist = async (productId: string) => {
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
        setItems(items.filter((item) => item.productId !== productId))
        // Trigger wishlist count update after state update
        setTimeout(() => {
          window.dispatchEvent(new Event('wishlist-updated'))
        }, 100)
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  const handleBookingClick = (item: WishlistItem) => {
    if (bookedItems.has(item.productId)) {
      // If already booked, unbook directly
      toggleBooking(item.productId)
    } else {
      // If not booked, show confirmation dialog
      setBookingDialog({ isOpen: true, product: item })
    }
  }

  const confirmBooking = async () => {
    if (!bookingDialog.product) return
    
    setBookingLoading(true)
    try {
      await toggleBooking(bookingDialog.product.productId)
      setBookingDialog({ isOpen: false, product: null })
      // Navigate to booked page after successful booking
      setTimeout(() => {
        router.push('/booked')
      }, 500)
    } catch (error) {
      console.error("Error confirming booking:", error)
    } finally {
      setBookingLoading(false)
    }
  }

  const toggleBooking = async (productId: string) => {
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
        const data = await response.json()
        setBookedItems(prev => {
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
      console.error("Error toggling booking:", error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!user) return null

  return (
    <div className="min-h-screen bg-cyan-50 pb-20 pt-6">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-gray-600">{items.length} items</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-4">Save items you love to buy them later</p>
            <Button onClick={() => router.push("/home")} className="bg-gray-900 hover:bg-gray-800 text-white">
              Continue Shopping
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
                          onClick={() => handleBookingClick(item)}
                          className={`text-white text-xs px-4 ${
                            bookedItems.has(item.productId)
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-900 hover:bg-gray-800"
                          }`}
                          size="sm"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          {bookedItems.has(item.productId) ? "Unbook" : "Book Now"}
                        </Button>
                        <Button
                          onClick={() => removeFromWishlist(item.productId)}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-4"
                          size="sm"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons - Mobile Only */}
                    <div className="flex sm:hidden gap-2 mt-3">
                      <Button
                        onClick={() => handleBookingClick(item)}
                        className={`flex-1 text-white text-xs ${
                          bookedItems.has(item.productId)
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                        size="sm"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {bookedItems.has(item.productId) ? "Unbook" : "Book Now"}
                      </Button>
                      <Button
                        onClick={() => removeFromWishlist(item.productId)}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                        size="sm"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Booking Confirmation Dialog */}
      <BookingDialog
        isOpen={bookingDialog.isOpen}
        onClose={() => setBookingDialog({ isOpen: false, product: null })}
        onConfirm={confirmBooking}
        product={bookingDialog.product ? {
          name: bookingDialog.product.name,
          price: bookingDialog.product.price,
          images: bookingDialog.product.images,
          brand: bookingDialog.product.brand
        } : { name: '', price: 0, images: [], brand: '' }}
        loading={bookingLoading}
      />
      
      <BottomNav />
    </div>
  )
}
