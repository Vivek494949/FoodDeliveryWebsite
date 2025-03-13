import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Define validation schema
const verifySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const validationResult = verifySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.errors },
        { status: 400 },
      )
    }

    const { email, otp } = validationResult.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json({ message: "User is already verified" }, { status: 400 })
    }

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 })
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null, // Clear OTP after verification
      },
    })

    // Return success response
    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

