import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    console.log("Received OTP verification request:", {email,otp})

    // Check if OTP exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { otp: true },
    })
    console.log("Fetched user data:", user)

    if (!user || user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 })
    }

    // Mark user as verified (assuming there's a "verified" field)
    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null }, // Clear OTP after verification
    })

    return NextResponse.json({ message: "OTP verified successfully!" })
  } catch (error) {
    console.error("Error verifying OTP:", error) // log the error for debugging
    return NextResponse.json({ message: "Error verifying OTP" }, { status: 500 })
  }
}
