"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// This component uses useSearchParams and will be wrapped in Suspense
function OtpVerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function verifyOtp() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Invalid OTP")

      toast.success("OTP Verified! You can now log in.")
      router.push("/loginSystem/login")
    } catch (error) {
      toast.error("Error", { description: error instanceof Error ? error.message : "Verification failed" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Verify OTP</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        We&apos;ve sent an OTP to <strong>{email}</strong>. Enter it below.
      </p>
      <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="mb-4" />
      <Button onClick={verifyOtp} className="w-full" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify & Login"}
      </Button>
    </div>
  )
}

// Main component that doesn't directly use useSearchParams
export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <OtpVerificationForm />
      </Suspense>
    </div>
  )
}
