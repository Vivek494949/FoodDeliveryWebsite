import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const params = await context.params;
    const {id :restaurantId} = params

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        menu: {
          where: { availability: true },
          orderBy: { category: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Error fetching restaurant:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

