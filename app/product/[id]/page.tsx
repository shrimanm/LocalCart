"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/app/providers"
import { Heart, Star, Eye, Calendar, CheckCircle, Share2, ArrowLeft } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import BottomNav from "@/components/ui/bottom-nav"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedVariant, setSelectedVariant] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    fetchProduct()
    fetchReviews()
    checkWishlistStatus()
  }, [params.id, user])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data.product)
        if (data.product.sizes && data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0])
        }
        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariant(data.product.variants[0])
        }
        if (data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0])
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const checkWishlistStatus = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        const isInWishlist = data.items.some((item: any) => item.productId === params.id)
        setIsWishlisted(isInWishlist)
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const handleSubmitReview = async () => {
    if (!token || !product) return

    setSubmittingReview(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (response.ok) {
        setShowReviewForm(false)
        setNewReview({ rating: 5, comment: "" })
        fetchReviews()
        fetchProduct() // Refresh product to update rating
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!token || !product) return

    setAddingToWishlist(true)
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsWishlisted(data.action === "added")
        // Trigger wishlist count update after state update
        setTimeout(() => {
          window.dispatchEvent(new Event('wishlist-updated'))
        }, 100)
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    } finally {
      setAddingToWishlist(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && selectedImage < product!.images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  const handleToggleWishlist = async () => {
    if (!token || !product) return

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsWishlisted(data.action === "added")
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00B4D8]"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push("/home")}>Go Back to Home</Button>
        </div>
      </div>
    )
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-cyan-50 pb-20">
      {/* Back Button */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Navigation arrows for web */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70"
                  >
                    →
                  </button>
                </>
              )}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <Image
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain select-none"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Image indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        selectedImage === index ? "bg-[#00B4D8] scale-125" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-white transition-all duration-200 ${
                      selectedImage === index ? "border-[#00B4D8] shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <Image 
                        src={image || "/placeholder.svg"} 
                        alt="" 
                        fill
                        className="object-contain" 
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                  <Badge variant="destructive">{discount}% OFF</Badge>
                </>
              )}
            </div>

            {/* Variant Selection */}
            {((product.variants && product.variants.length > 0) || (product.sizes && product.sizes.length > 0)) && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {product.variantType ? product.variantType.charAt(0).toUpperCase() + product.variantType.slice(1) : 'Size'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(product.variants || product.sizes || []).map((variant) => (
                    <Button
                      key={variant}
                      variant={(selectedVariant || selectedSize) === variant ? "default" : "outline"}
                      onClick={() => {
                        if (product.variants) {
                          setSelectedVariant(variant)
                        } else {
                          setSelectedSize(variant)
                        }
                      }}
                      className="min-w-[3rem]"
                    >
                      {variant}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className={`flex-1 ${isWishlisted ? 'bg-[#0077B6] hover:bg-[#005F8C] text-white' : 'border border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white bg-white'}`}
              >
                <Heart className="h-5 w-5 mr-2" />
                {addingToWishlist ? "Adding..." : isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
              <Button variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">View Details</p>
                <p className="text-xs text-gray-500">Full Info</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Book Now</p>
                <p className="text-xs text-gray-500">Reserve Item</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Quality Assured</p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
            </div>

            <Separator />

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-medium mb-3">Product Details</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)} 
              variant="outline"
              className="border-2 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white transition-colors"
            >
              Write Review
            </Button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white p-6 rounded-lg border mb-6">
              <h3 className="text-lg font-medium mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`text-2xl ${
                          star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    rows={4}
                    placeholder="Share your experience with this product..."
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="bg-[#0077B6] hover:bg-[#005F8C]"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#0077B6] rounded-full flex items-center justify-center text-white font-medium">
                      {review.userInitial}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{review.userName}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= review.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
