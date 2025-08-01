"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Package, TrendingUp, Users, Plus, Edit, Eye, Trash2 } from "lucide-react"
import RouteGuard from "@/components/auth/route-guard"
import { formatPrice } from "@/lib/utils"
import { Notification, useNotification } from "@/components/ui/notification"

interface Shop {
  id: string
  name: string
  description: string
  address: string
  isVerified: boolean
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  isActive: boolean
  category: string
}

interface Order {
  id: string
  orderId: string
  totalAmount: number
  status: string
  createdAt: string
}

function MerchantDashboardContent() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  useEffect(() => {
    if (authLoading) return
    
    if (!user || !token) {
      router.push("/")
      return
    }

    if (user.role !== "merchant" && user.role !== "admin") {
      router.push("/merchant/register")
      return
    }

    fetchDashboardData()
  }, [user, token, router, authLoading])

  // Update stats whenever products or orders change
  useEffect(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((p) => p.isActive).length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    setStats({
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
    })
  }, [products, orders])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const deletedProduct = products.find(p => p.id === productId)
        // Update products list
        setProducts(products.filter(p => p.id !== productId))
        // Update stats immediately
        setStats(prev => ({
          ...prev,
          totalProducts: prev.totalProducts - 1,
          activeProducts: deletedProduct?.isActive ? prev.activeProducts - 1 : prev.activeProducts
        }))
      } else {
        showNotification('Failed to delete product', 'error')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification('Error deleting product', 'error')
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch shop details
      const shopResponse = await fetch("/api/merchant/shop", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (shopResponse.ok) {
        const shopData = await shopResponse.json()
        setShop(shopData.shop)
      }

      // Fetch products
      const productsResponse = await fetch("/api/merchant/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products)
      }

      // Fetch orders
      const ordersResponse = await fetch("/api/merchant/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders)
      }

      // Stats will be calculated in useEffect when data changes
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00B4D8]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={hideNotification}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-0 sm:h-16">
            <div className="flex items-center mb-4 sm:mb-0">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-[#00B4D8] mr-2 sm:mr-3" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Merchant Dashboard</h1>
                {shop && <p className="text-xs sm:text-sm text-gray-600">{shop.name}</p>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button onClick={() => router.push("/home")} variant="outline" size="sm" className="text-xs sm:text-sm">
                User Dashboard
              </Button>
              <Button
                onClick={() => router.push("/merchant/analytics")}
                variant="outline"
                size="sm"
                className="border-[#00B4D8] text-[#00B4D8] hover:bg-cyan-50 text-xs sm:text-sm"
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Analytics
              </Button>
              <Button onClick={() => router.push("/merchant/products/add")} className="bg-[#00B4D8] hover:bg-[#0096C7]" size="sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Shop Status */}
        {shop && !shop.isVerified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800">
                Your shop is pending verification. You can add products, but they won't be visible to customers until
                verification is complete.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 sm:mb-0" />
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[#00B4D8] mb-2 sm:mb-0" />
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.activeProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 sm:mb-0" />
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mb-2 sm:mb-0" />
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="shop">Shop Details</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-4">Add your first product to start selling</p>
                    <Button
                      onClick={() => router.push("/merchant/products/add")}
                      className="bg-[#00B4D8] hover:bg-[#0096C7]"
                    >
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm sm:text-base">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{product.category}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                            <span className="font-bold text-sm sm:text-base">{formatPrice(product.price)}</span>
                            <span className="text-xs sm:text-sm text-gray-600">Stock: {product.stock}</span>
                            <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2 self-end sm:self-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/product/${product.id}`)}
                            title="View Product"
                            className="p-2"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/merchant/products/edit/${product.id}?data=${encodeURIComponent(JSON.stringify(product))}`)}
                            title="Edit Product"
                            className="p-2"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete Product"
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">No orders yet</h3>
                    <p className="text-gray-500">Orders will appear here when customers make purchases</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.totalAmount)}</p>
                          <Badge variant={order.status === "confirmed" ? "default" : "secondary"}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shop">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent>
                {shop ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Shop Name</Label>
                      <p className="text-gray-600">{shop.name}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Description</Label>
                      <p className="text-gray-600">{shop.description || "No description provided"}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Address</Label>
                      <p className="text-gray-600">{shop.address}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Verification Status</Label>
                      <div className="mt-1">
                        <Badge variant={shop.isVerified ? "default" : "secondary"}>
                          {shop.isVerified ? "Verified" : "Pending Verification"}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline">Edit Shop Details</Button>
                  </div>
                ) : (
                  <p className="text-gray-500">No shop information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function MerchantDashboard() {
  return (
    <RouteGuard requiredRole="merchant">
      <MerchantDashboardContent />
    </RouteGuard>
  )
}
