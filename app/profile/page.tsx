"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { THEME_CLASSES } from "@/lib/theme-constants"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, LogOut, Heart, Package, Store, Shield } from "lucide-react"
import BottomNav from "@/components/ui/bottom-nav"

export default function ProfilePage() {
  const { user, token, logout, updateUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    city: "",
  })


  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/")
      return
    }

    if (user && token) {
      fetchUserProfile()
      
      // Check for role updates every 30 seconds
      const interval = setInterval(() => {
        checkForRoleUpdate()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user, token, authLoading])

  const fetchUserProfile = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          age: userData.age?.toString() || "",
          gender: userData.gender || "",
          city: userData.city || "",
        })
        
        // Update user context if role has changed
        if (userData.role !== user?.role) {
          updateUser(userData)
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }
  
  const checkForRoleUpdate = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        
        // Update user context if role has changed
        if (userData.role !== user?.role) {
          console.log('Role updated from', user?.role, 'to', userData.role)
          updateUser(userData)
        }
      }
    } catch (error) {
      console.error("Error checking role update:", error)
    }
  }



  const handleSave = async () => {
    if (!token) return

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
          email: formData.email || null,
          age: formData.age ? Number.parseInt(formData.age) : null,
          gender: formData.gender,
          city: formData.city,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEditing(false)
        // Update user data in context with the response
        if (data.user) {
          updateUser(data.user)
        }
        // Re-fetch profile data to update UI
        await fetchUserProfile()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00B4D8]"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-cyan-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant={editing ? "outline" : "default"}
                    onClick={() => (editing ? setEditing(false) : setEditing(true))}
                  >
                    {editing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={user.phone} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Phone number cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      disabled={!editing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-[#00B4D8] hover:bg-[#0096C7]">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verified</span>
                  <Badge variant={user.isVerified ? "default" : "secondary"}>
                    {user.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="outline">{user.role.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/wishlist")}>
                  <Heart className="h-4 w-4 mr-2" />
                  My Wishlist
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={checkForRoleUpdate}>
                  <User className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/booked")}>
                  <Package className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/profile/addresses")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  My Addresses
                </Button>
                <Separator className="my-2" />
                {user.role === "admin" && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#00B4D8] hover:text-[#0096C7] hover:bg-cyan-50"
                      onClick={() => router.push("/admin")}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#00B4D8] hover:text-[#0096C7] hover:bg-cyan-50"
                      onClick={() => router.push("/merchant")}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      Merchant Dashboard
                    </Button>
                  </>
                )}
                {user.role === "merchant" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#00B4D8] hover:text-[#0096C7] hover:bg-cyan-50"
                    onClick={() => router.push("/merchant")}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Merchant Dashboard
                  </Button>
                )}
                {user.role === "user" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#00B4D8] hover:text-[#0096C7] hover:bg-cyan-50"
                    onClick={() => router.push("/merchant/register")}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Become a Merchant
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
