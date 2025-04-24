"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, ArrowLeft, MapPin, Plus, Minus, Trash2, Star, StarHalf, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  menu: MenuItem[]
  reviews: Review[]
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imagePath: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
  }
}

interface CartItem extends MenuItem {
  quantity: number
}

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  country: string | null
}

export default function RestaurantPage() {
  const { id } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Review state
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [userHasReviewed, setUserHasReviewed] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login")
    }

    const fetchRestaurant = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/restaurants/${id}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurant(data)

          // Check if the current user has already reviewed this restaurant
          if (session?.user?.id) {
            const hasReviewed = data.reviews.some((review: Review) => review.user.id === session.user.id)
            setUserHasReviewed(hasReviewed)
          }
        } else {
          toast({
            title: "Error",
            description: "Restaurant not found",
            variant: "destructive",
          })
          router.push("/home")
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setUserProfile(data)

            // Pre-fill checkout form
            setEmail(data.email || "")
            setName(`${data.firstName} ${data.lastName}` || "")
            setAddressLine1(data.addressLine1 || "")
            setAddressLine2(data.addressLine2 || "")
            setCity(data.city || "")
            setCountry(data.country || "")
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    if (status === "authenticated") {
      fetchRestaurant()
      fetchUserProfile()
    }
  }, [id, status, router, session])

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })

    toast({
      title: "Item added",
      description: `Added ${item.name} to your order`,
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const deliveryFee = restaurant?.deliveryPrice || 0
    return subtotal + deliveryFee
  }

  const handleCheckout = async () => {
    if (!session?.user?.id || !restaurant) return

    setIsSubmitting(true)

    try {
      // Create a checkout session with Stripe
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          restaurantId: restaurant.id,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: calculateTotal(),
          deliveryDetails: {
            name,
            email,
            addressLine1,
            addressLine2,
            city,
            country,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create checkout session")
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!session?.user?.id || !restaurant || reviewRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingReview(true)

    try {
      const response = await fetch(`/api/restaurants/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
        }),
      })

      if (response.ok) {
        const newReview = await response.json()

        // Update the restaurant state with the new review
        setRestaurant((prev) => {
          if (!prev) return prev

          const updatedReviews = [newReview, ...prev.reviews]

          // Calculate new average rating
          const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0)
          const newAverageRating = totalRating / updatedReviews.length

          return {
            ...prev,
            reviews: updatedReviews,
            rating: newAverageRating,
          }
        })

        // Reset form
        setReviewRating(0)
        setReviewComment("")
        setUserHasReviewed(true)

        toast({
          title: "Success",
          description: "Your review has been submitted!",
        })
      } else {
        const error = await response.json()
        if (error.message === "You have already reviewed this restaurant") {
    toast({
      title: "Review already submitted",
      description: "You've already submitted a review for this restaurant.",
    })
    setUserHasReviewed(true)
    return
  }
        throw new Error(error.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Review submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)
    }

    return stars
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <Button onClick={() => router.push("/home")}>Go back home</Button>
        </div>
      </div>
    )
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

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search results
        </Button>
      </div>

      {/* Restaurant Banner */}
      <div className="relative w-full h-64 md:h-80">
        <Image
          src={restaurant.imagePath || "/placeholder.svg?height=320&width=1200&text=Restaurant"}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
            {restaurant.rating && (
              <div className="flex items-center bg-black/30 px-2 py-1 rounded-md">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {restaurant.city}, {restaurant.country}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {restaurant.cuisines.split(",").map((cuisine, index) => (
              <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                {cuisine.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Section */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-2xl font-bold mb-6">Menu</h2>

            {/* Group menu items by category */}
            {restaurant.menu.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No menu items available</p>
              </div>
            ) : (
              (() => {
                // Group items by category
                const categories = restaurant.menu.reduce(
                  (acc, item) => {
                    const category = item.category || "Other"
                    if (!acc[category]) {
                      acc[category] = []
                    }
                    acc[category].push(item)
                    return acc
                  },
                  {} as Record<string, MenuItem[]>,
                )

                return Object.entries(categories).map(([category, items]) => (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{category}</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start p-4 border rounded-lg hover:border-primary transition-colors duration-300"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-4">£{item.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="h-8 bg-orange-500 hover:bg-orange-600"
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Add to order</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()
            )}

            {/* Reviews Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>

              {/* Review Form */}
              {status === "authenticated" && !userHasReviewed && (
                <div className="mb-8 p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              rating <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="comment" className="text-sm text-muted-foreground mb-2 block">
                      Comment (optional)
                    </label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience with this restaurant..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="resize-none"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview || reviewRating === 0}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isSubmittingReview ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Reviews List */}
              {restaurant.reviews && restaurant.reviews.length > 0 ? (
                <div className="space-y-6">
                  {restaurant.reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.user.profileImage || undefined} />
                            <AvatarFallback>
                              {review.user.firstName.charAt(0)}
                              {review.user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {review.user.firstName} {review.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      {review.comment && <p className="mt-4 text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-20 bg-card rounded-lg border p-6">
            {userProfile && (
              <div className="text-sm text-muted-foreground mb-4">
                  Delivering to: {userProfile.addressLine1}, {userProfile.city}, {userProfile.country}
              </div>
            )}
              <h2 className="text-2xl font-bold mb-4">Your Order</h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Your order is empty</p>
                  <p className="text-sm">Add items from the menu to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="flex items-center border rounded-md mr-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none rounded-l-md"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                              <span className="sr-only">Decrease</span>
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none rounded-r-md"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Increase</span>
                            </Button>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">£{item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-3">£{(item.price * item.quantity).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>£{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>£{restaurant.deliveryPrice.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>£{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
                    size="lg"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Go to checkout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Delivery Details</DialogTitle>
            <DialogDescription>Please review your delivery information before proceeding to payment.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="col-span-2">
                <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
                  Address Line 1
                </label>
                <Input
                  id="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
                  Address Line 2 (Optional)
                </label>
                <Input
                  id="addressLine2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt 4B"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City
                </label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">
                  Country
                </label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United Kingdom"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600">
              {isSubmitting ? "Processing..." : "Continue to payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

