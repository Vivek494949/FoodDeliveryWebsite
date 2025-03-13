"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, Users, Store, ShoppingCart, Star, BarChart2, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signOut } from "next-auth/react"

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    averageRating: 0,
  })
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
  }

  const [users, setUsers] = useState<User[]>([])
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
    }

    // Check if user is admin
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/home")
    }
    

    const fetchDashboardData = async () => {
      if (session?.user?.id && session?.user?.role === "admin") {
        try {
          // Fetch dashboard stats
          const statsResponse = await fetch("/api/admin/stats")
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }

          // Fetch data based on active tab
          if (activeTab === "users" || activeTab === "overview") {
            const usersResponse = await fetch("/api/admin/users")
            if (usersResponse.ok) {
              const usersData = await usersResponse.json()
              setUsers(usersData)
            }
          }

          if (activeTab === "restaurants" || activeTab === "overview") {
            const restaurantsResponse = await fetch("/api/admin/restaurants")
            if (restaurantsResponse.ok) {
              const restaurantsData = await restaurantsResponse.json()
              setRestaurants(restaurantsData)
            }
          }

          if (activeTab === "orders" || activeTab === "overview") {
            const ordersResponse = await fetch("/api/admin/orders")
            if (ordersResponse.ok) {
              const ordersData = await ordersResponse.json()
              setOrders(ordersData)
            }
          }

          if (activeTab === "reviews" || activeTab === "overview") {
            const reviewsResponse = await fetch("/api/admin/reviews")
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json()
              setReviews(reviewsData)
            }
          }
        } catch (error) {
          console.error("Error fetching admin data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchDashboardData()
    }
  }, [status, router, session, activeTab])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card hidden md:block">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link href="/home" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">FoodExpress</span>
            </Link>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Overview
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "users" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "restaurants" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("restaurants")}
                >
                  <Store className="mr-2 h-4 w-4" />
                  Restaurants
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("orders")}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Orders
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "reviews" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("reviews")}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Reviews
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden w-full border-b bg-card p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/home" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">FoodExpress</span>
          </Link>

          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mt-4">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" onClick={() => setActiveTab("users")}>
            Users
          </TabsTrigger>
          <TabsTrigger value="restaurants" onClick={() => setActiveTab("restaurants")}>
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="orders" onClick={() => setActiveTab("orders")}>
            Orders
          </TabsTrigger>
        </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalRestaurants}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Overview of the latest activities on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Activity data would be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">User Management</h1>
              <Button>Add User</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Email</th>
                        <th className="py-3 px-4 text-left font-medium">Role</th>
                        <th className="py-3 px-4 text-left font-medium">Verified</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="py-3 px-4">{user.firstName} {user.lastName}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.role}</td>
                            <td className="py-3 px-4">{user.isVerified ? "Yes" : "No"}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline">Edit</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Restaurant Management</h1>
              <Button>Add Restaurant</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Restaurants</CardTitle>
                <CardDescription>Manage restaurant listings and details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Owner</th>
                        <th className="py-3 px-4 text-left font-medium">Location</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            No restaurants found
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            Restaurant data would be displayed here
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-8">
            <h1 className="text-3xl font-bold">Order Management</h1>

            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Track and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Order ID</th>
                        <th className="py-3 px-4 text-left font-medium">Customer</th>
                        <th className="py-3 px-4 text-left font-medium">Restaurant</th>
                        <th className="py-3 px-4 text-left font-medium">Amount</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">
                            Order data would be displayed here
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-8">
            <h1 className="text-3xl font-bold">Review Management</h1>

            <Card>
              <CardHeader>
                <CardTitle>All Reviews</CardTitle>
                <CardDescription>Monitor and manage customer reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Restaurant</th>
                        <th className="py-3 px-4 text-left font-medium">Customer</th>
                        <th className="py-3 px-4 text-left font-medium">Rating</th>
                        <th className="py-3 px-4 text-left font-medium">Comment</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">
                            No reviews found
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">
                            Review data would be displayed here
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global settings for the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings options would be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

