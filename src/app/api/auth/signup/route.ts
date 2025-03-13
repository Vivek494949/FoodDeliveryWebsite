import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { sendEmail } from "@/lib/mail"

// Define validation schema
const userSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const validationResult = userSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.errors },
        { status: 400 },
      )
    }

    const { firstName, lastName, email, username, password, phoneNumber } = validationResult.data

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUserByEmail) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUserByUsername) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 })
    }

    if (phoneNumber) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phoneNumber },
      })

      if (existingUserByPhone) {
        return NextResponse.json({ message: "User with this phone number already exists" }, { status: 409 })
      }
    }

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        phoneNumber,
        otp,
        isVerified: false,
        role: "user",
      },
    })

    // Send verification email with OTP
    try {
      await sendEmail(email, otp)
      console.log(`Verification email sent to ${email} with OTP: ${otp}`)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Continue with user creation even if email fails
    }

    // Return success response (excluding sensitive data)
    return NextResponse.json(
      {
        message: "User created successfully. Please check your email for verification.",
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

