import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Get booked items with product details
    const bookedItems = await db
      .collection("booked")
      .aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "shops",
            localField: "product.shopId",
            foreignField: "_id",
            as: "shop",
          },
        },
        { $unwind: { path: "$shop", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            productId: 1,
            createdAt: 1,
            product: {
              _id: 1,
              name: 1,
              price: 1,
              originalPrice: 1,
              images: 1,
              brand: 1,
              rating: 1,
              reviewCount: 1,
              stock: 1,
              category: 1,
            },
            shopName: "$shop.name",
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    // Transform the data
    const transformedItems = bookedItems.map((item) => ({
      id: item._id.toString(),
      productId: item.productId.toString(),
      product: {
        ...item.product,
        id: item.product._id.toString(),
        _id: undefined,
        shopName: item.shopName,
      },
      createdAt: item.createdAt,
    }))

    return NextResponse.json({
      items: transformedItems,
      count: transformedItems.length,
    })
  } catch (error) {
    console.error("Get booked items error:", error)
    return NextResponse.json({ error: "Failed to get booked items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if product exists
    const product = await db.collection("products").findOne({
      _id: new ObjectId(productId),
      isActive: true,
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item is already booked
    const existingItem = await db.collection("booked").findOne({
      userId: new ObjectId(decoded.userId),
      productId: new ObjectId(productId),
    })

    if (existingItem) {
      // Remove from booked
      await db.collection("booked").deleteOne({
        userId: new ObjectId(decoded.userId),
        productId: new ObjectId(productId),
      })

      return NextResponse.json({
        success: true,
        action: "removed",
        message: "Booking canceled",
      })
    } else {
      // Add to booked
      await db.collection("booked").insertOne({
        userId: new ObjectId(decoded.userId),
        productId: new ObjectId(productId),
        createdAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        action: "added",
        message: "Item booked successfully",
      })
    }
  } catch (error) {
    console.error("Toggle booking error:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}