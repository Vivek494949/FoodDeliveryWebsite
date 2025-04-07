"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      router.push("/home")
      return
    }

    // Simulate a delay to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [orderId, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="mb-6 text-muted-foreground">Your payment was cancelled and you have not been charged.</p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href={`/restaurant/${orderId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Restaurant
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/home">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

