"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  ShoppingBag,
  LogOut,
  Save,
  Loader2,
  Plus,
  Trash2,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  User,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Define the schema for restaurant details
const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  deliveryPrice: z.coerce.number().min(0, "Delivery price must be a positive number"),
  estimatedTime: z.string().min(1, "Estimated time is required"),
  cuisines: z.array(z.string()).min(1, "Select at least one cuisine"),
})

// Define the schema for menu items
const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Dish name must be at least 2 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
})

const menuSchema = z.array(menuItemSchema)

type RestaurantFormValues = z.infer<typeof restaurantSchema>
type MenuItem = z.infer<typeof menuItemSchema>

// List of available cuisines
const availableCuisines = [
  "Italian",
  "Chinese",
  "Japanese",
  "Indian",
  "Mexican",
  "Thai",
  "American",
  "French",
  "Mediterranean",
  "Greek",
  "Spanish",
  "Turkish",
  "Korean",
  "Vietnamese",
  "Lebanese",
  "Brazilian",
  "Peruvian",
  "Ethiopian",
  "Moroccan",
  "German",
]

// Order interface
interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    country: string | null
  }
  items: {
    id: string
    quantity: number
    price: number
    menuItem: {
      name: string
    }
  }[]
}

interface Restaurant {
  id: string
  name: string
  city: string
  country: string
  deliveryPrice: number
  estimatedTime: string
  cuisines: string
  imagePath?: string
  menu: MenuItem[]
}

