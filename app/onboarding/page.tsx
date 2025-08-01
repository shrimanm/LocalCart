"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Heart, Bell } from "lucide-react"

const interests = [
  "Men's Fashion",
  "Women's Fashion",
  "Kids Fashion",
  "Footwear",
  "Accessories",
  "Beauty & Personal Care",
  "Home & Living",
  "Sports & Fitness",
  "Electronics",
  "Books & Media",
]

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
]

export default function OnboardingPage() {
  const { user, token, updateUser, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    city: "",
    interests: [] as string[],
    notifications: {
      email: true,
      sms: true,
      push: true,
      offers: true,
    },
  })

  useEffect(() => {
    if (!user || !token) {
      router.push("/")
      return
    }

    // Pre-fill existing data
    if (user.name) setFormData((prev) => ({ ...prev, name: user.name || "" }))
    if (user.email) setFormData((prev) => ({ ...prev, email: user.email || "" }))
    if (user.age) setFormData((prev) => ({ ...prev, age: user.age?.toString() || "" }))
    if (user.gender) setFormData((prev) => ({ ...prev, gender: user.gender || "" }))
    if (user.city) setFormData((prev) => ({ ...prev, city: user.city || "" }))
    if (user.interests) setFormData((prev) => ({ ...prev, interests: user.interests || [] }))
  }, [user, token, router])

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          age: formData.age ? Number.parseInt(formData.age) : undefined,
          gender: formData.gender,
          city: formData.city,
          interests: formData.interests,
          notifications: formData.notifications,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        updateUser(data.user)

        // Redirect based on user role
        if (user?.role === "merchant") {
          router.push("/merchant")
        } else if (user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/home")
        }
      } else {
        console.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== ""
      case 2:
        return formData.interests.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => { logout(); router.push("/"); }} className="text-[#00B4D8]">
              ← Back
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Kshop Logo" className="h-8 w-8" />
              <div className="text-3xl font-black text-red-700">Kshop</div>
            </div>
            <div className="w-16"></div>
          </div>
          <CardTitle className="text-2xl">Welcome to Myntra!</CardTitle>
          <CardDescription>Let's personalize your shopping experience</CardDescription>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i <= step ? "bg-[#00B4D8]" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <User className="h-5 w-5 text-[#00B4D8]" />
                <span>Basic Information</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="13"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Heart className="h-5 w-5 text-[#00B4D8]" />
                <span>What interests you?</span>
              </div>

              <p className="text-gray-600">Select your interests to get personalized recommendations</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map((interest) => (
                  <div
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.interests.includes(interest)
                        ? "border-[#00B4D8] bg-cyan-50 text-[#00B4D8]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-medium text-center">{interest}</div>
                  </div>
                ))}
              </div>

              {formData.interests.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Interests:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Bell className="h-5 w-5 text-[#00B4D8]" />
                <span>Notification Preferences</span>
              </div>

              <p className="text-gray-600">Choose how you'd like to receive updates from us</p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="email-notifications"
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, email: !!checked },
                      })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-gray-500">Get order updates and important information via email</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sms-notifications"
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, sms: !!checked },
                      })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="sms-notifications" className="text-sm font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-xs text-gray-500">Receive order updates and delivery notifications via SMS</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="push-notifications"
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, push: !!checked },
                      })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-gray-500">Get instant notifications on your device</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="offers-notifications"
                    checked={formData.notifications.offers}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, offers: !!checked },
                      })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="offers-notifications" className="text-sm font-medium">
                      Offers & Promotions
                    </Label>
                    <p className="text-xs text-gray-500">Stay updated with the latest deals and offers</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end pt-6">

            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="bg-[#00B4D8] hover:bg-[#0096C7]">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-[#00B4D8] hover:bg-[#0096C7]">
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
