"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Store, Package, TrendingUp, Search, CheckCircle, XCircle, Trash2 } from "lucide-react"

interface User {
  id: string
  phone: string
  name: string
  email: string
  role: string
  isVerified: boolean
  createdAt: string
}

interface Shop {
  id: string
  name: string
  description: string
  address: string
  isVerified: boolean
  ownerName: string
  createdAt: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalShops: 0,
    verifiedShops: 0,
    totalProducts: 0,
    totalOrders: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    
    if (!user || !token) {
      router.push("/")
      return
    }

    if (user.role !== "admin") {
      router.push("/home")
      return
    }

    fetchAdminData()
  }, [user, token, router, authLoading])

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      // Fetch shops
      const shopsResponse = await fetch("/api/admin/shops", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json()
        setShops(shopsData.shops)
      }

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        alert("User role updated successfully")
      }
    } catch (error) {
      alert("Failed to update user role")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their data.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const deletedUser = users.find(u => u.id === userId)
        setUsers(users.filter((u) => u.id !== userId))
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          totalMerchants: deletedUser?.role === 'merchant' ? prev.totalMerchants - 1 : prev.totalMerchants
        }))
        alert("User deleted successfully")
      }
    } catch (error) {
      alert("Failed to delete user")
    }
  }

  const verifyShop = async (shopId: string, isVerified: boolean) => {
    try {
      const response = await fetch("/api/admin/shops/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, isVerified }),
      })

      if (response.ok) {
        setShops(shops.map((s) => (s.id === shopId ? { ...s, isVerified } : s)))
        alert(`Shop ${isVerified ? "verified" : "unverified"} successfully`)
      }
    } catch (error) {
      alert("Failed to update shop verification")
    }
  }

  const deleteShop = async (shopId: string) => {
    if (!confirm("Are you sure you want to delete this shop? This will also delete all its products.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/shops?shopId=${shopId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const deletedShop = shops.find(s => s.id === shopId)
        setShops(shops.filter((s) => s.id !== shopId))
        setStats(prev => ({
          ...prev,
          totalShops: prev.totalShops - 1,
          verifiedShops: deletedShop?.isVerified ? prev.verifiedShops - 1 : prev.verifiedShops
        }))
        alert("Shop deleted successfully")
      }
    } catch (error) {
      alert("Failed to delete shop")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B4D8]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                onClick={() => router.push("/admin/analytics")}
                variant="outline"
                size="sm"
                className="border-pink-600 text-pink-600 hover:bg-pink-50 text-xs sm:text-sm"
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Analytics
              </Button>
              <Button onClick={() => router.push("/home")} variant="outline" size="sm" className="text-xs sm:text-sm">
                Back to Store
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-2 sm:mb-0" />
                <div className="sm:ml-3">
                  <p className="text-xs text-gray-600">Total Users</p>
                  <p className="text-sm sm:text-lg font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-2 sm:mb-0" />
                <div className="sm:ml-3">
                  <p className="text-xs text-gray-600">Merchants</p>
                  <p className="text-sm sm:text-lg font-bold">{stats.totalMerchants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mb-2 sm:mb-0" />
                <div className="sm:ml-3">
                  <p className="text-xs text-gray-600">Total Shops</p>
                  <p className="text-sm sm:text-lg font-bold">{stats.totalShops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-2 sm:mb-0" />
                <div className="sm:ml-3">
                  <p className="text-xs text-gray-600">Verified Shops</p>
                  <p className="text-sm sm:text-lg font-bold">{stats.verifiedShops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mb-2 sm:mb-0" />
                <div className="sm:ml-3">
                  <p className="text-xs text-gray-600">Products</p>
                  <p className="text-sm sm:text-lg font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 mb-2 sm:mb-0" />
                <div className="sm:ml-3">
                  <p className="text-xs text-gray-600">Orders</p>
                  <p className="text-sm sm:text-lg font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="shops" className="text-xs sm:text-sm">Shops</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="merchant">Merchant</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm sm:text-base">{user.name || "Unnamed User"}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{user.phone}</p>
                        {user.email && <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>}
                        <p className="text-xs text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Badge variant={user.isVerified ? "default" : "secondary"} className="text-xs w-fit">
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                            <SelectTrigger className="w-20 sm:w-24 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="merchant">Merchant</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user.id)}
                            className="p-2"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shops">
            <Card>
              <CardHeader>
                <CardTitle>Shop Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shops.map((shop) => (
                    <div key={shop.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm sm:text-base">{shop.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Owner: {shop.ownerName}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{shop.description}</p>
                        <p className="text-xs text-gray-500">{shop.address}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(shop.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Badge variant={shop.isVerified ? "default" : "secondary"} className="text-xs w-fit">
                          {shop.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        <div className="flex flex-wrap gap-2">
                          {!shop.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => verifyShop(shop.id, true)}
                              className="bg-green-600 hover:bg-green-700 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          {shop.isVerified && (
                            <Button size="sm" variant="destructive" onClick={() => verifyShop(shop.id, false)} className="text-xs">
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Unverify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteShop(shop.id)}
                            className="p-2"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Analytics charts coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Revenue charts coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