export default function MyRestaurantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("manage")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState<string | null>(null)

  // Initialize the form
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      city: "",
      country: "",
      deliveryPrice: 0,
      estimatedTime: "",
      cuisines: [],
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
    }

    const fetchRestaurantData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/MyRestaurant/manageRestaurant/${session.user.id}`)

          if (response.ok) {
            const data = await response.json()
            setRestaurant(data)

            // Set form values
            form.reset({
              name: data.name || "",
              city: data.city || "",
              country: data.country || "",
              deliveryPrice: data.deliveryPrice || 0,
              estimatedTime: data.estimatedTime || "",
              cuisines: data.cuisines ? data.cuisines.split(",") : [],
            })

            // Set menu items
            if (data.menu) {
              setMenuItems(data.menu)
            }

            // Set image preview
            if (data.imagePath) {
              setImagePreview(data.imagePath)
            }
          } else if (response.status !== 404) {
            // Only show error if it's not a 404 (no restaurant found)
            toast.error("Failed to load restaurant data")
          }
        } catch (error) {
          console.error("Error fetching restaurant data:", error)
          toast.error("An error occurred while loading your restaurant")
        } finally {
          setIsLoading(false)
        }
      }
    }

    const fetchOrders = async () => {
      if (restaurant?.id) {
        try {
          const response = await fetch(`/api/MyRestaurant/MyOrders/${restaurant.id}`)
          if (response.ok) {
            const data = await response.json()
            setOrders(data)
          }
        } catch (error) {
          console.error("Error fetching orders:", error)
        }
      }
    }

    if (status === "authenticated") {
      fetchRestaurantData()
    }

    if (restaurant?.id && activeTab === "orders") {
      fetchOrders()
    }
  }, [status, router, session, form, restaurant?.id, activeTab])

  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { name: "", price: 0 }])
  }

  const handleRemoveMenuItem = (index: number) => {
    const updatedItems = [...menuItems]
    updatedItems.splice(index, 1)
    setMenuItems(updatedItems)
  }

  const handleMenuItemChange = (index: number, field: keyof MenuItem, value: string | number) => {
    const updatedItems = [...menuItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setMenuItems(updatedItems)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create a local preview
      setImagePreview(URL.createObjectURL(file))

      //Upload to Cloudinary immediately if desired
      await uploadImageToCloudinary(file)
    }
  }

  const uploadImageToCloudinary = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      setImagePreview(data.url)
      toast.success("Image uploaded successfully")
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(data: RestaurantFormValues) {
    setIsSaving(true)

    try {
      // Validate menu items
      const menuValidation = menuSchema.safeParse(menuItems)
      if (!menuValidation.success) {
        throw new Error("Please check your menu items for errors")
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("city", data.city)
      formData.append("country", data.country)
      formData.append("deliveryPrice", data.deliveryPrice.toString())
      formData.append("estimatedTime", data.estimatedTime)
      formData.append("cuisines", data.cuisines.join(","))
      formData.append("menu", JSON.stringify(menuItems))

      if (imageFile) {
        formData.append("image", imageFile)
      }

      // Determine if we're creating or updating
      const method = restaurant ? "PATCH" : "POST"
      const url = restaurant ? `/api/MyRestaurant/manageRestaurant/${restaurant.id}` : "/api/MyRestaurant"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save restaurant")
      }

      const result = await response.json()
      setRestaurant(result.restaurant)

      toast.success(restaurant ? "Restaurant updated successfully" : "Restaurant created successfully")
    } catch (error) {
      console.error("Save restaurant error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save restaurant")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingOrderStatus(orderId)

    try {
      const response = await fetch(`/api/user/Myorders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update the order status in the local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      toast.success("Order status updated successfully")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setIsUpdatingOrderStatus(null)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return (
          <span className="flex items-center text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs">
            <CreditCard className="h-3 w-3 mr-1" />
            Awaiting Payment
          </span>
        )
      case "paid":
        return (
          <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </span>
        )
      case "preparing":
        return (
          <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Preparing
          </span>
        )
      case "out_for_delivery":
        return (
          <span className="flex items-center text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Out for delivery
          </span>
        )
      case "delivered":
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </span>
        )
      case "cancelled":
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left side - Brand */}
          <div className="flex items-center gap-2">
            <Link href="/home" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">FoodExpress</span>
            </Link>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/home")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>

            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Restaurant</h1>

        <Tabs defaultValue="manage" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="manage">Manage Restaurant</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <div className="max-w-4xl mx-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Section 1: Restaurant Details */}
                  <div className="space-y-6 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold">Restaurant Details</h2>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="deliveryPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Price (£)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Delivery Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 20-30 min" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 2: Cuisines Selection */}
                  <div className="space-y-6 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold">Cuisines</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the types of cuisines your restaurant offers.
                    </p>

                    <FormField
                      control={form.control}
                      name="cuisines"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {availableCuisines.map((cuisine) => (
                              <FormField
                                key={cuisine}
                                control={form.control}
                                name="cuisines"
                                render={({ field }) => {
                                  return (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(cuisine)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, cuisine])
                                              : field.onChange(field.value?.filter((value) => value !== cuisine))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">{cuisine}</FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Menu Management */}
                  <div className="space-y-6 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold">Menu Management</h2>
                    <Button type="button" onClick={handleAddMenuItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                    {menuItems.map((item, index) => (
                      <div key={index} className="flex items-end space-x-4">
                        <FormItem className="flex-1">
                          <FormLabel>Dish Name</FormLabel>
                          <FormControl>
                            <Input
                              value={item.name}
                              onChange={(e) => handleMenuItemChange(index, "name", e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                        <FormItem className="flex-1">
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleMenuItemChange(index, "price", Number.parseFloat(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                        <FormItem className="flex-1">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              value={item.description}
                              onChange={(e) => handleMenuItemChange(index, "description", e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                        <Button type="button" variant="destructive" onClick={() => handleRemoveMenuItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Restaurant Profile Image */}
                  <div className="space-y-6 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold">Restaurant Profile Image</h2>
                    {imagePreview && (
                      <div className="w-full h-48 relative mb-4">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Restaurant"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <FormItem>
                      <FormLabel>Upload Image</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                      </FormControl>
                      {isUploading && (
                            <div className="text-sm text-muted-foreground mt-2">Uploading image...</div>
                      )}
                    </FormItem>
                  </div>

                  {/* Section 3: Save Changes */}
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-6">Restaurant Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>

                        {/* Status update dropdown */}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <div className="flex items-center gap-2">
                            <Select
                              defaultValue={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                              disabled={isUpdatingOrderStatus === order.id}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                {order.status === "pending_payment" && (
                                  <SelectItem value="paid">Mark as Paid</SelectItem>
                                )}
                                {(order.status === "pending_payment" || order.status === "paid") && (
                                  <SelectItem value="preparing">Preparing</SelectItem>
                                )}
                                {(order.status === "pending_payment" ||
                                  order.status === "paid" ||
                                  order.status === "preparing") && (
                                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                )}
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>

                            {isUpdatingOrderStatus === order.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {/* Customer details */}
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <h3 className="font-medium mb-2 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Customer Details
                          </h3>
                          <p className="text-sm">
                            <span className="font-medium">Name:</span> {order.user.firstName} {order.user.lastName}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {order.user.email}
                          </p>
                          {order.user.addressLine1 && (
                            <div className="mt-2 text-sm">
                              <p className="font-medium flex items-center mb-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                Delivery Address:
                              </p>
                              <p>{order.user.addressLine1}</p>
                              {order.user.addressLine2 && <p>{order.user.addressLine2}</p>}
                              <p>
                                {order.user.city}, {order.user.country}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Order items */}
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Order Items</h3>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {order.items.map((item) => (
                              <li key={item.id}>
                                {item.quantity}x {item.menuItem.name} - £{(item.price * item.quantity).toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <p className="font-bold">Total: £{order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

