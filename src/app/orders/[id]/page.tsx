"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ShoppingBag, ArrowLeft, Clock, CheckCircle, XCircle, CreditCard, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  restaurant: {
    id: string
    name: string
    imagePath: string | null
  }
  items: {
    id: string
    quantity: number
    price: number
    menuItem: {
      name: string
      description: string | null
    }
  }[]
  user: {
    firstName: string
    lastName: string
    email: string
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    country: string | null
  }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
      return
    }

    const fetchOrder = async () => {
      if (!id || !session?.user?.id) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/user/Myorders/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Order not found")
          } else {
            const data = await response.json()
            setError(data.message || "Failed to load order details")
          }
          return
        }

        const data = await response.json()
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("An error occurred while loading the order details")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchOrder()
    }
  }, [id, status, session, router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return (
          <span className="flex items-center text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Awaiting Payment
          </span>
        )
      case "paid":
        return (
          <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Paid
          </span>
        )
      case "preparing":
        return (
          <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-2" />
            Preparing
          </span>
        )
      case "out_for_delivery":
        return (
          <span className="flex items-center text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-2" />
            Out for delivery
          </span>
        )
      case "delivered":
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Delivered
          </span>
        )
      case "cancelled":
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
            <XCircle className="h-4 w-4 mr-2" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-2" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
    }
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Link href="/home" className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">FoodExpress</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>

          <div className="max-w-4xl mx-auto text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The order you're looking for doesn't exist."}</p>
            <Button onClick={() => router.push("/orders")}>View All Orders</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/home" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">FoodExpress</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">
                Order #{order.id.slice(0, 8)} • {formatDate(order.createdAt)}
              </p>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="md:col-span-2 space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Restaurant</h3>
                    <p>{order.restaurant.name}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Items</h3>
                    <ul className="space-y-2">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <div>
                            <span className="font-medium">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            {item.menuItem.description && (
                              <p className="text-sm text-muted-foreground">{item.menuItem.description}</p>
                            )}
                          </div>
                          <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>£{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <User className="h-4 w-4 mr-2" />
                      Contact
                    </h3>
                    <p>
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>

                  {order.user.addressLine1 && (
                    <div>
                      <h3 className="font-medium flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        Address
                      </h3>
                      <p>{order.user.addressLine1}</p>
                      {order.user.addressLine2 && <p>{order.user.addressLine2}</p>}
                      <p>
                        {order.user.city}, {order.user.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about your order, please contact the restaurant directly.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/restaurant/${order.restaurant.id}`}>View Restaurant</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

