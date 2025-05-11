"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, User, LogOut, ShoppingCart, ChevronDown, Star, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface Restaurant {
  id: string
  name: string
  city: string
  country: string
  cuisines: string
  imagePath: string | null
  rating: number | null
  estimatedTime: string
  deliveryPrice: number
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<{ firstName: string } | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
    }

    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setUserData(data)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    const fetchRestaurants = async () => {
      setIsLoadingRestaurants(true)
      try {
        const response = await fetch("/api/user/restaurants?limit=6")
        if (response.ok) {
          const data = await response.json()
          setRestaurants(data.restaurants)
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error)
      } finally {
        setIsLoadingRestaurants(false)
      }
    }

    if (status === "authenticated") {
      fetchUserData()
      fetchRestaurants()
    }
  }, [status, router, session])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=London`)
  }

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
            {/* Admin Dashboard button - only shown if user is admin */}
            {session?.user?.role === "admin" && (
              <Button variant="outline" onClick={() => router.push("/admin")}>
                Admin Dashboard
              </Button>
            )}

            {/* My Restaurant button */}
            <Button variant="outline" onClick={() => router.push("/my-restaurant")}>
              My Restaurant
            </Button>

            {/* User profile dropdown */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                      <Image src="/images/avatar.png" alt="User avatar" fill className="object-cover" />
                    </div>
                    <span className="font-medium hidden sm:inline-block">{session?.user?.name || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Info</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">
            Welcome {userData?.firstName || session?.user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-xl text-muted-foreground">What would you like to order today?</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for restaurants or food..."
                className="w-full rounded-lg border border-input bg-background px-10 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Restaurants Grid */}
        <h2 className="text-2xl font-bold mb-6">Popular Restaurants</h2>

        {isLoadingRestaurants ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="border rounded-lg p-4">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No restaurants available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <Link
                href={`/restaurant/${restaurant.id}`}
                key={restaurant.id}
                className="border rounded-lg overflow-hidden hover:border-primary transition-colors duration-300 hover:shadow-md"
              >
                <div className="relative h-40 w-full">
                  {restaurant.imagePath ? (
                    <Image
                      src={restaurant.imagePath || "/placeholder.svg"}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{restaurant.name}</h3>
                    {restaurant.rating && (
                      <div className="flex items-center bg-amber-100 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                        <span className="text-xs font-medium">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {restaurant.city}, {restaurant.country}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {restaurant.cuisines
                      .split(",")
                      .slice(0, 3)
                      .map((cuisine, index) => (
                        <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {cuisine.trim()}
                        </span>
                      ))}
                    {restaurant.cuisines.split(",").length > 3 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        +{restaurant.cuisines.split(",").length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{restaurant.estimatedTime}</span>
                    </div>
                    <div>Delivery: £{restaurant.deliveryPrice.toFixed(2)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

