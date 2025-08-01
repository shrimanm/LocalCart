"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, ArrowLeft } from "lucide-react"
import { Notification, useNotification } from "@/components/ui/notification"

export default function MerchantRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    locationUrl: "",
    contactDetails: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, token } = useAuth()
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  useEffect(() => {
    if (!user || !token) {
      router.push("/")
      return
    }

    if (user.role === "merchant") {
      router.push("/merchant")
      return
    }
  }, [user, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.contactDetails) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/merchant/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification("Shop registered successfully! Redirecting...", "success")
        // Force refresh to update user context
        setTimeout(() => {
          window.location.href = "/profile"
        }, 1500)
      } else {
        setError(data.error || "Failed to register shop")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={hideNotification}
      />
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/profile")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-[#00B4D8]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#00B4D8]">Register Your Shop</CardTitle>
            <CardDescription>
              Fill in the details below to register your shop and start selling on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your shop name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Shop Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your shop and what you sell"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Shop Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete shop address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationUrl">Location URL (Google Maps)</Label>
                <Input
                  id="locationUrl"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.locationUrl}
                  onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactDetails">Contact Details *</Label>
                <Input
                  id="contactDetails"
                  type="text"
                  placeholder="Phone number, email, etc."
                  value={formData.contactDetails}
                  onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full bg-[#00B4D8] hover:bg-[#0096C7]">
                {loading ? "Registering..." : "Register Shop"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
