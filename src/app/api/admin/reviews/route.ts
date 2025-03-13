import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

