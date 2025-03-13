import { type NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Define validation schema using Zod
const resetPasswordSchema = z.object({
  email: z.string().email().max(40, "Email cannot exceed 40 characters"), // Validate email format
  otp: z.string().length(6, "OTP must be exactly 6 digits"), // Ensure OTP is exactly 6 characters
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password cannot exceed 30 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body and validate input
    const body = await request.json();
    const parsedData = resetPasswordSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors[0].message }, { status: 400 });
    }

    let { email, otp, password } = parsedData.data;

    // Find the OTP verification record
    const otpVerification = await prisma.oTPVerification.findUnique({
      where: { email },
    });

    if (!otpVerification) {
      return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 });
    }

    // Check if OTP has expired
    if (new Date() > otpVerification.expiresAt) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one" }, { status: 400 });
    }

    // Verify OTP
    if (otpVerification.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the OTP verification record after use
    await prisma.oTPVerification.delete({ where: { email } });

    // Clear sensitive variables from memory
    email = otp = password = "";

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "An error occurred while resetting password" }, { status: 500 });
  }
}
