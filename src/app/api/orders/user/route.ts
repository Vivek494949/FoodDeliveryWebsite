import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all orders for the user
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: {
          select: {
            name: true,
            imagePath: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

