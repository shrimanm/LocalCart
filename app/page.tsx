"use client"

import { useEffect } from "react"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import RouteGuard from "@/components/auth/route-guard"
import LoginForm from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"
import BannerCarousel from "@/components/home/banner-carousel"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Always redirect to home after login
      router.push("/home")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If user is logged in, redirect happens in useEffect
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex flex-col items-center justify-center mb-4">
              <img src="/logo.png" alt="LocalCart Logo" className="h-16 w-16 mb-4 rounded-md" />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-center">
                Welcome to <span className="text-red-700 font-black">LocalCart</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the latest fashion trends, shop from top brands, and express your unique style
            </p>
          </div>

          <div className="mb-12">
            <BannerCarousel />
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="max-w-md mx-auto px-4 pb-12">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-0">
            <LoginForm />
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LocalCart?</h2>
            <p className="text-gray-600">Experience the best of fashion shopping</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">Endless variety from top brands</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
              <p className="text-gray-600">Simple and intuitive shopping experience</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">Authentic products from trusted brands</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
