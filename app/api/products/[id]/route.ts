import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { ObjectId } from "mongodb"
import { validateData, ProductSchema } from "@/lib/validation"
import { extractTokenFromHeader, verifyToken, requireRole } from "@/lib/auth"
import { handleError, AuthenticationError, NotFoundError } from "@/lib/errors"
import { cache, cacheKeys, setCachedData, getCachedData } from "@/lib/cache"
import logger from "@/lib/logger"



export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check cache first
    const cacheKey = cacheKeys.product(params.id)
    const cachedProduct = getCachedData(cacheKey)
    
    if (cachedProduct) {
      return NextResponse.json({ product: cachedProduct })
    }

    const db = await connectToDatabase()

    const product = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
      isActive: true,
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get shop information
    const shop = await db.collection("shops").findOne({ _id: product.shopId })

    const transformedProduct = {
      ...product,
      id: product._id.toString(),
      shopId: product.shopId.toString(),
      shopName: shop?.name || "Unknown Shop",
      _id: undefined,
    }

    // Cache the product for 5 minutes
    setCachedData(cacheKey, transformedProduct, 300)
    
    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    logger.error('Get product error', { error, productId: params.id })
    const { message, statusCode } = handleError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)
    const decoded = verifyToken(token)
    
    requireRole(decoded.role, ['merchant', 'admin'])
    
    const body = await request.json()
    const validation = validateData(ProductSchema, body)
    
    if (!validation.success) {
      logger.warn('Product update validation failed', { error: validation.error, userId: decoded.userId })
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const productData = validation.data
    const db = await connectToDatabase()

    // Verify product exists and belongs to merchant
    const existingProduct = await db.collection("products").findOne({
      _id: new ObjectId(params.id)
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update product
    const updateData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      originalPrice: productData.originalPrice,
      category: productData.category,
      brand: productData.brand,
      images: productData.images,
      sizes: productData.sizes,
      variants: productData.variants,
      variantType: productData.variantType,
      colors: productData.colors,
      stock: productData.stock,
      isActive: productData.isActive,
      updatedAt: new Date()
    }

    await db.collection("products").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    // Invalidate cache
    cache.delete(cacheKeys.product(params.id))
    
    logger.info('Product updated successfully', { productId: params.id, userId: decoded.userId })
    return NextResponse.json({ success: true, message: "Product updated successfully" })
  } catch (error) {
    logger.error('Update product error', { error, productId: params.id })
    const { message, statusCode } = handleError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)
    const decoded = verifyToken(token)
    
    requireRole(decoded.role, ['merchant', 'admin'])

    const db = await connectToDatabase()

    // Verify product exists and belongs to merchant
    const existingProduct = await db.collection("products").findOne({
      _id: new ObjectId(params.id)
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    await db.collection("products").deleteOne({ _id: new ObjectId(params.id) })
    
    // Invalidate cache
    cache.delete(cacheKeys.product(params.id))
    
    logger.info('Product deleted successfully', { productId: params.id, userId: decoded.userId })
    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    logger.error('Delete product error', { error, productId: params.id })
    const { message, statusCode } = handleError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
