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
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = {
      id: user._id.toString(),
      phone: user.phone,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      city: user.city,
      interests: user.interests || [],
      role: user.role,
      isVerified: user.isVerified,
      notifications: user.notifications || {
        email: true,
        sms: true,
        push: true,
        offers: true,
      },
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const updateData = await request.json()
    const db = await connectToDatabase()

    // Update user profile
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get updated user
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    const userData = {
      id: user!._id.toString(),
      phone: user!.phone,
      name: user!.name,
      email: user!.email,
      age: user!.age,
      gender: user!.gender,
      city: user!.city,
      interests: user!.interests || [],
      role: user!.role,
      isVerified: user!.isVerified,
      notifications: user!.notifications || {
        email: true,
        sms: true,
        push: true,
        offers: true,
      },
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
