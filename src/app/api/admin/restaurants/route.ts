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

    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

