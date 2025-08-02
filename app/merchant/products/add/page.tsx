"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ImageUpload from "@/components/ui/image-upload"
import { ArrowLeft, Package, Tag, Palette, Ruler } from "lucide-react"

const categories = [
  "Men's Clothing",
  "Women's Clothing",
  "Kids Clothing",
  "Footwear",
  "Accessories",
  "Beauty & Personal Care",
  "Home & Living",
  "Sports & Fitness",
  "Electronics",
  "Books & Media",
]

const subcategories = {
  "Men's Clothing": ["T-Shirts", "Shirts", "Jeans", "Trousers", "Suits", "Ethnic Wear", "Innerwear"],
  "Women's Clothing": ["Tops", "Dresses", "Jeans", "Sarees", "Kurtas", "Ethnic Wear", "Innerwear"],
  "Kids Clothing": ["Boys Clothing", "Girls Clothing", "Baby Clothing", "School Uniforms"],
  Footwear: ["Casual Shoes", "Formal Shoes", "Sports Shoes", "Sandals", "Boots"],
  Accessories: ["Bags", "Watches", "Jewelry", "Sunglasses", "Belts"],
  "Beauty & Personal Care": ["Skincare", "Makeup", "Hair Care", "Fragrances", "Personal Care"],
  "Home & Living": ["Bedding", "Bath", "Kitchen", "Decor", "Furniture"],
  "Sports & Fitness": ["Sportswear", "Equipment", "Supplements", "Outdoor Gear"],
  Electronics: ["Mobile Accessories", "Gadgets", "Audio", "Gaming"],
  "Books & Media": ["Books", "Music", "Movies", "Games"],
}

const commonSizes = {
  "Men's Clothing": ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  "Women's Clothing": ["XS", "S", "M", "L", "XL", "XXL"],
  "Kids Clothing": ["0-3M", "3-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"],
  Footwear: ["6", "7", "8", "9", "10", "11", "12"],
  default: ["One Size", "S", "M", "L", "XL"],
}

const commonColors = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Orange",
  "Brown",
  "Grey",
  "Navy",
  "Maroon",
  "Beige",
  "Cream",
]

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    brand: "",
    images: [] as string[],
    sizes: [] as string[],
    variants: [] as string[],
    variantType: "size" as string,
    colors: [] as string[],
    stock: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customSize, setCustomSize] = useState("")
  const [customColor, setCustomColor] = useState("")

  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || (user.role !== "merchant" && user.role !== "admin")) {
      router.push("/")
    }
  }, [user, router])

  const handleVariantToggle = (variant: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.includes(variant) ? prev.variants.filter((v) => v !== variant) : [...prev.variants, variant],
    }))
  }

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter((c) => c !== color) : [...prev.colors, color],
    }))
  }

  const addCustomVariant = () => {
    if (customSize && !formData.variants.includes(customSize)) {
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, customSize],
      }))
      setCustomSize("")
    }
  }

  const getVariantOptions = (type: string): string[] => {
    switch (type) {
      case "size":
        return ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"]
      case "storage":
        return ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"]
      case "color":
        return ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Gray", "Brown"]
      case "capacity":
        return ["500ml", "750ml", "1L", "1.5L", "2L", "100g", "250g", "500g", "1kg"]
      default:
        return []
    }
  }

  const addCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, customColor],
      }))
      setCustomColor("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category || formData.images.length === 0) {
      setError("Please fill in all required fields and add at least one image")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/merchant/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
          stock: Number.parseInt(formData.stock) || 0,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/merchant")
      } else {
        setError(data.error || "Failed to add product")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const availableSizes = commonSizes[formData.category as keyof typeof commonSizes] || commonSizes.default

  return (
    <div className="min-h-screen bg-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Create a new product listing for your shop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Enter brand name"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category & Classification
              </CardTitle>
              <CardDescription>Choose the appropriate category for your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.category && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories[formData.category as keyof typeof subcategories]?.map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images *</CardTitle>
              <CardDescription>Upload high-quality images of your product (up to 5 images)</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                maxFiles={5}
              />
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Product Variants
              </CardTitle>
              <CardDescription>Configure variants for your product (size, storage, color, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Variant Type</Label>
                <Select value={formData.variantType} onValueChange={(value) => setFormData({ ...formData, variantType: value, variants: [] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="capacity">Capacity</SelectItem>
                    <SelectItem value="none">No Variants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.variantType && formData.variantType !== "none" && (
                <>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {getVariantOptions(formData.variantType).map((variant) => (
                      <Button
                        key={variant}
                        type="button"
                        variant={formData.variants.includes(variant) ? "default" : "outline"}
                        onClick={() => handleVariantToggle(variant)}
                        className="h-12 text-xs"
                      >
                        {variant}
                      </Button>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add custom ${formData.variantType}`}
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomVariant())}
                    />
                    <Button type="button" onClick={addCustomVariant}>
                      Add
                    </Button>
                  </div>

                  {formData.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.variants.map((variant) => (
                        <Badge key={variant} variant="secondary" className="px-3 py-1">
                          {variant}
                          <button
                            type="button"
                            onClick={() => handleVariantToggle(variant)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Available Colors
              </CardTitle>
              <CardDescription>Select all available colors for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {commonColors.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    variant={formData.colors.includes(color) ? "default" : "outline"}
                    onClick={() => handleColorToggle(color)}
                    className="h-12"
                  >
                    {color}
                  </Button>
                ))}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomColor())}
                />
                <Button type="button" onClick={addCustomColor}>
                  Add
                </Button>
              </div>

              {formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <Badge key={color} variant="secondary" className="px-3 py-1">
                      {color}
                      <button
                        type="button"
                        onClick={() => handleColorToggle(color)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white shadow-lg">
              {loading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
