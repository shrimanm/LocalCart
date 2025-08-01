"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star } from "lucide-react"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"
// import type { Product } from "@/lib/types"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  brand: string
  images: string[]
  sizes: string[]
  variants?: string[]
  variantType?: string
  colors: string[]
  stock: number
  isActive: boolean
  rating: number
  reviewCount: number
}

interface ProductCardProps {
  product: Product
  onWishlistToggle?: (productId: string) => void
  isWishlisted?: boolean
}

export default function ProductCard({ product, onWishlistToggle, isWishlisted = false }: ProductCardProps) {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token) {
      router.push("/")
      return
    }

    if (onWishlistToggle) {
      onWishlistToggle(product.id)
    }
  }

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token) {
      router.push("/")
      return
    }

    if (onWishlistToggle) {
      await onWishlistToggle(product.id)
      // Trigger wishlist count update after the API call
      setTimeout(() => {
        window.dispatchEvent(new Event('wishlist-updated'))
      }, 100)
    }
  }

  const handleCardClick = () => {
    router.push(`/product/${product.id}`)
  }

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200" onClick={handleCardClick}>
      <CardContent className="p-0">
        <div className="relative aspect-[4/5] bg-white border border-gray-100 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          
          {/* Image overlay for better UX */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full z-10"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </Button>

          {/* Discount Badge */}
          {discount > 0 && <Badge className="absolute top-2 left-2 bg-red-500 text-white z-10">{discount}% OFF</Badge>}


        </div>

        <div className="p-2 lg:p-4 space-y-1 lg:space-y-2">
          {/* Brand */}
          <p className="product-brand truncate">{product.brand}</p>

          {/* Product Name */}
          <h3 className="product-title line-clamp-2 group-hover:text-[#00B4D8] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 lg:h-4 lg:w-4 fill-yellow-400 text-yellow-400" />
              <span className="product-rating ml-1">{product.rating.toFixed(1)}</span>
            </div>
            <span className="product-rating text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-1 lg:space-x-2">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Variants Preview - Hidden on mobile */}
          {((product.variants && product.variants.length > 0) || (product.sizes && product.sizes.length > 0)) && (
            <div className="hidden lg:block">
              <div className="flex items-start space-x-1 mb-1">
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {product.variantType ? product.variantType.charAt(0).toUpperCase() + product.variantType.slice(1) : 'Sizes'}:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(product.variants || product.sizes || []).slice(0, 3).map((variant, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[60px]">
                    {variant}
                  </span>
                ))}
                {(product.variants || product.sizes || []).length > 3 && (
                  <span className="text-xs text-gray-500">+{(product.variants || product.sizes || []).length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Add to Wishlist Button */}
          <Button
            onClick={handleAddToWishlist}
            className={`w-full btn-text py-1 lg:py-2 ${
              isWishlisted ? "bg-[#0077B6] hover:bg-[#005F8C] text-white" : "border border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white bg-white"
            }`}
            size="sm"
          >
            <Heart className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            {isWishlisted ? "Remove" : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
