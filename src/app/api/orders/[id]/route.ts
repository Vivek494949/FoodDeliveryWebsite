import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ✅ Correct context type is { params: Record<string, string> }
export async function GET(
  request: NextRequest,
  context: { params: Record<string, string> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // ⚠️ You can keep this await if you want, it doesn’t hurt
    const params = await context.params
    const { id: orderId } = params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            imagePath: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            country: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    if (order.user.id !== session.user.id) {
      return NextResponse.json({ message: "You are not authorized to view this order" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
