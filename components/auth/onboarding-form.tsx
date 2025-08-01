"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Users, MapPin, Heart, Bell, ArrowLeft } from "lucide-react"
import { useBackButton } from "@/hooks/useBackButton"

const interests = [
  "Men's Fashion",
  "Women's Fashion",
  "Kids Fashion",
  "Footwear",
  "Accessories",
  "Beauty",
  "Home & Living",
  "Sports",
  "Electronics",
  "Books",
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
  "Other",
]

export default function OnboardingForm() {
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
      sms: false,
      push: true,
      offers: true,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { token, user, login, logout } = useAuth()
  const router = useRouter()

  const handleBackToLogin = () => {
    logout()
    router.push("/")
  }

  // Handle back button behavior
  const handleCustomBack = () => {
    if (step > 1) {
      handleBack()
    } else {
      handleBackToLogin()
    }
  }

  const { goBack } = useBackButton({
    onBack: handleCustomBack,
    preventExit: true
  })

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.age || !formData.gender) {
        setError("Please fill in all required fields")
        return
      }
    }
    setError("")
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          age: Number.parseInt(formData.age),
          gender: formData.gender,
          city: formData.city,
          interests: formData.interests,
          notifications: formData.notifications,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        login(token!, data.user)
        router.push("/home")
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-[#00B4D8]" />
        </div>
        <h3 className="text-xl font-semibold">Basic Information</h3>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email (Optional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Age *
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              min="13"
              max="100"
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gender *
            </Label>
            <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            City
          </Label>
          <Select onValueChange={(value) => setFormData({ ...formData, city: value })}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-[#00B4D8]" />
        </div>
        <h3 className="text-xl font-semibold">Your Interests</h3>
        <p className="text-gray-600">Help us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <Label>What are you interested in? (Select multiple)</Label>
        <div className="grid grid-cols-2 gap-3">
          {interests.map((interest) => (
            <div
              key={interest}
              onClick={() => handleInterestToggle(interest)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                formData.interests.includes(interest)
                  ? "border-[#00B4D8] bg-cyan-50 text-[#00B4D8]"
                  : "border-gray-200 hover:border-cyan-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{interest}</span>
                {formData.interests.includes(interest) && (
                  <Badge variant="secondary" className="bg-cyan-100 text-[#00B4D8]">
                    ✓
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="h-8 w-8 text-[#00B4D8]" />
        </div>
        <h3 className="text-xl font-semibold">Notification Preferences</h3>
        <p className="text-gray-600">Choose how you'd like to hear from us</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Order updates and account info</p>
            </div>
            <Checkbox
              checked={formData.notifications.email}
              onCheckedChange={(checked) => handleNotificationChange("email", checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Important order updates</p>
            </div>
            <Checkbox
              checked={formData.notifications.sms}
              onCheckedChange={(checked) => handleNotificationChange("sms", checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-600">App notifications</p>
            </div>
            <Checkbox
              checked={formData.notifications.push}
              onCheckedChange={(checked) => handleNotificationChange("push", checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Offers & Promotions</h4>
              <p className="text-sm text-gray-600">Deals and special offers</p>
            </div>
            <Checkbox
              checked={formData.notifications.offers}
              onCheckedChange={(checked) => handleNotificationChange("offers", checked as boolean)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <div className="w-full max-w-lg">
        {/* Top Back Button - Go to Login */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToLogin}
          className="mb-4 p-2 hover:bg-cyan-100 text-[#00B4D8]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
        
        <Card className="w-full shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#00B4D8]">Complete Your Profile</CardTitle>
          <CardDescription>Step {step} of 3 - Let's personalize your LocalCart experience</CardDescription>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-[#00B4D8] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={
              step === 3
                ? handleSubmit
                : (e) => {
                    e.preventDefault()
                    handleNext()
                  }
            }
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="px-6 bg-transparent">
                  Back
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading}
                className={`bg-[#00B4D8] hover:bg-[#0096C7] px-6 ${step === 1 ? "ml-auto" : ""}`}
              >
                {loading ? "Saving..." : step === 3 ? "Complete Profile" : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
