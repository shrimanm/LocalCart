import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import twilio from "twilio"

// Simple OTP generation function
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  console.log("=== Send OTP API Called ===")

  try {
    // Check environment variables first
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI not configured")
      return NextResponse.json(
        { error: "Server configuration error", details: "Database not configured" },
        { status: 500 },
      )
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured")
      return NextResponse.json(
        { error: "Server configuration error", details: "JWT secret not configured" },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { phone } = body

    // Enhanced input validation
    if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 })
    }
    
    // Rate limiting (simple in-memory)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `otp-${clientIP}-${phone}`
    
    // Allow max 3 OTP requests per phone per 15 minutes
    if (typeof (global as any).otpRateLimit === 'undefined') {
      (global as any).otpRateLimit = new Map()
    }
    
    const now = Date.now()
    const existing = (global as any).otpRateLimit.get(rateLimitKey)
    
    if (existing && existing.count >= 3 && (now - existing.timestamp) < 15 * 60 * 1000) {
      return NextResponse.json({ error: "Too many OTP requests. Please try again later." }, { status: 429 })
    }
    
    // Update rate limit
    if (!existing || (now - existing.timestamp) >= 15 * 60 * 1000) {
      (global as any).otpRateLimit.set(rateLimitKey, { count: 1, timestamp: now })
    } else {
      (global as any).otpRateLimit.set(rateLimitKey, { count: existing.count + 1, timestamp: existing.timestamp })
    }

    const db = await connectToDatabase()
    console.log("MongoDB connected successfully")

    // Generate OTP (in production, use a proper OTP service)
    const otp = process.env.NODE_ENV === "development" ? "123456" : generateOTP()

    // Store OTP in database with expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await db.collection("otp_sessions").updateOne(
      { phone },
      {
        $set: {
          phone,
          otp,
          expiresAt,
          attempts: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    console.log("Generated OTP:", otp, "for phone:", phone)

    // Send OTP via SMS service
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        
        await client.messages.create({
          body: `Your LocalCart verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}`
        })
        
        console.log(`SMS sent successfully to +91${phone}`)
      } catch (smsError) {
        console.error('SMS sending failed:', smsError)
        // Return error if SMS fails in production
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 })
        }
      }
    } else {
      console.log(`Development mode - OTP for ${phone}: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Only include OTP in development
      ...(process.env.NODE_ENV === "development" && { otp }),
    })
  } catch (dbError) {
    console.error("Database operation error:", dbError)
    return NextResponse.json(
      {
        error: "Database operation failed",
        details: dbError instanceof Error ? dbError.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
