import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDatabase()
    
    // Get unique brands from products
    const brands = await db.collection("products").distinct("brand", { isActive: true })
    
    // Get unique categories from products
    const categories = await db.collection("products").distinct("category", { isActive: true })
    
    // Get unique shop names by joining products with shops table
    const shops = await db.collection("products").aggregate([
      { $match: { isActive: true } },
      { $lookup: {
          from: "shops",
          localField: "shopId",
          foreignField: "_id",
          as: "shopInfo"
        }
      },
      { $unwind: "$shopInfo" },
      { $group: { _id: "$shopInfo.name" } },
      { $sort: { _id: 1 } }
    ]).toArray()
    
    const shopNames = shops.map(shop => shop._id).filter(Boolean)
    
    console.log('Found brands:', brands.length, 'Found shops:', shopNames.length, 'Found categories:', categories.length)
    
    return NextResponse.json({
      brands: brands.filter(Boolean).sort(),
      shops: shopNames,
      categories: categories.filter(Boolean).sort()
    })
  } catch (error) {
    console.error("Error fetching filter options:", error)
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 })
  }
}