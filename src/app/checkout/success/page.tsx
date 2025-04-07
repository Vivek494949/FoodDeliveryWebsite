"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
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
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="mb-6 text-muted-foreground">
          Thank you for your order. Your payment has been processed successfully.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href={`/orders/${orderId}`}>
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/home">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

