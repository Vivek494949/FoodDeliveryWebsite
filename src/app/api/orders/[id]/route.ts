import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // const params = await context.params;
    // const {id:orderId} = params
    const { id: orderId } = await context.params

    // Fetch the order with related data
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
            id :true,
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

    // Check if the user is authorized to view this order
    // Users can only view their own orders
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

