"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  MapPin,
  Filter,
  SlidersHorizontal,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Types
interface Restaurant {
  id: string
  name: string
  city: string
  country: string
  cuisines: string
  deliveryPrice: number
  estimatedTime: string
  imagePath: string | null
  rating: number | null
}

export default function SearchPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const location = searchParams.get("location") || "London"

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(query)
  const [searchLocation, setSearchLocation] = useState(location)
  const [cuisineFilters, setCuisineFilters] = useState<string[]>([])
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([])
  const [showMoreCuisines, setShowMoreCuisines] = useState(false)
  const [sortOption, setSortOption] = useState("bestMatch")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [availableCities, setAvailableCities] = useState<string[]>([])


  const resultsPerPage = 10
  
  useEffect(() => {
  const fetchCities = async () => {
    try {
      const response = await fetch("/api/user/search/fetchcities")
      const data = await response.json()
      setAvailableCities(data)

      // If no location is selected, default to first city
      if (!searchLocation && data.length > 0) {
        setSearchLocation(data[0])
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    }
  }

  if (status === "authenticated") {
    fetchCities()
  }
}, [status])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
    }

    const fetchRestaurants = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/user/search?q=${query}&location=${location}`)
        if (response.ok) {
            const data: Restaurant[] = await response.json()

          setRestaurants(data)
          setFilteredRestaurants(data)

          // Extract unique cuisines from all restaurants
          const allCuisines = data.flatMap((restaurant: Restaurant) =>
            restaurant.cuisines.split(",").map((cuisine) => cuisine.trim()),
          )
          const uniqueCuisines = [...new Set(allCuisines)].sort()
          setAvailableCuisines(uniqueCuisines)

          // Calculate total pages
          setTotalPages(Math.ceil(data.length / resultsPerPage))
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchRestaurants()
    }
  }, [query, location, status, router])

  useEffect(() => {
    // Apply filters and sorting
    let results = [...restaurants]

    // Apply cuisine filters
    if (cuisineFilters.length > 0) {
      results = results.filter((restaurant) =>
        cuisineFilters.some((cuisine) => restaurant.cuisines.toLowerCase().includes(cuisine.toLowerCase())),
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "deliveryPrice":
        results.sort((a, b) => a.deliveryPrice - b.deliveryPrice)
        break
      case "estimatedTime":
        results.sort((a, b) => {
          const timeA = Number.parseInt(a.estimatedTime.split(" ")[0] || "0")
          const timeB = Number.parseInt(b.estimatedTime.split(" ")[0] || "0")
          return timeA - timeB
        })
        break
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // Best match is default (no additional sorting)
        break
    }

    setFilteredRestaurants(results)
    setTotalPages(Math.ceil(results.length / resultsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [restaurants, cuisineFilters, sortOption])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`)
  }

  const toggleCuisineFilter = (cuisine: string) => {
    setCuisineFilters((prev) => (prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]))
  }

  const resetFilters = () => {
    setCuisineFilters([])
    setSortOption("bestMatch")
  }

  const displayedCuisines = showMoreCuisines ? availableCuisines : availableCuisines.slice(0, 8)

  // Get current page of restaurants
  const currentRestaurants = filteredRestaurants.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="h-6 w-6 text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl">FoodExpress</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-muted py-4 border-b">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Cuisine or Restaurant Name"
                className="w-full rounded-lg border border-input bg-background px-10 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative w-1/3">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Select value={searchLocation} onValueChange={setSearchLocation}>
  <SelectTrigger className="w-full border border-input bg-background px-10 py-3 h-[46px] text-sm">
    <SelectValue placeholder="Select a city" />
  </SelectTrigger>
  <SelectContent>
    {isLoading ? (
      <SelectItem value="loading">Loading cities...</SelectItem>
    ) : (
      availableCities.map((city) => (
        <SelectItem key={city} value={city}>
          {city}
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>

            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filters Toggle */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </span>
              {showMobileFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Filters Sidebar */}
          <div className={`${showMobileFilters ? "block" : "hidden"} md:block md:w-1/4 lg:w-1/5`}>
            <div className="bg-card rounded-lg border p-4 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Filter By Cuisine</h2>
                {cuisineFilters.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs text-blue-500">
                    Reset Filters
                  </Button>
                )}
              </div>

              <div className="mb-6">
                <div className="space-y-2">
                  {isLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-24 rounded" />
                        </div>
                      ))
                  ) : (
                    <>
                      {displayedCuisines.map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cuisine-${cuisine}`}
                            checked={cuisineFilters.includes(cuisine)}
                            onCheckedChange={() => toggleCuisineFilter(cuisine)}
                          />
                          <label
                            htmlFor={`cuisine-${cuisine}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cuisine}
                          </label>
                        </div>
                      ))}

                      {availableCuisines.length > 8 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs text-blue-500"
                          onClick={() => setShowMoreCuisines(!showMoreCuisines)}
                        >
                          {showMoreCuisines ? "Show Less" : "View More"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    `${filteredRestaurants.length} Restaurants found in ${location}`
                  )}
                </h1>
                <Button variant="link" className="p-0 h-auto text-blue-500" onClick={() => setSearchLocation("")}>
                  Change Location
                </Button>
              </div>

              <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <div className="flex items-center">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bestMatch">Best Match</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="deliveryPrice">Delivery Price</SelectItem>
                    <SelectItem value="estimatedTime">Delivery Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Restaurant Listings */}
            <div className="space-y-4">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-32 w-full sm:w-32 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))
              ) : currentRestaurants.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No restaurants found matching your criteria.</p>
                  <Button onClick={resetFilters} className="bg-orange-500 hover:bg-orange-600">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                currentRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:border-primary transition-colors duration-300 hover:shadow-md cursor-pointer"
                    onClick={() => router.push(`/restaurant/${restaurant.id}`)}
                  >
                    <div className="h-32 w-full sm:w-32 relative rounded-md overflow-hidden">
                      <Image
                        src={restaurant.imagePath || "/placeholder.svg?height=128&width=128&text=Restaurant"}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{restaurant.name}</h2>
                      <div className="flex flex-wrap gap-1 my-1">
                        {restaurant.cuisines.split(",").map((cuisine, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                            {cuisine.trim()}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {restaurant.city}, {restaurant.country}
                        </div>
                        <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-orange-500" />
                            {restaurant.estimatedTime}
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 mr-1 text-orange-500" />
                            Delivery from £{restaurant.deliveryPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && filteredRestaurants.length > 0 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

