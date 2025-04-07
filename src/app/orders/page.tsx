"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, ArrowLeft, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  restaurant: {
    name: string
    imagePath: string | null
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

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
    }

    const fetchOrders = async () => {
      if (session?.user?.id) {
        setIsLoading(true)
        try {
          const response = await fetch("/api/orders/user")
          if (response.ok) {
            const data = await response.json()
            setOrders(data)
          }
        } catch (error) {
          console.error("Error fetching orders:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status === "authenticated") {
      fetchOrders()
    }
  }, [status, router, session])

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <Button variant="ghost" onClick={() => router.push("/home")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
              <Button onClick={() => router.push("/home")}>Browse Restaurants</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{order.restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center">{getStatusBadge(order.status)}</div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="font-medium mb-2">Items</p>
                      <ul className="list-disc list-inside text-sm">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity}x {item.menuItem.name} - £{(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <p className="font-bold">Total: £{order.totalAmount.toFixed(2)}</p>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

